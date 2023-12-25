import * as path from "path";

import { Command } from "commander";
import { initRawRequest } from "./utils/requestUtils";
import { callRequests } from "./runRequests";

const program = new Command();
program
  .allowExcessArguments(false)
  .version("0.0.0")
  .description("CLI for zzAPI - an API testing framework")
  .argument("<pathToBundle>", "The bundle whose requests to run")
  .option("--request <name>", "Run a request of a particular name")
  .option("--env <name>", "Run the request in a particular environment")
  .option("--suppress", "Suppress the body output in the terminal")
  .parse(process.argv);
const options = program.opts();

// the request
const pathArg = program.args[0];
initRawRequest(pathArg, options.suppress === true, options.request, options.env);
callRequests("1.0.0", options.request);
