import { runRequestsHelper } from "./runRequests";
import { getRawRequest } from "./utils/requestUtils";

export async function callRequest(extensionVersion: string): Promise<void> {
  const name = getRawRequest().requestName;
  await runRequestsHelper(extensionVersion, name);
}
