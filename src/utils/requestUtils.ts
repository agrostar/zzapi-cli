import { Bundle } from "./bundleUtils";

export class RawRequest {
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

export function getRawRequest(
  relPath: string,
  expand: boolean,
  requestName?: string,
  envName?: string
): RawRequest {
  return new RawRequest(relPath, expand, requestName, envName);
}
