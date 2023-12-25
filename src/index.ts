import { Command } from "commander";

const program = new Command();
program
  .version("0.0.0")
  .description("CLI for zzAPI - an API testing framework")
  .argument("<path/to/bundle>", "The bundle whose requests to run")
  .option("--request <name>", "If specified, we only run the request of the specified name")
  .option("--env <name>", "If specified, request is run in this environment")
  .option("--supress", "If specified, we do not show the request output")
  .parse(process.argv);
const options = program.opts();

console.log(options);
