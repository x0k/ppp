export type Brand<Name extends string, Base = string> = Base & { __brand: Name }

export type AnyKey = keyof any;
