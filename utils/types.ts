// deno-lint-ignore-file no-explicit-any
export type OmitFirstArg<F> = F extends (x: any, ...args: infer P) => infer R
  ? (...args: P) => R
  : never;
