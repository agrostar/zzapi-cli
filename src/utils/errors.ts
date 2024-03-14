import { C_ERR_TEXT } from "./colours";

export function getStatusCode() {
  return process.exitCode ?? 0;
}

export function throwError(message: any): void {
  console.error(C_ERR_TEXT(message));
  process.exitCode = 1;
}
