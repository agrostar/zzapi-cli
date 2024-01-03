#! /usr/bin/env node

import { Command } from "commander";

import { initRawRequest } from "./utils/requestUtils";
import { LIB_VERSION } from "./utils/version";

import { callRequests } from "./runRequests";
import { getStatusCode } from "./utils/errors";

const VERSION: string = LIB_VERSION;

const program = new Command();
program
  .allowExcessArguments(false)
  .version(VERSION, "-v, --version", "show the current version")
  .description("CLI for zzAPI - an API testing framework")
  .argument("<path/to/bundle>", "The bundle whose requests to run")
  .option("-r, --req <req-name>", "Run a request of a particular name")
  .option("-e, --env <env-name>", "Run the request in a particular environment")
  .option("--expand", "Show the body output in the terminal")
  .parse(process.argv);

async function main() {
  const options = program.opts();
  // console.log(options);

  // create the raw request
  const pathArg = program.args[0];
  initRawRequest(pathArg, options.expand === true, options.req, options.env);
  if (getStatusCode() > 0) return;

  // finally, call the request
  await callRequests(VERSION);
  if (getStatusCode() > 0) return;
}

main();
