import { C_ERR_TEXT } from "./colours";

export function throwError(message: string): void {
  console.log(C_ERR_TEXT(message));
  process.exit(1);
}
