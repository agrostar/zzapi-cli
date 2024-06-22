import chalkStderr from "chalk";

export const C_PATH = chalkStderr.cyan; // path

export const C_LOADING = chalkStderr.blue.italic; // loading
export const C_TIME = chalkStderr.gray; // time

export const C_BUNDLE = chalkStderr.white;
export const C_SPEC = chalkStderr.white; // spec

export const C_STATUS = chalkStderr.cyanBright;
export const C_OP = chalkStderr.cyanBright.italic;

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
export const C_WARN_TOKENS = chalkStderr.magenta;

// skip
export const C_SKIP = chalkStderr.gray.bold;

// normal text
export const C_TEXT_BOLD = chalkStderr.whiteBright.bold;
export const C_TEXT = chalkStderr.gray;
