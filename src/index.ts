#! /usr/bin/env node

import { Command } from "commander";

import { CLI_NAME, CLI_VERSION } from "./utils/version";
import { C_ERR_TEXT, C_PATH, C_WARN_TEXT } from "./utils/colours";
import { RawRequest } from "./utils/requestUtils";
import { getStatusCode } from "./utils/errors";

import { callRequests } from "./runRequests";
import { displaySummary, markdownSummary } from "./bundleResult";
import { mkdir, writeFile } from "fs/promises";
import { existsSync } from "fs";

const program = new Command(CLI_NAME);
program
  .showHelpAfterError(C_WARN_TEXT(`(enter ${CLI_NAME} -h for usage information)`))
  .configureOutput({
    writeErr: (str) => process.stderr.write(str),
    outputError: (str, write) => write(C_ERR_TEXT(str)),
  })
  .version(CLI_VERSION, "-v, --version", "show the current version")
  .description("CLI for zzAPI - an API testing framework")
  .arguments("<path-to-bundles>")
  .option("-r, --req <req-name>", "Run a request of a particular name")
  .option("-e, --env <env-name>", "Run the request in a particular environment")
  .option("--expand", "Show the body output in the terminal")
  .option("--indent", "indent the failing tests for clarity in specs")
  .option("--report", "Generate a markdown summary report")
  .option("--report-dir", "Directory for markdown summary report file. Defaults to '.'")
  .parse(process.argv);

async function main() {
  const options = program.opts();
  options.expand = options.expand === true;
  options.indent = options.indent === true;
  options.report = options.report === true;
  options.reportDir = options.reportDir ?? ".";

  const bundlePaths = program.args;
  const bundleResults = [];
  for (const bundlePath of bundlePaths) {
    process.stderr.write(C_PATH(`\nRunning bundle: ${bundlePath}\n`));
    try {
      const rawReq = new RawRequest(bundlePath, options);
      const bundleResult = await callRequests(rawReq);
      bundleResult.bundlePath = bundlePath;
      bundleResults.push(bundleResult);
    } catch (e: any) {
      if (typeof e === "string") {
        process.stderr.write(C_ERR_TEXT(`${e}\n`));
      } else {
        process.stderr.write(C_ERR_TEXT(`${e.message ?? "unable to process requests"}\n`));
      }
      process.exitCode = getStatusCode() + 1;
      continue;
    }
  }

  displaySummary(bundleResults);

  if (options.report) {
    const report = markdownSummary(bundleResults);
    if (!existsSync(options.reportDir)) {
      await mkdir(options.reportDir);
    }
    await writeFile(`${options.reportDir}/zzapi-results.md`, report);
  }
}

main();
