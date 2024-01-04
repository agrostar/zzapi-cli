import chalkStderr from "chalk";

export const C_LOADING = chalkStderr.blue.italic; // loading
export const C_TIME = chalkStderr.magenta.italic.underline; // time

// error
export const C_ERR = chalkStderr.red.bold;
export const C_ERR_TEXT = chalkStderr.red;

// success
export const C_SUC = chalkStderr.green.bold;
export const C_SUC_TEXT = chalkStderr.green;

// warning
export const C_WARN = chalkStderr.yellow.bold;
export const C_WARN_TEXT = chalkStderr.yellow;
