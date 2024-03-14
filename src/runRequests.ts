import * as path from "path";

import { RequestSpec, Variables } from "zzapi";
import { getAllRequestSpecs, getRequestSpec } from "zzapi";
import { loadVariables } from "zzapi";

import { getRawRequest } from "./utils/requestUtils";
import { throwError } from "./utils/errors";
import { C_WARN } from "./utils/colours";
import { CLI_VERSION } from "./utils/version";

import { showContentForIndReq, showContentForAllReq } from "./showRes";
import { allRequestsWithProgress } from "./getResponse";
import { getVarFileContents, getVarStore } from "./variables";

async function runRequestSpecs(requests: { [name: string]: RequestSpec }): Promise<void> {
  for (const name in requests) {
    const request = requests[name];

    const autoHeaders: { [key: string]: string } = { "user-agent": "zzAPI-cli/" + CLI_VERSION };
    if (request.httpRequest.body && typeof request.httpRequest.body == "object")
      autoHeaders["content-type"] = "application/json";

    request.httpRequest.headers = Object.assign(autoHeaders, request.httpRequest.headers);
  }

  const responses = await allRequestsWithProgress(requests);

  if (responses.length < 1) return;
  // if requestName is not set, then it is meant to be a run-all requests, else run-one
  if (!getRawRequest().requestName) {
    await showContentForAllReq(responses);
  } else {
    const name = responses[0].name;
    const req = requests[name];
    const resp = responses[0].response;
    await showContentForIndReq(resp, name, req.options.keepRawJSON, req.options.showHeaders);
  }
}

export async function callRequests(): Promise<void> {
  // load the variables
  try {
    const env = getRawRequest().envName;
    const loadedVariables: Variables = loadVariables(
      env,
      getRawRequest().bundle.bundleContents,
      getVarFileContents(path.dirname(getRawRequest().bundle.bundlePath)),
    );
    if (env && Object.keys(loadedVariables).length < 1)
      console.error(C_WARN(`warning: no variables added from env "${env}". Does it exist?`));
    getVarStore().setLoadedVariables(loadedVariables);
  } catch (err: any) {
    throwError(err);
    return;
  }

  // run the requests
  const name = getRawRequest().requestName,
    content = getRawRequest().bundle.bundleContents;

  let allRequests: { [name: string]: RequestSpec };
  try {
    allRequests = name ? { [name]: getRequestSpec(content, name) } : getAllRequestSpecs(content);
  } catch (err: any) {
    throwError(err);
    return;
  }

  await runRequestSpecs(allRequests);
}
