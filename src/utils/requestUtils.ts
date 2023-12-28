import { Bundle } from "./bundleUtils";

class RawRequest {
  public requestName: string | undefined = undefined;
  public envName: string | undefined = undefined;
  public expand: boolean = false;
  public bundle: Bundle;

  constructor(relPath: string, expand: boolean, requestName?: string, envName?: string) {
    this.bundle = new Bundle(relPath);
    this.requestName = requestName;
    this.envName = envName;
    this.expand = expand;
  }
}

let req: RawRequest;
export function initRawRequest(
  relPath: string,
  expand: boolean,
  requestName?: string,
  envName?: string
) {
  req = new RawRequest(relPath, expand, requestName, envName);
}
export function getRawRequest(): RawRequest {
  return req;
}
