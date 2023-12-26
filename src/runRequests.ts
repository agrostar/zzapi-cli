import * as path from "path";

import { RequestSpec, ResponseData } from "zzapi";
import { getAllRequestSpecs, getRequestSpec } from "zzapi";
import { loadVariables } from "zzapi";

import { getRawRequest } from "./utils/requestUtils";

import { openEditorForIndividualReq as showContentForIndividualReq, openEditorForAllRequests as showContentForAllReqs } from "./showRes";
import { allRequestsWithProgress } from "./getResponse";
import { getVarFileContents, getVarStore, replaceFileContentsInString } from "./variables";
import { throwError } from "./utils/errors";

async function runRequests(
  requests: { [name: string]: RequestSpec },
  extensionVersion: string
): Promise<void> {
  try {
    const env: string = (getRawRequest().envName ? getRawRequest().envName : "") as string;
    const loadedVariables = loadVariables(
      env,
      getRawRequest().bundle.bundleContents,
      getVarFileContents(path.dirname(getRawRequest().bundle.bundlePath))
    );
    getVarStore().setLoadedVariables(loadedVariables);
  } catch (err: any) {
    throwError(err);
    return;
  }

  for (const name in requests) {
    const request = requests[name];
    const autoHeaders: { [key: string]: string } = {
      "user-agent": "zzAPI-runner/" + extensionVersion,
    };

    if (request.httpRequest.body && typeof request.httpRequest.body == "object") {
      autoHeaders["content-type"] = "application/json";
    }

    request.httpRequest.headers = Object.assign(autoHeaders, request.httpRequest.headers);
  }

  const allResponses = await allRequestsWithProgress(requests);
  let responses: Array<{ name: string; response: ResponseData }> = [];

  allResponses.forEach((ResponseData) => {
    const response = ResponseData.response;
    const name = ResponseData.name;
    responses.push({ name: name, response: response });
  });

  if (Object.keys(requests).length > 1) {
    await showContentForAllReqs(responses);
  } else if (Object.keys(requests).length === 1) {
    const name = Object.keys(requests)[0];
    const theRequest = requests[name];
    const theResponse = allResponses[0].response;
    await showContentForIndividualReq(
      theResponse,
      name,
      theRequest.options.keepRawJSON,
      theRequest.options.showHeaders
    );
  }
}

export async function callRequests(extensionVersion: string, name?: string): Promise<void> {
  let allRequests: { [name: string]: RequestSpec };
  const content = replaceFileContentsInString(getRawRequest().bundle.bundleContents);
  if (name) {
    try {
      const request: RequestSpec = getRequestSpec(content, name);
      allRequests = { [name]: request };
    } catch (err: any) {
      throwError(err);
      return;
    }
  } else {
    try {
      allRequests = getAllRequestSpecs(content);
    } catch (err: any) {
      throwError(err);
      return; // just so TS knows that allRequests is always being assigned
    }
  }
  await runRequests(allRequests, extensionVersion);
}
