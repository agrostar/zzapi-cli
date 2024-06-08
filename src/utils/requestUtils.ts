import { OptionValues } from "commander";
import { Bundle } from "./bundleUtils";

export class RawRequest {
  public requestName: string | undefined = undefined;
  public envName: string | undefined = undefined;
  public expand: boolean = false;
  public indent: boolean = false;
  public bundle: Bundle;

  constructor(relPath: string, opts: OptionValues) {
    try {
      this.bundle = new Bundle(relPath);
      this.requestName = opts.req;
      this.envName = opts.env;
      this.expand = opts.expand;
      this.indent = opts.indent;
    } catch (e) {
      throw e;
    }
  }
}
