import { ResponseData, RequestSpec, GotRequest, TestResult } from "zzapi";
import { constructGotRequest, executeGotRequest } from "zzapi";
import { runAllTests } from "zzapi";
import { captureVariables } from "zzapi";
import { replaceVariablesInRequest } from "zzapi";

import { getVarStore } from "./variables";
import {
  C_ERR,
  C_ERR_TEXT,
  C_LOADING,
  C_SUC,
  C_SUC_TEXT,
  C_TIME,
  C_WARN,
  C_WARN_TEXT,
} from "./utils/colours";
import { setStatusCode, statusCode } from "./utils/errors";

function formatTestResults(results: TestResult[]): string {
  const resultLines: string[] = [];
  for (const r of results) {
    let line: string;
    if (r.pass) {
      line = `\t` + C_SUC(`[INFO]`) + C_SUC_TEXT(` test ${r.spec}: expected ${r.op}: ${r.expected} OK`);
    } else {
      line =
        `\t` +
        C_ERR(`[FAIL]`) +
        C_ERR_TEXT(` test ${r.spec}: expected ${r.op}: ${r.expected} | got ${r.received}`);
    }
    if (r.message) {
      line = `${line} [${r.message}]`;
    }
    resultLines.push(line);
  }
  return resultLines.join("\n");
}

export async function allRequestsWithProgress(allRequests: {
  [name: string]: RequestSpec;
}): Promise<Array<{ name: string; response: ResponseData }>> {
  let currHttpRequest: GotRequest;
  let responses: Array<{ name: string; response: ResponseData }> = [];

  for (const name in allRequests) {
    const reqNameMessage = `Running ${name}`;
    process.stderr.write(C_LOADING(`${reqNameMessage}\r`));
    let dots = "";
    let reqTimer = setInterval(() => {
      dots += ".";
      process.stderr.write(C_LOADING(`\r${reqNameMessage}${dots}`));
    }, 1000);

    let requestData = allRequests[name];
    const method = requestData.httpRequest.method;

    const undefs = replaceVariablesInRequest(requestData, getVarStore().getAllVariables());
    currHttpRequest = constructGotRequest(requestData);

    const {
      response: httpResponse,
      executionTime: executionTime,
      byteLength: size,
      error: error,
    } = await executeGotRequest(currHttpRequest);

    clearInterval(reqTimer);

    const response: ResponseData = {
      executionTime: executionTime + " ms",
      status: httpResponse.statusCode,
      body: httpResponse.body,
      rawHeaders: getHeadersAsString(httpResponse.rawHeaders),
      headers: httpResponse.headers,
      json: null,
    };

    if (error) {
      let message =
        C_TIME(`${new Date().toLocaleString()} `) +
        C_ERR(`[ERROR]`) +
        C_ERR_TEXT(` ${method} ${name} Error executing request: ${error})`);
      if (undefs.length > 0) {
        message +=
          `\n\t` +
          C_WARN(`[warn]`) +
          C_WARN_TEXT(` Undefined variable(s): ${undefs.join(",")}. Did you choose an env?`);
      }
      process.stderr.write(`\r${message}\n`);
      setStatusCode(statusCode + 1);
      continue;
    }

    // If no error, we can assume response is there and can be shown
    responses.push({ name: name, response: response });

    let parseError = "";
    if (requestData.expectJson && response.status) {
      if (!response.body) {
        parseError = "No response body";
      } else {
        try {
          response.json = JSON.parse(response.body as string);
        } catch (err) {
          if (err instanceof Error) {
            parseError = err.message;
          } else {
            parseError = "Error parsing the response body: ${err}";
          }
        }
      }
    }

    const status = response.status;
    const et = response.executionTime;
    if (parseError) {
      const message =
        C_TIME(`${new Date().toLocaleString()}`) +
        C_ERR(` [ERROR] `) +
        C_ERR_TEXT(
          `${method} ${name} status: ${status} size: ${size} B time: ${et} parse error(${parseError})`
        );
      process.stderr.write(`\r${message}\n`);
      setStatusCode(statusCode + 1);
      continue;
    }

    const results = runAllTests(requestData.tests, response);
    const passed = results.filter((r) => r.pass).length;
    const all = results.length;

    let message: string = "";
    if (all == passed) {
      message += C_TIME(`${new Date().toLocaleString()}`) + C_SUC(` [INFO]  `);
    } else {
      message += C_TIME(`${new Date().toLocaleString()}`) + C_ERR(` [ERROR] `);
    }
    let testString = all == 0 ? "" : `tests: ${passed}/${all} passed`;
    testString = passed === all ? C_SUC_TEXT(testString) : C_ERR_TEXT(testString);
    let summaryString = `${method} ${name} status: ${status} size: ${size} B time: ${et} ${testString}\n`;
    message += passed === all ? C_SUC_TEXT(summaryString) : C_ERR_TEXT(summaryString);

    if (all != passed) {
      message += formatTestResults(results) + "\n";
      setStatusCode(statusCode + 1);
    }

    const captureOutput = captureVariables(requestData, response);
    const capturedVariables = captureOutput.capturedVars;
    const capturedErrors = captureOutput.captureErrors;
    getVarStore().mergeCapturedVariables(capturedVariables);
    if (capturedErrors) {
      message += C_ERR(`${capturedErrors}`) + "\n";
    }
    if (undefs.length > 0) {
      message +=
        `\t` +
        C_WARN(`[WARN]`) +
        C_WARN_TEXT(`  Undefined variable(s): ${undefs.join(",")}. Did you choose an env?\n`);
    }

    process.stderr.write(`\r${message}`);
  }
  return responses;
}

function getStrictStringValue(value: any): string {
  if (value === undefined) {
    return "undefined";
  } else if (typeof value === "object") {
    return JSON.stringify(value);
  } else {
    return value.toString();
  }
}

function getHeadersAsString(rawHeaders: string[]): string {
  let formattedString = "\n";
  if (rawHeaders === undefined) {
    return formattedString;
  }

  const numElement = rawHeaders.length;
  for (let i = 0; i < numElement - 1; i += 2) {
    formattedString += `  ${rawHeaders[i]} : ${getStrictStringValue(rawHeaders[i + 1])}\n`;
  }

  formattedString = formattedString.trim();
  return `\n  ${formattedString}`;
}
