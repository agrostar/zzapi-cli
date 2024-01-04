#! /usr/bin/env node

import { Command } from "commander";

import { initRawRequest } from "./utils/requestUtils";
import { CLI_NAME, CLI_VERSION } from "./utils/version";
import { getStatusCode } from "./utils/errors";

import { callRequests } from "./runRequests";
import { C_ERR_TEXT, C_WARN_TEXT } from "./utils/colours";

const VERSION: string = CLI_VERSION;
const NAME: string = CLI_NAME;

const program = new Command();
program
  .showHelpAfterError(C_WARN_TEXT(`(enter ${NAME} -h for usage information)`))
  .allowExcessArguments(false)
  .configureOutput({
    writeErr: (str) => process.stderr.write(str),
    outputError: (str, write) => write(C_ERR_TEXT(str)),
  })
  .version(VERSION, "-v, --version", "show the current version")
  .description("CLI for zzAPI - an API testing framework")
  .argument("<path-to-bundle>", "The bundle whose requests to run")
  .option("-r, --req <req-name>", "Run a request of a particular name")
  .option("-e, --env <env-name>", "Run the request in a particular environment")
  .option("--expand", "Show the body output in the terminal")
  .parse(process.argv);

async function main() {
  const options = program.opts();

  // create the raw request
  const pathArg = program.args[0];
  initRawRequest(pathArg, options.expand === true, options.req, options.env);
  if (getStatusCode() > 0) return;

  // finally, call the request
  await callRequests(VERSION);
}

main();
