export type DeepPartial<T> = {
  [P in keyof T]?: DeepPartial<T[P]>;
};
export type MaybeType<T> = T | undefined;
export type NullableType<T> = T | null;
export type OrNeverType<T> = T | never;
