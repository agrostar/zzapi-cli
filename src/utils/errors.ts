import { C_ERR_TEXT } from "./colours";

export let statusCode = 0;
export function setStatusCode(newStatus: number): void {
  statusCode = newStatus;
}

export function throwError(message: string): void {
  console.log(C_ERR_TEXT(message));
  statusCode = 1;
  process.exit(statusCode);
}
