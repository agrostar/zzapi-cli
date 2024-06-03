import { C_ERR_TEXT } from "./colours";

export function getStatusCode() {
  return process.exitCode ?? 0;
}
