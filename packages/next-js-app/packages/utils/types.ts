export type Maybe<T = string, E = null> = T | E

export type ThenArg<T> = T extends PromiseLike<infer U> ? U : T
