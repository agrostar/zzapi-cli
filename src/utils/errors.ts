import { C_ERR_TEXT } from "./colours";

export function getStatusCode() {
  if (!process.exitCode) process.exitCode = 0;
  return process.exitCode;
}

export function throwError(message: any): void {
  console.error(C_ERR_TEXT(message));
  process.exitCode = 1;
}
