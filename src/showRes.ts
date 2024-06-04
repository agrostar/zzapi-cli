import { ResponseData } from "zzapi";

const KEYS_IN_BODY = ["body"];
const KEYS_IN_HEADERS = ["rawHeaders"];

export async function showContentForIndReq(
  responseData: ResponseData,
  name: string,
  keepRawJSON: boolean,
  showHeaders: boolean,
  env: string | undefined,
  expand: boolean,
): Promise<void> {
  const { contentData, headersData } = getDataOfIndReqAsString(responseData, name, env, keepRawJSON);
  showContent(contentData, headersData, showHeaders, expand, name);
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

export async function showContentForAllReq(
  responses: Array<{ response: ResponseData; name: string }>,
  env: string | undefined,
  expand: boolean,
  keepRawJSON?: boolean,
): Promise<void> {
  let allResponses: { [key: string]: any } = {};

  responses.forEach((responseObj) => {
    let contentData = getDataOfIndReqAsString(
      responseObj.response,
      responseObj.name,
      env,
      keepRawJSON,
    ).contentData;

    let parsedData = attemptDataParse(contentData);
    allResponses[responseObj.name] = parsedData ? parsedData : contentData;
  });

  showContent(JSON.stringify(allResponses, undefined, 2), "", false, expand);
}

function getDataOfIndReqAsString(
  responseData: ResponseData,
  name: string,
  env: string | undefined,
  keepRawJSON?: boolean,
): { contentData: string; headersData: string } {
  let currentEnvironment: string = env ?? "";

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
function showContent(
  bodyContent: string,
  headersContent: string,
  showHeaders: boolean,
  expand: boolean,
  name?: string,
) {
  // showing the body
  if (expand) console.log(bodyContent);
  // showing the headers
  if (name && showHeaders) console.error("----------\n" + headersContent + "\n----------\n");
}
