/* eslint-disable @typescript-eslint/ban-types */
export type Jsonized<T> = T extends object ? {
  [K in keyof T]:
  T[K] extends Function ? undefined :
    T[K] extends (Function | undefined) ? undefined :
      T[K] extends Date ? string :
        T[K] extends (Date | undefined) ? string | undefined :
          T[K] extends number ? number :
            T[K] extends string ? string :
              Jsonized<T[K]>
} : T

export type DestroyNulls<T> = T extends null
  ? undefined
  : T extends Date
    ? T
    : {
        [K in keyof T]: T[K] extends (infer U)[]
          ? DestroyNulls<U>[]
          : DestroyNulls<T[K]>;
      }
