import { ResponseData } from "zzapi";

export type SpecResponse = {
  name: string;
  response: ResponseData;
  passedTests: number;
  allTests: number;
};
