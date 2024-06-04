import { ResponseData, RequestSpec, GotRequest, TestResult, SpecResult } from "zzapi";
import { constructGotRequest, executeGotRequest } from "zzapi";
import { runAllTests } from "zzapi";
import { captureVariables } from "zzapi";
import { replaceVariablesInRequest } from "zzapi";

import { getVarStore } from "./variables";
import {
  C_ERR,
  C_ERR_INFO,
  C_ERR_TEXT,
  C_LOADING,
  C_SUC,
  C_SUC_TEXT,
  C_TIME,
  C_WARN,
  C_WARN_TEXT,
  C_SPEC,
  C_SKIP,
  C_SKIP_TEXT,
} from "./utils/colours";
import { getStatusCode } from "./utils/errors";
import { replaceFileContents } from "./fileContents";

function formatTestResults(results: TestResult[], spec?: string, skip?: boolean): string[] {
  const resultLines: string[] = [];
  for (const r of results) {
    const testContent = `test ${spec ?? ":"}: expected ${r.op}: ${r.expected}`;
    let line: string;
    if (skip) {
      line = C_SKIP(`[SKIP] `) + C_SKIP_TEXT(testContent);
    } else {
      if (r.pass) {
        line = C_SUC(`[INFO] `) + C_SUC_TEXT(`${testContent} OK`);
      } else {
        line = C_ERR(`[FAIL] `) + C_ERR_TEXT(`${testContent} | got ${r.received}`);
      }
      if (r.message) line += C_ERR_INFO(`[${r.message}]`);
    }

    resultLines.push(line);
  }
  return resultLines;
}

function getPassData(res: SpecResult): [number, number, boolean] {
  const rootResults = res.results;
  let passed = rootResults.filter((r) => r.pass).length,
    all = rootResults.length;

  let hasSkip: boolean = res.skipped ?? false;
  for (const s of res.subResults) {
    const [subPassed, subAll, subSkip] = getPassData(s);
    passed += subPassed;
    all += subAll;
    hasSkip = hasSkip || subSkip;
  }

  return [passed, all, hasSkip];
}

function getStatusString(
  passed: number,
  all: number,
  method: string,
  name: string,
  status: number | undefined,
  size: number,
  execTime: string | number,
): string {
  const passRatio = all === 0 ? "" : `tests: ${passed}/${all} passed`;
  const summaryString = `${method} ${name} status: ${status} size: ${size} B time: ${execTime} ${passRatio}`;

  const time = C_TIME(`${new Date().toLocaleString()}`);
  return (
    time + (all === passed ? C_SUC(` [INFO]  ${summaryString}`) : C_ERR(` [ERROR] ${summaryString}`))
  );
}

function getFlatResult(
  specRes: SpecResult,
  method: string,
  name: string,
  status: number | undefined,
  size: number,
  execTime: string | number,
): [string, number, number] {
  const [passed, all, hasSkip] = getPassData(specRes);
  if (passed === all && !hasSkip)
    return [getStatusString(passed, all, method, name, status, size, execTime), passed, all];

  function getResult(res: SpecResult, preSpec?: string): string {
    const getFullSpec = (): string => {
      if (!res.spec) return "";
      return (preSpec ? preSpec + " / " : "") + res.spec;
    };

    const spec = getFullSpec();
    const resultLines = formatTestResults(res.results, spec, res.skipped).map((r) => "\t" + r);
    const subResultLines = [];
    for (const s of res.subResults) {
      const subRes = getResult(s, spec);
      if (subRes) subResultLines.push(subRes);
    }

    return [...resultLines, ...subResultLines].join("\n");
  }

  const statusString = getStatusString(passed, all, method, name, status, size, execTime);
  return [statusString + "\n" + getResult(specRes), passed, all];
}

function getIndentedResult(
  specRes: SpecResult,
  method: string,
  name: string,
  status: number | undefined,
  size: number,
  execTime: string | number,
): [string, number, number] {
  const [passed, all, hasSkip] = getPassData(specRes);
  if (passed === all && !hasSkip)
    return [getStatusString(passed, all, method, name, status, size, execTime), passed, all];

  function getResult(res: SpecResult, indent: number = 1): string {
    if (passed === all) return "";

    const specName = C_SPEC(res.spec ? "\t".repeat(indent - 1) + res.spec : "");
    const testResults = formatTestResults(res.results)
      .map((r) => "\t".repeat(indent) + r)
      .join("\n");

    const subRes: string[] = [];
    for (const s of res.subResults) subRes.push(getResult(s, indent + 1));
    const subResString = subRes.join("\n");

    const dataElems: string[] = [];
    if (specName.length > 0) dataElems.push(specName);
    if (testResults.length > 0) dataElems.push(testResults);
    if (subResString.length > 0) dataElems.push(subResString);

    return dataElems.join("\n");
  }

  const statusString = getStatusString(passed, all, method, name, status, size, execTime);
  return [statusString + "\n" + getResult(specRes), passed, all];
}

function getRequestResult(
  specRes: SpecResult,
  method: string,
  name: string,
  status: number | undefined,
  size: number,
  execTime: string | number,
  indent: boolean,
): [string, number, number] {
  return indent
    ? getIndentedResult(specRes, method, name, status, size, execTime)
    : getFlatResult(specRes, method, name, status, size, execTime);
}

export async function allRequestsWithProgress(
  allRequests: {
    [name: string]: RequestSpec;
  },
  bundlePath: string,
  indent: boolean,
): Promise<Array<{ name: string; response: ResponseData }>> {
  let currHttpRequest: GotRequest;
  let responses: Array<{ name: string; response: ResponseData }> = [];

  for (const name in allRequests) {
    let requestData = allRequests[name];
    const method = requestData.httpRequest.method;

    requestData.httpRequest.body = replaceFileContents(requestData.httpRequest.body, bundlePath);
    const undefs = replaceVariablesInRequest(requestData, getVarStore().getAllVariables());
    currHttpRequest = constructGotRequest(requestData);

    const reqNameMessage = `Running ${name}`;
    process.stderr.write(C_LOADING(`${reqNameMessage}\r`));
    let dots = "";
    let reqTimer = setInterval(() => {
      dots += ".";
      process.stderr.write(C_LOADING(`\r${reqNameMessage}${dots}`));
    }, 1000);

    const {
      response: httpResponse,
      executionTime: executionTime,
      byteLength: size,
      error: error,
    } = await executeGotRequest(currHttpRequest);

    clearInterval(reqTimer);
    process.stderr.write(`\r`);

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
      process.stderr.write(`${message}\n`);
      process.exitCode = getStatusCode() + 1;
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
          `${method} ${name} status: ${status} size: ${size} B time: ${et} parse error(${parseError})`,
        );
      process.stderr.write(`${message}\n`);
      process.exitCode = getStatusCode() + 1;
      continue;
    }

    const results = runAllTests(requestData.tests, response, requestData.options.stopOnFailure);
    let [message, passed, all] = getRequestResult(results, method, name, status, size, et, indent);
    // console.log(message);
    if (passed !== all) process.exitCode = getStatusCode() + 1;

    const captureOutput = captureVariables(requestData, response);
    const capturedVariables = captureOutput.capturedVars;
    const capturedErrors = captureOutput.captureErrors;
    getVarStore().mergeCapturedVariables(capturedVariables);
    if (capturedErrors) {
      message += C_ERR(`${capturedErrors}`);
    }
    if (undefs.length > 0) {
      message +=
        `\t` +
        C_WARN(`[WARN]`) +
        C_WARN_TEXT(`  Undefined variable(s): ${undefs.join(",")}. Did you choose an env?`);
    }

    process.stderr.write(`${message}\n`);
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
  for (let i = 0; i < numElement - 1; i += 2)
    formattedString += `  ${rawHeaders[i]} : ${getStrictStringValue(rawHeaders[i + 1])}\n`;

  return `\n  ${formattedString.trim()}`;
}
