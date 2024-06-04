import chalkStderr from "chalk";

export const C_PATH = chalkStderr.cyan; // path

export const C_LOADING = chalkStderr.blue.italic; // loading
export const C_TIME = chalkStderr.magenta.italic.underline; // time

export const C_SPEC = chalkStderr.white.bold.italic; // spec

// error
export const C_ERR = chalkStderr.red.bold;
export const C_ERR_TEXT = chalkStderr.red;
export const C_ERR_INFO = chalkStderr.red.bold.italic;

// success
export const C_SUC = chalkStderr.green.bold;
export const C_SUC_TEXT = chalkStderr.green;

// warning
export const C_WARN = chalkStderr.yellow.bold;
export const C_WARN_TEXT = chalkStderr.yellow;

// skip
export const C_SKIP = chalkStderr.gray;
export const C_SKIP_TEXT = chalkStderr.gray.bold;
