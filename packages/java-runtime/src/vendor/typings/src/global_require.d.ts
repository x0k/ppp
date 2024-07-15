/**
 * The only way I could figure out how to get a handle on Node's 'require'
 * function without confusing webpack. Using a Function constructor doesn't work,
 * as require() isn't in its scope!
 *
 * Isolating in its own module so it doesn't mess up mangling in other modules.
 */
export default function getGlobalRequire(): Function;
