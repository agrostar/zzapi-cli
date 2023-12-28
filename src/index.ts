#! /usr/bin/env node

import { Command } from "commander";

import { initRawRequest } from "./utils/requestUtils";
import { LIB_VERSION } from "./utils/version";

import { callRequests } from "./runRequests";

const VERSION: string = LIB_VERSION;

const program = new Command();
program
  .allowExcessArguments(false)
  .version(VERSION)
  .description("CLI for zzAPI - an API testing framework")
  .argument("<path/to/bundle>", "The bundle whose requests to run")
  .option("--req <req-name>", "Run a request of a particular name")
  .option("--env <env-name>", "Run the request in a particular environment")
  .option("--expand", "Show the body output in the terminal")
  .parse(process.argv);
const options = program.opts();

// create the raw request
const pathArg = program.args[0];
initRawRequest(pathArg, options.expand === true, options.req, options.env);

// finally, call the request
callRequests(VERSION);
