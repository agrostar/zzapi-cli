import { ResponseData } from "zzapi";

import { getRawRequest } from "./utils/requestUtils";

const KEYS_IN_BODY = ["body"];
const KEYS_IN_HEADERS = ["rawHeaders"];

export async function openEditorForIndividualReq(
  responseData: ResponseData,
  name: string,
  keepRawJSON: boolean,
  showHeaders: boolean
): Promise<void> {
  const { contentData, headersData } = getDataOfIndReqAsString(responseData, name, keepRawJSON);
  showContent(contentData, headersData, showHeaders, name);
}

function attemptDataParse(content: string): object | undefined {
  let parsedData;
  try {
    parsedData = JSON.parse(content);
  } catch {
    return undefined;
  }
  return parsedData;
}

export async function openEditorForAllRequests(
  responses: Array<{ response: ResponseData; name: string }>,
  keepRawJSON?: boolean
): Promise<void> {
  let allResponses: { [key: string]: any } = {};

  responses.forEach((responseObj) => {
    let contentData = getDataOfIndReqAsString(
      responseObj.response,
      responseObj.name,
      keepRawJSON
    ).contentData;

    let parsedData = attemptDataParse(contentData);
    allResponses[responseObj.name] = parsedData ? parsedData : contentData;
  });

  showContent(JSON.stringify(allResponses, undefined, 2), "", false);
}

function getDataOfIndReqAsString(
  responseData: ResponseData,
  name: string,
  keepRawJSON?: boolean
): { contentData: string; headersData: string } {
  let currentEnvironment: string = (getRawRequest().envName ? getRawRequest().envName : "") as string;

  let contentData = "";
  let headersData = `${name}: headers\nenvironment: ${currentEnvironment}\n\n`;

  for (const key in responseData) {
    let value = responseData[key as keyof ResponseData];

    if (KEYS_IN_BODY.includes(key)) contentData += `${value}\n`;
    if (KEYS_IN_HEADERS.includes(key)) headersData += `${key}: ${value}\n`;
  }

  if (!keepRawJSON) {
    let parsedData = attemptDataParse(contentData);
    if (parsedData) contentData = JSON.stringify(parsedData, undefined, 2);
  }
  return { contentData, headersData };
}

/**
 * Master function to show the content in the new windows or replace them
 *  in the current windows
 *
 * @param bodyContent The body of the response, or the set of all responses
 * @param headersContent The headers of the response, or the set of all
 *  responses
 * @param name Optional parameter. If name is specified then we are trying to
 *  show an individual request's response, else we are trying to show runAllRequest's
 *  response. Thus, any name === undefined test is to determine this.
 * @returns (void)
 */
function showContent(bodyContent: string, headersContent: string, showHeaders: boolean, name?: string) {
  let bodyLanguage: string | undefined;
  bodyLanguage = "json";
  try {
    JSON.parse(bodyContent);
  } catch {
    bodyLanguage = undefined;
  }

  if (!getRawRequest().suppress) {
    console.log(`----------\nbody:\n${bodyContent}\n"----------`);
  }

  if (name) {
    if (showHeaders) {
      const message = "----------\n" + headersContent + "\n----------\n";
      console.log(message);
    }
  }
}
