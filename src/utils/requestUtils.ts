import { Bundle } from "./bundleUtils";

class RawRequest {
  public requestName: string | undefined = undefined;
  public envName: string | undefined = undefined;
  public suppress: boolean = false;
  public bundle: Bundle;

  constructor(relPath: string, suppress: boolean, requestName?: string, envName?: string) {
    this.bundle = new Bundle(relPath);
    this.requestName = requestName;
    this.envName = envName;
    this.suppress = suppress;
  }
}

let req: RawRequest;
export function initRawRequest(
  relPath: string,
  suppress: boolean,
  requestName?: string,
  envName?: string
) {
  req = new RawRequest(relPath, suppress, requestName, envName);
}
export function getRawRequest(): RawRequest {
  return req;
}
