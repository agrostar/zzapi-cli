import path from "path";
import * as fs from "fs";

import { getStatusCode, throwError } from "./errors";

const BUNDLE_FILE_NAME_ENDINGS = [".zzb", ".zzb.yml", ".zzb.yaml"] as const;

export class Bundle {
  public bundlePath: string = __dirname;
  public bundleContents: string = "";

  constructor(relPath: string) {
    this.setBundlePath(relPath);
    if (getStatusCode() > 0) return;
    this.readContents();
  }

  setBundlePath(relPath: string) {
    if (!BUNDLE_FILE_NAME_ENDINGS.some((ending) => relPath.endsWith(ending))) {
      throwError(`error: ${relPath} is not a valid bundle`);
      return;
    }
    this.bundlePath = path.resolve(relPath);
    if (!fs.existsSync(this.bundlePath)) {
      throwError(`error: ${this.bundlePath} does not exist`);
      return;
    }
    if (!fs.lstatSync(this.bundlePath).isFile()) {
      throwError(`error: ${this.bundlePath} is not a file`);
      return;
    }
  }

  readContents() {
    this.bundleContents = fs.readFileSync(this.bundlePath, "utf-8");
  }
}
