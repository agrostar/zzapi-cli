export function getStatusCode() {
  return Number(process.exitCode ?? 0);
}
