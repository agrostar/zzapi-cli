import { ResponseData, RequestSpec, GotRequest, TestResult, SpecResult } from "zzapi";
import { constructGotRequest, executeGotRequest } from "zzapi";
import { runAllTests } from "zzapi";
import { captureVariables } from "zzapi";
import { replaceVariablesInRequest } from "zzapi";

import { getVarStore } from "./variables";
import {
  C_ERR,  
  C_ERR_TEXT,
  C_LOADING,
  C_STATUS,
  C_SUC,
  C_SUC_TEXT,
  C_TEXT_BOLD,
  C_TEXT,
  C_TIME,
  C_WARN,
  C_WARN_TEXT,
  C_WARN_TOKENS,
  C_OP,
  C_SKIP,
  C_SPEC,
} from "./utils/colours";
import { getStatusCode } from "./utils/errors";
import { replaceFileContents } from "./fileContents";
import path from "path";

const requestDetailInset = " ".repeat(new Date().toLocaleString().length + 3);

function formatRoute(bundleName: string, method: string, name: string, status: number | undefined, et: string | number, size: number, passedCount: number, allCount: number) {
  let line = C_TIME(`${new Date().toLocaleString()}`);
  if (allCount === passedCount) {
    // Success!
    line += C_SUC(" ✓ ")
      + C_TEXT_BOLD(bundleName)
      + C_TEXT(" > ")
      + C_TEXT_BOLD(`${method} ${name}`)
      + C_STATUS(` ${status} `)
      + C_TEXT(`[${et}, ${size} bytes]`)
      + C_SUC_TEXT(` ${passedCount}/${allCount} passed`);
  } else {
    // Error!
    line += C_ERR(" ✗ ")
      + C_TEXT_BOLD(bundleName)
      + C_TEXT(" > ")
      + C_ERR(`${method} ${name}`)
      + C_STATUS(` ${status} `)
      + C_TEXT(`[${et}, ${size} bytes]`)
      + C_ERR(` ${allCount - passedCount}/${allCount} tests failed`);
  }
  return line;
}

function formatRouteError(bundleName: string, method: string, name: string, error: string) {
  const line = C_TIME(`${new Date().toLocaleString()}`)
    + C_ERR(" ✗ ")
    + C_TEXT_BOLD(bundleName)
    + C_TEXT(" > ")
    + C_ERR(`${method} ${name} `)
    + C_ERR_TEXT(`error executing request\n${requestDetailInset}${error}`);
  return line;
}

function formatRouteParseError(bundleName: string, method: string, name: string, status: number | undefined, size: number, et: string | number, parseError: string) {
  const line = C_TIME(`${new Date().toLocaleString()}`)
    + C_ERR(" ✗ ")
    + C_TEXT_BOLD(bundleName)
    + C_TEXT(" > ")
    + C_ERR(`${method} ${name}`)
    + C_STATUS(` ${status} `)
    + C_TEXT(`[${et}, ${size} bytes] `)
    + C_ERR_TEXT(`parse error(${parseError})`);
  return line;
}

function formatUndefinedVariablesWarning(undefinedVariables: string[]) {
  const line = requestDetailInset
    + C_WARN("! ")
    + C_WARN_TEXT("Undefined variable(s): ")
    + C_WARN_TOKENS(undefinedVariables.join(","))
    + C_WARN_TEXT(". Did you choose an env?");
  return line;
}

function formatTestResults(inset: string, spec: string | null, results: TestResult[], lastResult: TestResult | undefined, skip: boolean, indented: boolean): string[] {
  const resultLines: string[] = [];
  for (const [i, r] of results.entries()) {
    const pipe = lastResult
      ? (r === lastResult ? "└" : "├") // flat view
      : (i === (results.length - 1) ? "└" : "├"); // indented/nested view

    // Indented presentation displays spec on a dedicated line, otherwise specs are displayed inline.
    const specToken = spec && !indented ? `${spec} ` : "";

    let line = `${inset}${pipe}`;
    if (skip) {
      // Skipped Test!
      line += C_SKIP(" ✓ ")
        + C_TEXT("test ")
        + C_TEXT(specToken)
        + (r.op === ':' ? C_TEXT("$eq") : C_TEXT(r.op))
        + C_TEXT(` ${r.expected}`)
        + C_SKIP(" skipped");
  } else if (r.pass) {
      // Successful Test!
      line += C_SUC(" ✓ ")
        + C_TEXT("test ")
        + C_SPEC(specToken)
        + (r.op === ':' ? C_OP("$eq") : C_OP(r.op))
        + C_TEXT(" expected ")
        + C_SUC_TEXT(r.expected);

        if (r.message) {
          line = `${line}\n${inset}  ${C_TEXT(r.message)}`;
        }    
    } else {
      // Failed Test!
      line += C_ERR(" ✗ ")
        + C_TEXT("test ")
        + C_ERR_TEXT(specToken)
        + (r.op === ':' ? C_OP("$eq") : C_OP(r.op))
        + C_TEXT(" expected ")
        + C_SUC_TEXT(r.expected)
        + C_TEXT(" | actual ")
        + C_ERR_TEXT(r.received);

        if (r.message) {
          line = `${line}\n${inset}  ${C_ERR_TEXT(r.message)}`;
        }    
    }

    resultLines.push(line);
  }
  return resultLines;
}

function getFormattedResult(
  bundleName: string,
  specRes: SpecResult,
  method: string,
  name: string,
  status: number | undefined,
  size: number,
  execTime: string | number,
  indented: boolean
): [string, number, number] {
  function getResultData(res: SpecResult): [number, number] {
    const rootResults = res.results;
    let passed = rootResults.filter((r) => r.pass).length;
    let all = rootResults.length;

    for (const s of res.subResults) {
      const [subPassed, subAll] = getResultData(s);
      passed += subPassed;
      all += subAll;
    }

    return [passed, all];
  }

  const [passed, all] = getResultData(specRes);

  let message = formatRoute(bundleName, method, name, status, execTime, size, passed, all);

  function getIndentedResult(res: SpecResult, indent: number, lastResult: TestResult | undefined): string {
    const offset = "  ";
    const inset = requestDetailInset + (indented ? offset.repeat((Math.max(1, indent-1))) : "");
    
    const testResults = formatTestResults(inset, res.spec, res.results, lastResult, res.skipped ?? false, indented).join("\n");

    const subRes: string[] = [];
    for (const s of res.subResults) {
      if (res.spec && !indented) s.spec = `${res.spec} > ${s.spec}`;
      subRes.push(getIndentedResult(s, indent + 1, lastResult));
    }
    const subResString = subRes.join("\n");

    const dataElems: string[] = [];
    if (res.spec && indented) dataElems.push(`${requestDetailInset}${offset.repeat(Math.max(0, indent-2))}${res.spec}`);
    if (testResults.length > 0) dataElems.push(testResults);
    if (subResString.length > 0) dataElems.push(subResString);

    return dataElems.join("\n");
  }

  if (passed !== all) {
      // Find the last SpecResult and identify the last TestResult for flat/non-indented views
      let lastTestResult: TestResult | undefined;
    if (!indented) {
      let lastSpec = specRes;
      if (specRes.subResults) {
        while (lastSpec.subResults) {
          const spec = lastSpec.subResults[lastSpec.subResults.length-1];
          if (spec) {
            lastSpec = spec;
          } else {
            break;
          }
        }
      }
      lastTestResult = lastSpec.results[lastSpec.results.length-1];
    }
    message =`${message}\n${getIndentedResult(specRes, 1, lastTestResult)}`;
  }

  return [message, passed, all];
}

export async function allRequestsWithProgress(
  allRequests: {
    [name: string]: RequestSpec;
  },
  bundlePath: string,
  indented: boolean
): Promise<Array<{ name: string; response: ResponseData }>> {
  let currHttpRequest: GotRequest;
  const responses: Array<{ name: string; response: ResponseData }> = [];

  const bundleName = bundlePath.substring(bundlePath.lastIndexOf(path.sep) + 1);

  for (const name in allRequests) {
    const requestData = allRequests[name];
    const method = requestData.httpRequest.method;

    requestData.httpRequest.body = replaceFileContents(requestData.httpRequest.body, bundlePath);
    const undefs = replaceVariablesInRequest(requestData, getVarStore().getAllVariables());
    currHttpRequest = constructGotRequest(requestData);

    const reqNameMessage = `Running ${name}`;
    process.stderr.write(C_LOADING(`${reqNameMessage}\r`));
    let dots = "";
    const reqTimer = setInterval(() => {
      dots += ".";
      process.stderr.write(C_LOADING(`\r${reqNameMessage}${dots}`));
    }, 1000);

    const {
      response: httpResponse,
      executionTime,
      byteLength: size,
      error,
    } = await executeGotRequest(currHttpRequest);

    clearInterval(reqTimer);
    process.stderr.write("\r");

    const response: ResponseData = {
      executionTime: `${executionTime} ms`,
      status: httpResponse.statusCode,
      body: httpResponse.body,
      rawHeaders: getHeadersAsString(httpResponse.rawHeaders),
      headers: httpResponse.headers,
      json: null,
    };

    if (error) {
      let message = formatRouteError(bundleName, method, name, error);

      if (undefs.length > 0) {
        message = `${message}\n${formatUndefinedVariablesWarning(undefs)}`;
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
            parseError = `Error parsing the response body: ${err}`;
          }
        }
      }
    }

    const status = response.status;
    const et = response.executionTime;
    if (parseError) {
      const message = formatRouteParseError(bundleName, method, name, status, size, et, parseError);
      process.stderr.write(`\r${message}\n`);
      process.exitCode = getStatusCode() + 1;
      continue;
    }

    const results = runAllTests(requestData.tests, response, requestData.options.stopOnFailure);
    let [message, passed, all] = getFormattedResult(bundleName, results, method, name, status, size, et, indented);
    if (passed !== all) process.exitCode = getStatusCode() + 1;

    const captureOutput = captureVariables(requestData, response);
    const capturedVariables = captureOutput.capturedVars;
    const capturedErrors = captureOutput.captureErrors;
    getVarStore().mergeCapturedVariables(capturedVariables);
    if (capturedErrors) {
      message = `${message}${requestDetailInset}${C_ERR(`${capturedErrors}`)}`;
    }
    if (undefs.length > 0) {
      message = `${message}\n${formatUndefinedVariablesWarning(undefs)}`;
    }

    process.stderr.write(`${message}\n`);
  }
  return responses;
}

function getStrictStringValue(value: any): string {
  if (value === undefined) {
    return "undefined";
  }
  if (typeof value === "object") {
    return JSON.stringify(value);
  }
  return value.toString();  
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
