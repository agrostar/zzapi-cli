import * as path from "path";

import { RequestSpec, ResponseData } from "zzapi";
import { getAllRequestSpecs, getRequestSpec } from "zzapi";
import { loadVariables } from "zzapi";

import { openEditorForIndividualReq, openEditorForAllRequests } from "./showRes";
import { allRequestsWithProgress } from "./getResponse";
import { getVarFileContents, getVarStore } from "./variables";
import { getRawRequest } from "./utils/requestUtils";

async function runRequests(
  requests: { [name: string]: RequestSpec },
  extensionVersion: string
): Promise<void> {
  const env: string = (getRawRequest().envName ? getRawRequest().envName : "") as string;
  const loadedVariables = loadVariables(
    env,
    getRawRequest().bundle.bundleContents,
    getVarFileContents(path.dirname(getRawRequest().bundle.bundlePath))
  );
  getVarStore().setLoadedVariables(loadedVariables);

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
    await openEditorForAllRequests(responses);
  } else if (Object.keys(requests).length === 1) {
    const name = Object.keys(requests)[0];
    const theRequest = requests[name];
    const theResponse = allResponses[0].response;
    await openEditorForIndividualReq(
      theResponse,
      name,
      theRequest.options.keepRawJSON,
      theRequest.options.showHeaders
    );
  }
}

export async function callRequests(extensionVersion: string, name?: string): Promise<void> {
  let allRequests: { [name: string]: RequestSpec };
  if (name) {
    const request: RequestSpec = getRequestSpec(getRawRequest().bundle.bundleContents, name);
    allRequests = { [name]: request };
  } else {
    allRequests = getAllRequestSpecs(getRawRequest().bundle.bundleContents);
  }
  await runRequests(allRequests, extensionVersion);
}
