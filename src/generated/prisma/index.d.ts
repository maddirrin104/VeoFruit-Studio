
/**
 * Client
**/

import * as runtime from './runtime/library.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model User
 * 
 */
export type User = $Result.DefaultSelection<Prisma.$UserPayload>
/**
 * Model VideoProject
 * 
 */
export type VideoProject = $Result.DefaultSelection<Prisma.$VideoProjectPayload>
/**
 * Model VideoGeneration
 * 
 */
export type VideoGeneration = $Result.DefaultSelection<Prisma.$VideoGenerationPayload>
/**
 * Model VideoScene
 * 
 */
export type VideoScene = $Result.DefaultSelection<Prisma.$VideoScenePayload>

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Users
 * const users = await prisma.user.findMany()
 * ```
 *
 *
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  const U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   *
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more Users
   * const users = await prisma.user.findMany()
   * ```
   *
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): PrismaClient;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>


  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb<ClientOptions>, ExtArgs, $Utils.Call<Prisma.TypeMapCb<ClientOptions>, {
    extArgs: ExtArgs
  }>>

      /**
   * `prisma.user`: Exposes CRUD operations for the **User** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Users
    * const users = await prisma.user.findMany()
    * ```
    */
  get user(): Prisma.UserDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.videoProject`: Exposes CRUD operations for the **VideoProject** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more VideoProjects
    * const videoProjects = await prisma.videoProject.findMany()
    * ```
    */
  get videoProject(): Prisma.VideoProjectDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.videoGeneration`: Exposes CRUD operations for the **VideoGeneration** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more VideoGenerations
    * const videoGenerations = await prisma.videoGeneration.findMany()
    * ```
    */
  get videoGeneration(): Prisma.VideoGenerationDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.videoScene`: Exposes CRUD operations for the **VideoScene** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more VideoScenes
    * const videoScenes = await prisma.videoScene.findMany()
    * ```
    */
  get videoScene(): Prisma.VideoSceneDelegate<ExtArgs, ClientOptions>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
   * Metrics
   */
  export type Metrics = runtime.Metrics
  export type Metric<T> = runtime.Metric<T>
  export type MetricHistogram = runtime.MetricHistogram
  export type MetricHistogramBucket = runtime.MetricHistogramBucket

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 6.19.2
   * Query Engine version: c2990dca591cba766e3b7ef5d9e8a84796e47ab7
   */
  export type PrismaVersion = {
    client: string
  }

  export const prismaVersion: PrismaVersion

  /**
   * Utility Types
   */


  export import Bytes = runtime.Bytes
  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? P : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    User: 'User',
    VideoProject: 'VideoProject',
    VideoGeneration: 'VideoGeneration',
    VideoScene: 'VideoScene'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]


  export type Datasources = {
    db?: Datasource
  }

  interface TypeMapCb<ClientOptions = {}> extends $Utils.Fn<{extArgs: $Extensions.InternalArgs }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], ClientOptions extends { omit: infer OmitOptions } ? OmitOptions : {}>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> = {
    globalOmitOptions: {
      omit: GlobalOmitOptions
    }
    meta: {
      modelProps: "user" | "videoProject" | "videoGeneration" | "videoScene"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      User: {
        payload: Prisma.$UserPayload<ExtArgs>
        fields: Prisma.UserFieldRefs
        operations: {
          findUnique: {
            args: Prisma.UserFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.UserFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          findFirst: {
            args: Prisma.UserFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.UserFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          findMany: {
            args: Prisma.UserFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          create: {
            args: Prisma.UserCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          createMany: {
            args: Prisma.UserCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.UserCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          delete: {
            args: Prisma.UserDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          update: {
            args: Prisma.UserUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          deleteMany: {
            args: Prisma.UserDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.UserUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.UserUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          upsert: {
            args: Prisma.UserUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          aggregate: {
            args: Prisma.UserAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateUser>
          }
          groupBy: {
            args: Prisma.UserGroupByArgs<ExtArgs>
            result: $Utils.Optional<UserGroupByOutputType>[]
          }
          count: {
            args: Prisma.UserCountArgs<ExtArgs>
            result: $Utils.Optional<UserCountAggregateOutputType> | number
          }
        }
      }
      VideoProject: {
        payload: Prisma.$VideoProjectPayload<ExtArgs>
        fields: Prisma.VideoProjectFieldRefs
        operations: {
          findUnique: {
            args: Prisma.VideoProjectFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VideoProjectPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.VideoProjectFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VideoProjectPayload>
          }
          findFirst: {
            args: Prisma.VideoProjectFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VideoProjectPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.VideoProjectFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VideoProjectPayload>
          }
          findMany: {
            args: Prisma.VideoProjectFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VideoProjectPayload>[]
          }
          create: {
            args: Prisma.VideoProjectCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VideoProjectPayload>
          }
          createMany: {
            args: Prisma.VideoProjectCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.VideoProjectCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VideoProjectPayload>[]
          }
          delete: {
            args: Prisma.VideoProjectDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VideoProjectPayload>
          }
          update: {
            args: Prisma.VideoProjectUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VideoProjectPayload>
          }
          deleteMany: {
            args: Prisma.VideoProjectDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.VideoProjectUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.VideoProjectUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VideoProjectPayload>[]
          }
          upsert: {
            args: Prisma.VideoProjectUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VideoProjectPayload>
          }
          aggregate: {
            args: Prisma.VideoProjectAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateVideoProject>
          }
          groupBy: {
            args: Prisma.VideoProjectGroupByArgs<ExtArgs>
            result: $Utils.Optional<VideoProjectGroupByOutputType>[]
          }
          count: {
            args: Prisma.VideoProjectCountArgs<ExtArgs>
            result: $Utils.Optional<VideoProjectCountAggregateOutputType> | number
          }
        }
      }
      VideoGeneration: {
        payload: Prisma.$VideoGenerationPayload<ExtArgs>
        fields: Prisma.VideoGenerationFieldRefs
        operations: {
          findUnique: {
            args: Prisma.VideoGenerationFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VideoGenerationPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.VideoGenerationFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VideoGenerationPayload>
          }
          findFirst: {
            args: Prisma.VideoGenerationFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VideoGenerationPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.VideoGenerationFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VideoGenerationPayload>
          }
          findMany: {
            args: Prisma.VideoGenerationFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VideoGenerationPayload>[]
          }
          create: {
            args: Prisma.VideoGenerationCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VideoGenerationPayload>
          }
          createMany: {
            args: Prisma.VideoGenerationCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.VideoGenerationCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VideoGenerationPayload>[]
          }
          delete: {
            args: Prisma.VideoGenerationDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VideoGenerationPayload>
          }
          update: {
            args: Prisma.VideoGenerationUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VideoGenerationPayload>
          }
          deleteMany: {
            args: Prisma.VideoGenerationDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.VideoGenerationUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.VideoGenerationUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VideoGenerationPayload>[]
          }
          upsert: {
            args: Prisma.VideoGenerationUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VideoGenerationPayload>
          }
          aggregate: {
            args: Prisma.VideoGenerationAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateVideoGeneration>
          }
          groupBy: {
            args: Prisma.VideoGenerationGroupByArgs<ExtArgs>
            result: $Utils.Optional<VideoGenerationGroupByOutputType>[]
          }
          count: {
            args: Prisma.VideoGenerationCountArgs<ExtArgs>
            result: $Utils.Optional<VideoGenerationCountAggregateOutputType> | number
          }
        }
      }
      VideoScene: {
        payload: Prisma.$VideoScenePayload<ExtArgs>
        fields: Prisma.VideoSceneFieldRefs
        operations: {
          findUnique: {
            args: Prisma.VideoSceneFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VideoScenePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.VideoSceneFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VideoScenePayload>
          }
          findFirst: {
            args: Prisma.VideoSceneFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VideoScenePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.VideoSceneFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VideoScenePayload>
          }
          findMany: {
            args: Prisma.VideoSceneFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VideoScenePayload>[]
          }
          create: {
            args: Prisma.VideoSceneCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VideoScenePayload>
          }
          createMany: {
            args: Prisma.VideoSceneCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.VideoSceneCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VideoScenePayload>[]
          }
          delete: {
            args: Prisma.VideoSceneDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VideoScenePayload>
          }
          update: {
            args: Prisma.VideoSceneUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VideoScenePayload>
          }
          deleteMany: {
            args: Prisma.VideoSceneDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.VideoSceneUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.VideoSceneUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VideoScenePayload>[]
          }
          upsert: {
            args: Prisma.VideoSceneUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VideoScenePayload>
          }
          aggregate: {
            args: Prisma.VideoSceneAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateVideoScene>
          }
          groupBy: {
            args: Prisma.VideoSceneGroupByArgs<ExtArgs>
            result: $Utils.Optional<VideoSceneGroupByOutputType>[]
          }
          count: {
            args: Prisma.VideoSceneCountArgs<ExtArgs>
            result: $Utils.Optional<VideoSceneCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasources?: Datasources
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasourceUrl?: string
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Shorthand for `emit: 'stdout'`
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events only
     * log: [
     *   { emit: 'event', level: 'query' },
     *   { emit: 'event', level: 'info' },
     *   { emit: 'event', level: 'warn' }
     *   { emit: 'event', level: 'error' }
     * ]
     * 
     * / Emit as events and log to stdout
     * og: [
     *  { emit: 'stdout', level: 'query' },
     *  { emit: 'stdout', level: 'info' },
     *  { emit: 'stdout', level: 'warn' }
     *  { emit: 'stdout', level: 'error' }
     * 
     * ```
     * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/logging#the-log-option).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
    /**
     * Instance of a Driver Adapter, e.g., like one provided by `@prisma/adapter-planetscale`
     */
    adapter?: runtime.SqlDriverAdapterFactory | null
    /**
     * Global configuration for omitting model fields by default.
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   omit: {
     *     user: {
     *       password: true
     *     }
     *   }
     * })
     * ```
     */
    omit?: Prisma.GlobalOmitConfig
  }
  export type GlobalOmitConfig = {
    user?: UserOmit
    videoProject?: VideoProjectOmit
    videoGeneration?: VideoGenerationOmit
    videoScene?: VideoSceneOmit
  }

  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type CheckIsLogLevel<T> = T extends LogLevel ? T : never;

  export type GetLogType<T> = CheckIsLogLevel<
    T extends LogDefinition ? T['level'] : T
  >;

  export type GetEvents<T extends any[]> = T extends Array<LogLevel | LogDefinition>
    ? GetLogType<T[number]>
    : never;

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'updateManyAndReturn'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */


  /**
   * Count Type UserCountOutputType
   */

  export type UserCountOutputType = {
    projects: number
  }

  export type UserCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    projects?: boolean | UserCountOutputTypeCountProjectsArgs
  }

  // Custom InputTypes
  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserCountOutputType
     */
    select?: UserCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountProjectsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: VideoProjectWhereInput
  }


  /**
   * Count Type VideoProjectCountOutputType
   */

  export type VideoProjectCountOutputType = {
    generations: number
  }

  export type VideoProjectCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    generations?: boolean | VideoProjectCountOutputTypeCountGenerationsArgs
  }

  // Custom InputTypes
  /**
   * VideoProjectCountOutputType without action
   */
  export type VideoProjectCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VideoProjectCountOutputType
     */
    select?: VideoProjectCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * VideoProjectCountOutputType without action
   */
  export type VideoProjectCountOutputTypeCountGenerationsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: VideoGenerationWhereInput
  }


  /**
   * Count Type VideoGenerationCountOutputType
   */

  export type VideoGenerationCountOutputType = {
    scenes: number
  }

  export type VideoGenerationCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    scenes?: boolean | VideoGenerationCountOutputTypeCountScenesArgs
  }

  // Custom InputTypes
  /**
   * VideoGenerationCountOutputType without action
   */
  export type VideoGenerationCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VideoGenerationCountOutputType
     */
    select?: VideoGenerationCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * VideoGenerationCountOutputType without action
   */
  export type VideoGenerationCountOutputTypeCountScenesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: VideoSceneWhereInput
  }


  /**
   * Models
   */

  /**
   * Model User
   */

  export type AggregateUser = {
    _count: UserCountAggregateOutputType | null
    _min: UserMinAggregateOutputType | null
    _max: UserMaxAggregateOutputType | null
  }

  export type UserMinAggregateOutputType = {
    id: string | null
    email: string | null
    fullName: string | null
    passwordHash: string | null
    createdAt: Date | null
  }

  export type UserMaxAggregateOutputType = {
    id: string | null
    email: string | null
    fullName: string | null
    passwordHash: string | null
    createdAt: Date | null
  }

  export type UserCountAggregateOutputType = {
    id: number
    email: number
    fullName: number
    passwordHash: number
    createdAt: number
    _all: number
  }


  export type UserMinAggregateInputType = {
    id?: true
    email?: true
    fullName?: true
    passwordHash?: true
    createdAt?: true
  }

  export type UserMaxAggregateInputType = {
    id?: true
    email?: true
    fullName?: true
    passwordHash?: true
    createdAt?: true
  }

  export type UserCountAggregateInputType = {
    id?: true
    email?: true
    fullName?: true
    passwordHash?: true
    createdAt?: true
    _all?: true
  }

  export type UserAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which User to aggregate.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Users
    **/
    _count?: true | UserCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: UserMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: UserMaxAggregateInputType
  }

  export type GetUserAggregateType<T extends UserAggregateArgs> = {
        [P in keyof T & keyof AggregateUser]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateUser[P]>
      : GetScalarType<T[P], AggregateUser[P]>
  }




  export type UserGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserWhereInput
    orderBy?: UserOrderByWithAggregationInput | UserOrderByWithAggregationInput[]
    by: UserScalarFieldEnum[] | UserScalarFieldEnum
    having?: UserScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: UserCountAggregateInputType | true
    _min?: UserMinAggregateInputType
    _max?: UserMaxAggregateInputType
  }

  export type UserGroupByOutputType = {
    id: string
    email: string
    fullName: string
    passwordHash: string
    createdAt: Date
    _count: UserCountAggregateOutputType | null
    _min: UserMinAggregateOutputType | null
    _max: UserMaxAggregateOutputType | null
  }

  type GetUserGroupByPayload<T extends UserGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<UserGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof UserGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], UserGroupByOutputType[P]>
            : GetScalarType<T[P], UserGroupByOutputType[P]>
        }
      >
    >


  export type UserSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    email?: boolean
    fullName?: boolean
    passwordHash?: boolean
    createdAt?: boolean
    projects?: boolean | User$projectsArgs<ExtArgs>
    _count?: boolean | UserCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["user"]>

  export type UserSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    email?: boolean
    fullName?: boolean
    passwordHash?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["user"]>

  export type UserSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    email?: boolean
    fullName?: boolean
    passwordHash?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["user"]>

  export type UserSelectScalar = {
    id?: boolean
    email?: boolean
    fullName?: boolean
    passwordHash?: boolean
    createdAt?: boolean
  }

  export type UserOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "email" | "fullName" | "passwordHash" | "createdAt", ExtArgs["result"]["user"]>
  export type UserInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    projects?: boolean | User$projectsArgs<ExtArgs>
    _count?: boolean | UserCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type UserIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type UserIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $UserPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "User"
    objects: {
      projects: Prisma.$VideoProjectPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      email: string
      fullName: string
      passwordHash: string
      createdAt: Date
    }, ExtArgs["result"]["user"]>
    composites: {}
  }

  type UserGetPayload<S extends boolean | null | undefined | UserDefaultArgs> = $Result.GetResult<Prisma.$UserPayload, S>

  type UserCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<UserFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: UserCountAggregateInputType | true
    }

  export interface UserDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['User'], meta: { name: 'User' } }
    /**
     * Find zero or one User that matches the filter.
     * @param {UserFindUniqueArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends UserFindUniqueArgs>(args: SelectSubset<T, UserFindUniqueArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one User that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {UserFindUniqueOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends UserFindUniqueOrThrowArgs>(args: SelectSubset<T, UserFindUniqueOrThrowArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first User that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindFirstArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends UserFindFirstArgs>(args?: SelectSubset<T, UserFindFirstArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first User that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindFirstOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends UserFindFirstOrThrowArgs>(args?: SelectSubset<T, UserFindFirstOrThrowArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Users that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Users
     * const users = await prisma.user.findMany()
     * 
     * // Get first 10 Users
     * const users = await prisma.user.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const userWithIdOnly = await prisma.user.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends UserFindManyArgs>(args?: SelectSubset<T, UserFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a User.
     * @param {UserCreateArgs} args - Arguments to create a User.
     * @example
     * // Create one User
     * const User = await prisma.user.create({
     *   data: {
     *     // ... data to create a User
     *   }
     * })
     * 
     */
    create<T extends UserCreateArgs>(args: SelectSubset<T, UserCreateArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Users.
     * @param {UserCreateManyArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const user = await prisma.user.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends UserCreateManyArgs>(args?: SelectSubset<T, UserCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Users and returns the data saved in the database.
     * @param {UserCreateManyAndReturnArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const user = await prisma.user.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Users and only return the `id`
     * const userWithIdOnly = await prisma.user.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends UserCreateManyAndReturnArgs>(args?: SelectSubset<T, UserCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a User.
     * @param {UserDeleteArgs} args - Arguments to delete one User.
     * @example
     * // Delete one User
     * const User = await prisma.user.delete({
     *   where: {
     *     // ... filter to delete one User
     *   }
     * })
     * 
     */
    delete<T extends UserDeleteArgs>(args: SelectSubset<T, UserDeleteArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one User.
     * @param {UserUpdateArgs} args - Arguments to update one User.
     * @example
     * // Update one User
     * const user = await prisma.user.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends UserUpdateArgs>(args: SelectSubset<T, UserUpdateArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Users.
     * @param {UserDeleteManyArgs} args - Arguments to filter Users to delete.
     * @example
     * // Delete a few Users
     * const { count } = await prisma.user.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends UserDeleteManyArgs>(args?: SelectSubset<T, UserDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Users
     * const user = await prisma.user.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends UserUpdateManyArgs>(args: SelectSubset<T, UserUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Users and returns the data updated in the database.
     * @param {UserUpdateManyAndReturnArgs} args - Arguments to update many Users.
     * @example
     * // Update many Users
     * const user = await prisma.user.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Users and only return the `id`
     * const userWithIdOnly = await prisma.user.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends UserUpdateManyAndReturnArgs>(args: SelectSubset<T, UserUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one User.
     * @param {UserUpsertArgs} args - Arguments to update or create a User.
     * @example
     * // Update or create a User
     * const user = await prisma.user.upsert({
     *   create: {
     *     // ... data to create a User
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the User we want to update
     *   }
     * })
     */
    upsert<T extends UserUpsertArgs>(args: SelectSubset<T, UserUpsertArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserCountArgs} args - Arguments to filter Users to count.
     * @example
     * // Count the number of Users
     * const count = await prisma.user.count({
     *   where: {
     *     // ... the filter for the Users we want to count
     *   }
     * })
    **/
    count<T extends UserCountArgs>(
      args?: Subset<T, UserCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], UserCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends UserAggregateArgs>(args: Subset<T, UserAggregateArgs>): Prisma.PrismaPromise<GetUserAggregateType<T>>

    /**
     * Group by User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends UserGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: UserGroupByArgs['orderBy'] }
        : { orderBy?: UserGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, UserGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetUserGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the User model
   */
  readonly fields: UserFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for User.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__UserClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    projects<T extends User$projectsArgs<ExtArgs> = {}>(args?: Subset<T, User$projectsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$VideoProjectPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the User model
   */
  interface UserFieldRefs {
    readonly id: FieldRef<"User", 'String'>
    readonly email: FieldRef<"User", 'String'>
    readonly fullName: FieldRef<"User", 'String'>
    readonly passwordHash: FieldRef<"User", 'String'>
    readonly createdAt: FieldRef<"User", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * User findUnique
   */
  export type UserFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User findUniqueOrThrow
   */
  export type UserFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User findFirst
   */
  export type UserFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User findFirstOrThrow
   */
  export type UserFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User findMany
   */
  export type UserFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which Users to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User create
   */
  export type UserCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The data needed to create a User.
     */
    data: XOR<UserCreateInput, UserUncheckedCreateInput>
  }

  /**
   * User createMany
   */
  export type UserCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Users.
     */
    data: UserCreateManyInput | UserCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * User createManyAndReturn
   */
  export type UserCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * The data used to create many Users.
     */
    data: UserCreateManyInput | UserCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * User update
   */
  export type UserUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The data needed to update a User.
     */
    data: XOR<UserUpdateInput, UserUncheckedUpdateInput>
    /**
     * Choose, which User to update.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User updateMany
   */
  export type UserUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Users.
     */
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyInput>
    /**
     * Filter which Users to update
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to update.
     */
    limit?: number
  }

  /**
   * User updateManyAndReturn
   */
  export type UserUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * The data used to update Users.
     */
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyInput>
    /**
     * Filter which Users to update
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to update.
     */
    limit?: number
  }

  /**
   * User upsert
   */
  export type UserUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The filter to search for the User to update in case it exists.
     */
    where: UserWhereUniqueInput
    /**
     * In case the User found by the `where` argument doesn't exist, create a new User with this data.
     */
    create: XOR<UserCreateInput, UserUncheckedCreateInput>
    /**
     * In case the User was found with the provided `where` argument, update it with this data.
     */
    update: XOR<UserUpdateInput, UserUncheckedUpdateInput>
  }

  /**
   * User delete
   */
  export type UserDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter which User to delete.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User deleteMany
   */
  export type UserDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Users to delete
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to delete.
     */
    limit?: number
  }

  /**
   * User.projects
   */
  export type User$projectsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VideoProject
     */
    select?: VideoProjectSelect<ExtArgs> | null
    /**
     * Omit specific fields from the VideoProject
     */
    omit?: VideoProjectOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VideoProjectInclude<ExtArgs> | null
    where?: VideoProjectWhereInput
    orderBy?: VideoProjectOrderByWithRelationInput | VideoProjectOrderByWithRelationInput[]
    cursor?: VideoProjectWhereUniqueInput
    take?: number
    skip?: number
    distinct?: VideoProjectScalarFieldEnum | VideoProjectScalarFieldEnum[]
  }

  /**
   * User without action
   */
  export type UserDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
  }


  /**
   * Model VideoProject
   */

  export type AggregateVideoProject = {
    _count: VideoProjectCountAggregateOutputType | null
    _avg: VideoProjectAvgAggregateOutputType | null
    _sum: VideoProjectSumAggregateOutputType | null
    _min: VideoProjectMinAggregateOutputType | null
    _max: VideoProjectMaxAggregateOutputType | null
  }

  export type VideoProjectAvgAggregateOutputType = {
    numberOfScenes: number | null
  }

  export type VideoProjectSumAggregateOutputType = {
    numberOfScenes: number | null
  }

  export type VideoProjectMinAggregateOutputType = {
    id: string | null
    userId: string | null
    title: string | null
    storyTopic: string | null
    characterDescription: string | null
    script: string | null
    contentTone: string | null
    videoGenre: string | null
    numberOfScenes: number | null
    status: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type VideoProjectMaxAggregateOutputType = {
    id: string | null
    userId: string | null
    title: string | null
    storyTopic: string | null
    characterDescription: string | null
    script: string | null
    contentTone: string | null
    videoGenre: string | null
    numberOfScenes: number | null
    status: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type VideoProjectCountAggregateOutputType = {
    id: number
    userId: number
    title: number
    storyTopic: number
    characterDescription: number
    script: number
    contentTone: number
    videoGenre: number
    numberOfScenes: number
    status: number
    videoConfig: number
    imageConfig: number
    audioConfig: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type VideoProjectAvgAggregateInputType = {
    numberOfScenes?: true
  }

  export type VideoProjectSumAggregateInputType = {
    numberOfScenes?: true
  }

  export type VideoProjectMinAggregateInputType = {
    id?: true
    userId?: true
    title?: true
    storyTopic?: true
    characterDescription?: true
    script?: true
    contentTone?: true
    videoGenre?: true
    numberOfScenes?: true
    status?: true
    createdAt?: true
    updatedAt?: true
  }

  export type VideoProjectMaxAggregateInputType = {
    id?: true
    userId?: true
    title?: true
    storyTopic?: true
    characterDescription?: true
    script?: true
    contentTone?: true
    videoGenre?: true
    numberOfScenes?: true
    status?: true
    createdAt?: true
    updatedAt?: true
  }

  export type VideoProjectCountAggregateInputType = {
    id?: true
    userId?: true
    title?: true
    storyTopic?: true
    characterDescription?: true
    script?: true
    contentTone?: true
    videoGenre?: true
    numberOfScenes?: true
    status?: true
    videoConfig?: true
    imageConfig?: true
    audioConfig?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type VideoProjectAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which VideoProject to aggregate.
     */
    where?: VideoProjectWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of VideoProjects to fetch.
     */
    orderBy?: VideoProjectOrderByWithRelationInput | VideoProjectOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: VideoProjectWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` VideoProjects from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` VideoProjects.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned VideoProjects
    **/
    _count?: true | VideoProjectCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: VideoProjectAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: VideoProjectSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: VideoProjectMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: VideoProjectMaxAggregateInputType
  }

  export type GetVideoProjectAggregateType<T extends VideoProjectAggregateArgs> = {
        [P in keyof T & keyof AggregateVideoProject]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateVideoProject[P]>
      : GetScalarType<T[P], AggregateVideoProject[P]>
  }




  export type VideoProjectGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: VideoProjectWhereInput
    orderBy?: VideoProjectOrderByWithAggregationInput | VideoProjectOrderByWithAggregationInput[]
    by: VideoProjectScalarFieldEnum[] | VideoProjectScalarFieldEnum
    having?: VideoProjectScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: VideoProjectCountAggregateInputType | true
    _avg?: VideoProjectAvgAggregateInputType
    _sum?: VideoProjectSumAggregateInputType
    _min?: VideoProjectMinAggregateInputType
    _max?: VideoProjectMaxAggregateInputType
  }

  export type VideoProjectGroupByOutputType = {
    id: string
    userId: string
    title: string
    storyTopic: string | null
    characterDescription: string | null
    script: string | null
    contentTone: string | null
    videoGenre: string | null
    numberOfScenes: number | null
    status: string | null
    videoConfig: JsonValue | null
    imageConfig: JsonValue | null
    audioConfig: JsonValue | null
    createdAt: Date
    updatedAt: Date
    _count: VideoProjectCountAggregateOutputType | null
    _avg: VideoProjectAvgAggregateOutputType | null
    _sum: VideoProjectSumAggregateOutputType | null
    _min: VideoProjectMinAggregateOutputType | null
    _max: VideoProjectMaxAggregateOutputType | null
  }

  type GetVideoProjectGroupByPayload<T extends VideoProjectGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<VideoProjectGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof VideoProjectGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], VideoProjectGroupByOutputType[P]>
            : GetScalarType<T[P], VideoProjectGroupByOutputType[P]>
        }
      >
    >


  export type VideoProjectSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    title?: boolean
    storyTopic?: boolean
    characterDescription?: boolean
    script?: boolean
    contentTone?: boolean
    videoGenre?: boolean
    numberOfScenes?: boolean
    status?: boolean
    videoConfig?: boolean
    imageConfig?: boolean
    audioConfig?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
    generations?: boolean | VideoProject$generationsArgs<ExtArgs>
    _count?: boolean | VideoProjectCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["videoProject"]>

  export type VideoProjectSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    title?: boolean
    storyTopic?: boolean
    characterDescription?: boolean
    script?: boolean
    contentTone?: boolean
    videoGenre?: boolean
    numberOfScenes?: boolean
    status?: boolean
    videoConfig?: boolean
    imageConfig?: boolean
    audioConfig?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["videoProject"]>

  export type VideoProjectSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    title?: boolean
    storyTopic?: boolean
    characterDescription?: boolean
    script?: boolean
    contentTone?: boolean
    videoGenre?: boolean
    numberOfScenes?: boolean
    status?: boolean
    videoConfig?: boolean
    imageConfig?: boolean
    audioConfig?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["videoProject"]>

  export type VideoProjectSelectScalar = {
    id?: boolean
    userId?: boolean
    title?: boolean
    storyTopic?: boolean
    characterDescription?: boolean
    script?: boolean
    contentTone?: boolean
    videoGenre?: boolean
    numberOfScenes?: boolean
    status?: boolean
    videoConfig?: boolean
    imageConfig?: boolean
    audioConfig?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type VideoProjectOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "userId" | "title" | "storyTopic" | "characterDescription" | "script" | "contentTone" | "videoGenre" | "numberOfScenes" | "status" | "videoConfig" | "imageConfig" | "audioConfig" | "createdAt" | "updatedAt", ExtArgs["result"]["videoProject"]>
  export type VideoProjectInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
    generations?: boolean | VideoProject$generationsArgs<ExtArgs>
    _count?: boolean | VideoProjectCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type VideoProjectIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type VideoProjectIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }

  export type $VideoProjectPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "VideoProject"
    objects: {
      user: Prisma.$UserPayload<ExtArgs>
      generations: Prisma.$VideoGenerationPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      userId: string
      title: string
      storyTopic: string | null
      characterDescription: string | null
      script: string | null
      contentTone: string | null
      videoGenre: string | null
      numberOfScenes: number | null
      status: string | null
      videoConfig: Prisma.JsonValue | null
      imageConfig: Prisma.JsonValue | null
      audioConfig: Prisma.JsonValue | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["videoProject"]>
    composites: {}
  }

  type VideoProjectGetPayload<S extends boolean | null | undefined | VideoProjectDefaultArgs> = $Result.GetResult<Prisma.$VideoProjectPayload, S>

  type VideoProjectCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<VideoProjectFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: VideoProjectCountAggregateInputType | true
    }

  export interface VideoProjectDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['VideoProject'], meta: { name: 'VideoProject' } }
    /**
     * Find zero or one VideoProject that matches the filter.
     * @param {VideoProjectFindUniqueArgs} args - Arguments to find a VideoProject
     * @example
     * // Get one VideoProject
     * const videoProject = await prisma.videoProject.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends VideoProjectFindUniqueArgs>(args: SelectSubset<T, VideoProjectFindUniqueArgs<ExtArgs>>): Prisma__VideoProjectClient<$Result.GetResult<Prisma.$VideoProjectPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one VideoProject that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {VideoProjectFindUniqueOrThrowArgs} args - Arguments to find a VideoProject
     * @example
     * // Get one VideoProject
     * const videoProject = await prisma.videoProject.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends VideoProjectFindUniqueOrThrowArgs>(args: SelectSubset<T, VideoProjectFindUniqueOrThrowArgs<ExtArgs>>): Prisma__VideoProjectClient<$Result.GetResult<Prisma.$VideoProjectPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first VideoProject that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VideoProjectFindFirstArgs} args - Arguments to find a VideoProject
     * @example
     * // Get one VideoProject
     * const videoProject = await prisma.videoProject.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends VideoProjectFindFirstArgs>(args?: SelectSubset<T, VideoProjectFindFirstArgs<ExtArgs>>): Prisma__VideoProjectClient<$Result.GetResult<Prisma.$VideoProjectPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first VideoProject that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VideoProjectFindFirstOrThrowArgs} args - Arguments to find a VideoProject
     * @example
     * // Get one VideoProject
     * const videoProject = await prisma.videoProject.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends VideoProjectFindFirstOrThrowArgs>(args?: SelectSubset<T, VideoProjectFindFirstOrThrowArgs<ExtArgs>>): Prisma__VideoProjectClient<$Result.GetResult<Prisma.$VideoProjectPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more VideoProjects that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VideoProjectFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all VideoProjects
     * const videoProjects = await prisma.videoProject.findMany()
     * 
     * // Get first 10 VideoProjects
     * const videoProjects = await prisma.videoProject.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const videoProjectWithIdOnly = await prisma.videoProject.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends VideoProjectFindManyArgs>(args?: SelectSubset<T, VideoProjectFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$VideoProjectPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a VideoProject.
     * @param {VideoProjectCreateArgs} args - Arguments to create a VideoProject.
     * @example
     * // Create one VideoProject
     * const VideoProject = await prisma.videoProject.create({
     *   data: {
     *     // ... data to create a VideoProject
     *   }
     * })
     * 
     */
    create<T extends VideoProjectCreateArgs>(args: SelectSubset<T, VideoProjectCreateArgs<ExtArgs>>): Prisma__VideoProjectClient<$Result.GetResult<Prisma.$VideoProjectPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many VideoProjects.
     * @param {VideoProjectCreateManyArgs} args - Arguments to create many VideoProjects.
     * @example
     * // Create many VideoProjects
     * const videoProject = await prisma.videoProject.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends VideoProjectCreateManyArgs>(args?: SelectSubset<T, VideoProjectCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many VideoProjects and returns the data saved in the database.
     * @param {VideoProjectCreateManyAndReturnArgs} args - Arguments to create many VideoProjects.
     * @example
     * // Create many VideoProjects
     * const videoProject = await prisma.videoProject.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many VideoProjects and only return the `id`
     * const videoProjectWithIdOnly = await prisma.videoProject.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends VideoProjectCreateManyAndReturnArgs>(args?: SelectSubset<T, VideoProjectCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$VideoProjectPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a VideoProject.
     * @param {VideoProjectDeleteArgs} args - Arguments to delete one VideoProject.
     * @example
     * // Delete one VideoProject
     * const VideoProject = await prisma.videoProject.delete({
     *   where: {
     *     // ... filter to delete one VideoProject
     *   }
     * })
     * 
     */
    delete<T extends VideoProjectDeleteArgs>(args: SelectSubset<T, VideoProjectDeleteArgs<ExtArgs>>): Prisma__VideoProjectClient<$Result.GetResult<Prisma.$VideoProjectPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one VideoProject.
     * @param {VideoProjectUpdateArgs} args - Arguments to update one VideoProject.
     * @example
     * // Update one VideoProject
     * const videoProject = await prisma.videoProject.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends VideoProjectUpdateArgs>(args: SelectSubset<T, VideoProjectUpdateArgs<ExtArgs>>): Prisma__VideoProjectClient<$Result.GetResult<Prisma.$VideoProjectPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more VideoProjects.
     * @param {VideoProjectDeleteManyArgs} args - Arguments to filter VideoProjects to delete.
     * @example
     * // Delete a few VideoProjects
     * const { count } = await prisma.videoProject.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends VideoProjectDeleteManyArgs>(args?: SelectSubset<T, VideoProjectDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more VideoProjects.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VideoProjectUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many VideoProjects
     * const videoProject = await prisma.videoProject.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends VideoProjectUpdateManyArgs>(args: SelectSubset<T, VideoProjectUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more VideoProjects and returns the data updated in the database.
     * @param {VideoProjectUpdateManyAndReturnArgs} args - Arguments to update many VideoProjects.
     * @example
     * // Update many VideoProjects
     * const videoProject = await prisma.videoProject.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more VideoProjects and only return the `id`
     * const videoProjectWithIdOnly = await prisma.videoProject.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends VideoProjectUpdateManyAndReturnArgs>(args: SelectSubset<T, VideoProjectUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$VideoProjectPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one VideoProject.
     * @param {VideoProjectUpsertArgs} args - Arguments to update or create a VideoProject.
     * @example
     * // Update or create a VideoProject
     * const videoProject = await prisma.videoProject.upsert({
     *   create: {
     *     // ... data to create a VideoProject
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the VideoProject we want to update
     *   }
     * })
     */
    upsert<T extends VideoProjectUpsertArgs>(args: SelectSubset<T, VideoProjectUpsertArgs<ExtArgs>>): Prisma__VideoProjectClient<$Result.GetResult<Prisma.$VideoProjectPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of VideoProjects.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VideoProjectCountArgs} args - Arguments to filter VideoProjects to count.
     * @example
     * // Count the number of VideoProjects
     * const count = await prisma.videoProject.count({
     *   where: {
     *     // ... the filter for the VideoProjects we want to count
     *   }
     * })
    **/
    count<T extends VideoProjectCountArgs>(
      args?: Subset<T, VideoProjectCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], VideoProjectCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a VideoProject.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VideoProjectAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends VideoProjectAggregateArgs>(args: Subset<T, VideoProjectAggregateArgs>): Prisma.PrismaPromise<GetVideoProjectAggregateType<T>>

    /**
     * Group by VideoProject.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VideoProjectGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends VideoProjectGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: VideoProjectGroupByArgs['orderBy'] }
        : { orderBy?: VideoProjectGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, VideoProjectGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetVideoProjectGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the VideoProject model
   */
  readonly fields: VideoProjectFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for VideoProject.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__VideoProjectClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    user<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    generations<T extends VideoProject$generationsArgs<ExtArgs> = {}>(args?: Subset<T, VideoProject$generationsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$VideoGenerationPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the VideoProject model
   */
  interface VideoProjectFieldRefs {
    readonly id: FieldRef<"VideoProject", 'String'>
    readonly userId: FieldRef<"VideoProject", 'String'>
    readonly title: FieldRef<"VideoProject", 'String'>
    readonly storyTopic: FieldRef<"VideoProject", 'String'>
    readonly characterDescription: FieldRef<"VideoProject", 'String'>
    readonly script: FieldRef<"VideoProject", 'String'>
    readonly contentTone: FieldRef<"VideoProject", 'String'>
    readonly videoGenre: FieldRef<"VideoProject", 'String'>
    readonly numberOfScenes: FieldRef<"VideoProject", 'Int'>
    readonly status: FieldRef<"VideoProject", 'String'>
    readonly videoConfig: FieldRef<"VideoProject", 'Json'>
    readonly imageConfig: FieldRef<"VideoProject", 'Json'>
    readonly audioConfig: FieldRef<"VideoProject", 'Json'>
    readonly createdAt: FieldRef<"VideoProject", 'DateTime'>
    readonly updatedAt: FieldRef<"VideoProject", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * VideoProject findUnique
   */
  export type VideoProjectFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VideoProject
     */
    select?: VideoProjectSelect<ExtArgs> | null
    /**
     * Omit specific fields from the VideoProject
     */
    omit?: VideoProjectOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VideoProjectInclude<ExtArgs> | null
    /**
     * Filter, which VideoProject to fetch.
     */
    where: VideoProjectWhereUniqueInput
  }

  /**
   * VideoProject findUniqueOrThrow
   */
  export type VideoProjectFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VideoProject
     */
    select?: VideoProjectSelect<ExtArgs> | null
    /**
     * Omit specific fields from the VideoProject
     */
    omit?: VideoProjectOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VideoProjectInclude<ExtArgs> | null
    /**
     * Filter, which VideoProject to fetch.
     */
    where: VideoProjectWhereUniqueInput
  }

  /**
   * VideoProject findFirst
   */
  export type VideoProjectFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VideoProject
     */
    select?: VideoProjectSelect<ExtArgs> | null
    /**
     * Omit specific fields from the VideoProject
     */
    omit?: VideoProjectOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VideoProjectInclude<ExtArgs> | null
    /**
     * Filter, which VideoProject to fetch.
     */
    where?: VideoProjectWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of VideoProjects to fetch.
     */
    orderBy?: VideoProjectOrderByWithRelationInput | VideoProjectOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for VideoProjects.
     */
    cursor?: VideoProjectWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` VideoProjects from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` VideoProjects.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of VideoProjects.
     */
    distinct?: VideoProjectScalarFieldEnum | VideoProjectScalarFieldEnum[]
  }

  /**
   * VideoProject findFirstOrThrow
   */
  export type VideoProjectFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VideoProject
     */
    select?: VideoProjectSelect<ExtArgs> | null
    /**
     * Omit specific fields from the VideoProject
     */
    omit?: VideoProjectOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VideoProjectInclude<ExtArgs> | null
    /**
     * Filter, which VideoProject to fetch.
     */
    where?: VideoProjectWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of VideoProjects to fetch.
     */
    orderBy?: VideoProjectOrderByWithRelationInput | VideoProjectOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for VideoProjects.
     */
    cursor?: VideoProjectWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` VideoProjects from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` VideoProjects.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of VideoProjects.
     */
    distinct?: VideoProjectScalarFieldEnum | VideoProjectScalarFieldEnum[]
  }

  /**
   * VideoProject findMany
   */
  export type VideoProjectFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VideoProject
     */
    select?: VideoProjectSelect<ExtArgs> | null
    /**
     * Omit specific fields from the VideoProject
     */
    omit?: VideoProjectOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VideoProjectInclude<ExtArgs> | null
    /**
     * Filter, which VideoProjects to fetch.
     */
    where?: VideoProjectWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of VideoProjects to fetch.
     */
    orderBy?: VideoProjectOrderByWithRelationInput | VideoProjectOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing VideoProjects.
     */
    cursor?: VideoProjectWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` VideoProjects from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` VideoProjects.
     */
    skip?: number
    distinct?: VideoProjectScalarFieldEnum | VideoProjectScalarFieldEnum[]
  }

  /**
   * VideoProject create
   */
  export type VideoProjectCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VideoProject
     */
    select?: VideoProjectSelect<ExtArgs> | null
    /**
     * Omit specific fields from the VideoProject
     */
    omit?: VideoProjectOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VideoProjectInclude<ExtArgs> | null
    /**
     * The data needed to create a VideoProject.
     */
    data: XOR<VideoProjectCreateInput, VideoProjectUncheckedCreateInput>
  }

  /**
   * VideoProject createMany
   */
  export type VideoProjectCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many VideoProjects.
     */
    data: VideoProjectCreateManyInput | VideoProjectCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * VideoProject createManyAndReturn
   */
  export type VideoProjectCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VideoProject
     */
    select?: VideoProjectSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the VideoProject
     */
    omit?: VideoProjectOmit<ExtArgs> | null
    /**
     * The data used to create many VideoProjects.
     */
    data: VideoProjectCreateManyInput | VideoProjectCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VideoProjectIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * VideoProject update
   */
  export type VideoProjectUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VideoProject
     */
    select?: VideoProjectSelect<ExtArgs> | null
    /**
     * Omit specific fields from the VideoProject
     */
    omit?: VideoProjectOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VideoProjectInclude<ExtArgs> | null
    /**
     * The data needed to update a VideoProject.
     */
    data: XOR<VideoProjectUpdateInput, VideoProjectUncheckedUpdateInput>
    /**
     * Choose, which VideoProject to update.
     */
    where: VideoProjectWhereUniqueInput
  }

  /**
   * VideoProject updateMany
   */
  export type VideoProjectUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update VideoProjects.
     */
    data: XOR<VideoProjectUpdateManyMutationInput, VideoProjectUncheckedUpdateManyInput>
    /**
     * Filter which VideoProjects to update
     */
    where?: VideoProjectWhereInput
    /**
     * Limit how many VideoProjects to update.
     */
    limit?: number
  }

  /**
   * VideoProject updateManyAndReturn
   */
  export type VideoProjectUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VideoProject
     */
    select?: VideoProjectSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the VideoProject
     */
    omit?: VideoProjectOmit<ExtArgs> | null
    /**
     * The data used to update VideoProjects.
     */
    data: XOR<VideoProjectUpdateManyMutationInput, VideoProjectUncheckedUpdateManyInput>
    /**
     * Filter which VideoProjects to update
     */
    where?: VideoProjectWhereInput
    /**
     * Limit how many VideoProjects to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VideoProjectIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * VideoProject upsert
   */
  export type VideoProjectUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VideoProject
     */
    select?: VideoProjectSelect<ExtArgs> | null
    /**
     * Omit specific fields from the VideoProject
     */
    omit?: VideoProjectOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VideoProjectInclude<ExtArgs> | null
    /**
     * The filter to search for the VideoProject to update in case it exists.
     */
    where: VideoProjectWhereUniqueInput
    /**
     * In case the VideoProject found by the `where` argument doesn't exist, create a new VideoProject with this data.
     */
    create: XOR<VideoProjectCreateInput, VideoProjectUncheckedCreateInput>
    /**
     * In case the VideoProject was found with the provided `where` argument, update it with this data.
     */
    update: XOR<VideoProjectUpdateInput, VideoProjectUncheckedUpdateInput>
  }

  /**
   * VideoProject delete
   */
  export type VideoProjectDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VideoProject
     */
    select?: VideoProjectSelect<ExtArgs> | null
    /**
     * Omit specific fields from the VideoProject
     */
    omit?: VideoProjectOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VideoProjectInclude<ExtArgs> | null
    /**
     * Filter which VideoProject to delete.
     */
    where: VideoProjectWhereUniqueInput
  }

  /**
   * VideoProject deleteMany
   */
  export type VideoProjectDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which VideoProjects to delete
     */
    where?: VideoProjectWhereInput
    /**
     * Limit how many VideoProjects to delete.
     */
    limit?: number
  }

  /**
   * VideoProject.generations
   */
  export type VideoProject$generationsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VideoGeneration
     */
    select?: VideoGenerationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the VideoGeneration
     */
    omit?: VideoGenerationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VideoGenerationInclude<ExtArgs> | null
    where?: VideoGenerationWhereInput
    orderBy?: VideoGenerationOrderByWithRelationInput | VideoGenerationOrderByWithRelationInput[]
    cursor?: VideoGenerationWhereUniqueInput
    take?: number
    skip?: number
    distinct?: VideoGenerationScalarFieldEnum | VideoGenerationScalarFieldEnum[]
  }

  /**
   * VideoProject without action
   */
  export type VideoProjectDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VideoProject
     */
    select?: VideoProjectSelect<ExtArgs> | null
    /**
     * Omit specific fields from the VideoProject
     */
    omit?: VideoProjectOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VideoProjectInclude<ExtArgs> | null
  }


  /**
   * Model VideoGeneration
   */

  export type AggregateVideoGeneration = {
    _count: VideoGenerationCountAggregateOutputType | null
    _avg: VideoGenerationAvgAggregateOutputType | null
    _sum: VideoGenerationSumAggregateOutputType | null
    _min: VideoGenerationMinAggregateOutputType | null
    _max: VideoGenerationMaxAggregateOutputType | null
  }

  export type VideoGenerationAvgAggregateOutputType = {
    generationNo: number | null
    durationSeconds: number | null
  }

  export type VideoGenerationSumAggregateOutputType = {
    generationNo: number | null
    durationSeconds: number | null
  }

  export type VideoGenerationMinAggregateOutputType = {
    id: string | null
    projectId: string | null
    generationNo: number | null
    aiModel: string | null
    resolution: string | null
    aspectRatio: string | null
    status: string | null
    outputUrl: string | null
    thumbnailUrl: string | null
    durationSeconds: number | null
    createdAt: Date | null
  }

  export type VideoGenerationMaxAggregateOutputType = {
    id: string | null
    projectId: string | null
    generationNo: number | null
    aiModel: string | null
    resolution: string | null
    aspectRatio: string | null
    status: string | null
    outputUrl: string | null
    thumbnailUrl: string | null
    durationSeconds: number | null
    createdAt: Date | null
  }

  export type VideoGenerationCountAggregateOutputType = {
    id: number
    projectId: number
    generationNo: number
    aiModel: number
    resolution: number
    aspectRatio: number
    voiceSettings: number
    status: number
    outputUrl: number
    thumbnailUrl: number
    durationSeconds: number
    createdAt: number
    _all: number
  }


  export type VideoGenerationAvgAggregateInputType = {
    generationNo?: true
    durationSeconds?: true
  }

  export type VideoGenerationSumAggregateInputType = {
    generationNo?: true
    durationSeconds?: true
  }

  export type VideoGenerationMinAggregateInputType = {
    id?: true
    projectId?: true
    generationNo?: true
    aiModel?: true
    resolution?: true
    aspectRatio?: true
    status?: true
    outputUrl?: true
    thumbnailUrl?: true
    durationSeconds?: true
    createdAt?: true
  }

  export type VideoGenerationMaxAggregateInputType = {
    id?: true
    projectId?: true
    generationNo?: true
    aiModel?: true
    resolution?: true
    aspectRatio?: true
    status?: true
    outputUrl?: true
    thumbnailUrl?: true
    durationSeconds?: true
    createdAt?: true
  }

  export type VideoGenerationCountAggregateInputType = {
    id?: true
    projectId?: true
    generationNo?: true
    aiModel?: true
    resolution?: true
    aspectRatio?: true
    voiceSettings?: true
    status?: true
    outputUrl?: true
    thumbnailUrl?: true
    durationSeconds?: true
    createdAt?: true
    _all?: true
  }

  export type VideoGenerationAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which VideoGeneration to aggregate.
     */
    where?: VideoGenerationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of VideoGenerations to fetch.
     */
    orderBy?: VideoGenerationOrderByWithRelationInput | VideoGenerationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: VideoGenerationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` VideoGenerations from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` VideoGenerations.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned VideoGenerations
    **/
    _count?: true | VideoGenerationCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: VideoGenerationAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: VideoGenerationSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: VideoGenerationMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: VideoGenerationMaxAggregateInputType
  }

  export type GetVideoGenerationAggregateType<T extends VideoGenerationAggregateArgs> = {
        [P in keyof T & keyof AggregateVideoGeneration]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateVideoGeneration[P]>
      : GetScalarType<T[P], AggregateVideoGeneration[P]>
  }




  export type VideoGenerationGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: VideoGenerationWhereInput
    orderBy?: VideoGenerationOrderByWithAggregationInput | VideoGenerationOrderByWithAggregationInput[]
    by: VideoGenerationScalarFieldEnum[] | VideoGenerationScalarFieldEnum
    having?: VideoGenerationScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: VideoGenerationCountAggregateInputType | true
    _avg?: VideoGenerationAvgAggregateInputType
    _sum?: VideoGenerationSumAggregateInputType
    _min?: VideoGenerationMinAggregateInputType
    _max?: VideoGenerationMaxAggregateInputType
  }

  export type VideoGenerationGroupByOutputType = {
    id: string
    projectId: string
    generationNo: number
    aiModel: string | null
    resolution: string | null
    aspectRatio: string | null
    voiceSettings: JsonValue | null
    status: string | null
    outputUrl: string | null
    thumbnailUrl: string | null
    durationSeconds: number | null
    createdAt: Date
    _count: VideoGenerationCountAggregateOutputType | null
    _avg: VideoGenerationAvgAggregateOutputType | null
    _sum: VideoGenerationSumAggregateOutputType | null
    _min: VideoGenerationMinAggregateOutputType | null
    _max: VideoGenerationMaxAggregateOutputType | null
  }

  type GetVideoGenerationGroupByPayload<T extends VideoGenerationGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<VideoGenerationGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof VideoGenerationGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], VideoGenerationGroupByOutputType[P]>
            : GetScalarType<T[P], VideoGenerationGroupByOutputType[P]>
        }
      >
    >


  export type VideoGenerationSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    projectId?: boolean
    generationNo?: boolean
    aiModel?: boolean
    resolution?: boolean
    aspectRatio?: boolean
    voiceSettings?: boolean
    status?: boolean
    outputUrl?: boolean
    thumbnailUrl?: boolean
    durationSeconds?: boolean
    createdAt?: boolean
    project?: boolean | VideoProjectDefaultArgs<ExtArgs>
    scenes?: boolean | VideoGeneration$scenesArgs<ExtArgs>
    _count?: boolean | VideoGenerationCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["videoGeneration"]>

  export type VideoGenerationSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    projectId?: boolean
    generationNo?: boolean
    aiModel?: boolean
    resolution?: boolean
    aspectRatio?: boolean
    voiceSettings?: boolean
    status?: boolean
    outputUrl?: boolean
    thumbnailUrl?: boolean
    durationSeconds?: boolean
    createdAt?: boolean
    project?: boolean | VideoProjectDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["videoGeneration"]>

  export type VideoGenerationSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    projectId?: boolean
    generationNo?: boolean
    aiModel?: boolean
    resolution?: boolean
    aspectRatio?: boolean
    voiceSettings?: boolean
    status?: boolean
    outputUrl?: boolean
    thumbnailUrl?: boolean
    durationSeconds?: boolean
    createdAt?: boolean
    project?: boolean | VideoProjectDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["videoGeneration"]>

  export type VideoGenerationSelectScalar = {
    id?: boolean
    projectId?: boolean
    generationNo?: boolean
    aiModel?: boolean
    resolution?: boolean
    aspectRatio?: boolean
    voiceSettings?: boolean
    status?: boolean
    outputUrl?: boolean
    thumbnailUrl?: boolean
    durationSeconds?: boolean
    createdAt?: boolean
  }

  export type VideoGenerationOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "projectId" | "generationNo" | "aiModel" | "resolution" | "aspectRatio" | "voiceSettings" | "status" | "outputUrl" | "thumbnailUrl" | "durationSeconds" | "createdAt", ExtArgs["result"]["videoGeneration"]>
  export type VideoGenerationInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    project?: boolean | VideoProjectDefaultArgs<ExtArgs>
    scenes?: boolean | VideoGeneration$scenesArgs<ExtArgs>
    _count?: boolean | VideoGenerationCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type VideoGenerationIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    project?: boolean | VideoProjectDefaultArgs<ExtArgs>
  }
  export type VideoGenerationIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    project?: boolean | VideoProjectDefaultArgs<ExtArgs>
  }

  export type $VideoGenerationPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "VideoGeneration"
    objects: {
      project: Prisma.$VideoProjectPayload<ExtArgs>
      scenes: Prisma.$VideoScenePayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      projectId: string
      generationNo: number
      aiModel: string | null
      resolution: string | null
      aspectRatio: string | null
      voiceSettings: Prisma.JsonValue | null
      status: string | null
      outputUrl: string | null
      thumbnailUrl: string | null
      durationSeconds: number | null
      createdAt: Date
    }, ExtArgs["result"]["videoGeneration"]>
    composites: {}
  }

  type VideoGenerationGetPayload<S extends boolean | null | undefined | VideoGenerationDefaultArgs> = $Result.GetResult<Prisma.$VideoGenerationPayload, S>

  type VideoGenerationCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<VideoGenerationFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: VideoGenerationCountAggregateInputType | true
    }

  export interface VideoGenerationDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['VideoGeneration'], meta: { name: 'VideoGeneration' } }
    /**
     * Find zero or one VideoGeneration that matches the filter.
     * @param {VideoGenerationFindUniqueArgs} args - Arguments to find a VideoGeneration
     * @example
     * // Get one VideoGeneration
     * const videoGeneration = await prisma.videoGeneration.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends VideoGenerationFindUniqueArgs>(args: SelectSubset<T, VideoGenerationFindUniqueArgs<ExtArgs>>): Prisma__VideoGenerationClient<$Result.GetResult<Prisma.$VideoGenerationPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one VideoGeneration that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {VideoGenerationFindUniqueOrThrowArgs} args - Arguments to find a VideoGeneration
     * @example
     * // Get one VideoGeneration
     * const videoGeneration = await prisma.videoGeneration.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends VideoGenerationFindUniqueOrThrowArgs>(args: SelectSubset<T, VideoGenerationFindUniqueOrThrowArgs<ExtArgs>>): Prisma__VideoGenerationClient<$Result.GetResult<Prisma.$VideoGenerationPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first VideoGeneration that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VideoGenerationFindFirstArgs} args - Arguments to find a VideoGeneration
     * @example
     * // Get one VideoGeneration
     * const videoGeneration = await prisma.videoGeneration.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends VideoGenerationFindFirstArgs>(args?: SelectSubset<T, VideoGenerationFindFirstArgs<ExtArgs>>): Prisma__VideoGenerationClient<$Result.GetResult<Prisma.$VideoGenerationPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first VideoGeneration that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VideoGenerationFindFirstOrThrowArgs} args - Arguments to find a VideoGeneration
     * @example
     * // Get one VideoGeneration
     * const videoGeneration = await prisma.videoGeneration.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends VideoGenerationFindFirstOrThrowArgs>(args?: SelectSubset<T, VideoGenerationFindFirstOrThrowArgs<ExtArgs>>): Prisma__VideoGenerationClient<$Result.GetResult<Prisma.$VideoGenerationPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more VideoGenerations that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VideoGenerationFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all VideoGenerations
     * const videoGenerations = await prisma.videoGeneration.findMany()
     * 
     * // Get first 10 VideoGenerations
     * const videoGenerations = await prisma.videoGeneration.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const videoGenerationWithIdOnly = await prisma.videoGeneration.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends VideoGenerationFindManyArgs>(args?: SelectSubset<T, VideoGenerationFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$VideoGenerationPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a VideoGeneration.
     * @param {VideoGenerationCreateArgs} args - Arguments to create a VideoGeneration.
     * @example
     * // Create one VideoGeneration
     * const VideoGeneration = await prisma.videoGeneration.create({
     *   data: {
     *     // ... data to create a VideoGeneration
     *   }
     * })
     * 
     */
    create<T extends VideoGenerationCreateArgs>(args: SelectSubset<T, VideoGenerationCreateArgs<ExtArgs>>): Prisma__VideoGenerationClient<$Result.GetResult<Prisma.$VideoGenerationPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many VideoGenerations.
     * @param {VideoGenerationCreateManyArgs} args - Arguments to create many VideoGenerations.
     * @example
     * // Create many VideoGenerations
     * const videoGeneration = await prisma.videoGeneration.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends VideoGenerationCreateManyArgs>(args?: SelectSubset<T, VideoGenerationCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many VideoGenerations and returns the data saved in the database.
     * @param {VideoGenerationCreateManyAndReturnArgs} args - Arguments to create many VideoGenerations.
     * @example
     * // Create many VideoGenerations
     * const videoGeneration = await prisma.videoGeneration.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many VideoGenerations and only return the `id`
     * const videoGenerationWithIdOnly = await prisma.videoGeneration.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends VideoGenerationCreateManyAndReturnArgs>(args?: SelectSubset<T, VideoGenerationCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$VideoGenerationPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a VideoGeneration.
     * @param {VideoGenerationDeleteArgs} args - Arguments to delete one VideoGeneration.
     * @example
     * // Delete one VideoGeneration
     * const VideoGeneration = await prisma.videoGeneration.delete({
     *   where: {
     *     // ... filter to delete one VideoGeneration
     *   }
     * })
     * 
     */
    delete<T extends VideoGenerationDeleteArgs>(args: SelectSubset<T, VideoGenerationDeleteArgs<ExtArgs>>): Prisma__VideoGenerationClient<$Result.GetResult<Prisma.$VideoGenerationPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one VideoGeneration.
     * @param {VideoGenerationUpdateArgs} args - Arguments to update one VideoGeneration.
     * @example
     * // Update one VideoGeneration
     * const videoGeneration = await prisma.videoGeneration.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends VideoGenerationUpdateArgs>(args: SelectSubset<T, VideoGenerationUpdateArgs<ExtArgs>>): Prisma__VideoGenerationClient<$Result.GetResult<Prisma.$VideoGenerationPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more VideoGenerations.
     * @param {VideoGenerationDeleteManyArgs} args - Arguments to filter VideoGenerations to delete.
     * @example
     * // Delete a few VideoGenerations
     * const { count } = await prisma.videoGeneration.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends VideoGenerationDeleteManyArgs>(args?: SelectSubset<T, VideoGenerationDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more VideoGenerations.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VideoGenerationUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many VideoGenerations
     * const videoGeneration = await prisma.videoGeneration.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends VideoGenerationUpdateManyArgs>(args: SelectSubset<T, VideoGenerationUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more VideoGenerations and returns the data updated in the database.
     * @param {VideoGenerationUpdateManyAndReturnArgs} args - Arguments to update many VideoGenerations.
     * @example
     * // Update many VideoGenerations
     * const videoGeneration = await prisma.videoGeneration.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more VideoGenerations and only return the `id`
     * const videoGenerationWithIdOnly = await prisma.videoGeneration.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends VideoGenerationUpdateManyAndReturnArgs>(args: SelectSubset<T, VideoGenerationUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$VideoGenerationPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one VideoGeneration.
     * @param {VideoGenerationUpsertArgs} args - Arguments to update or create a VideoGeneration.
     * @example
     * // Update or create a VideoGeneration
     * const videoGeneration = await prisma.videoGeneration.upsert({
     *   create: {
     *     // ... data to create a VideoGeneration
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the VideoGeneration we want to update
     *   }
     * })
     */
    upsert<T extends VideoGenerationUpsertArgs>(args: SelectSubset<T, VideoGenerationUpsertArgs<ExtArgs>>): Prisma__VideoGenerationClient<$Result.GetResult<Prisma.$VideoGenerationPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of VideoGenerations.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VideoGenerationCountArgs} args - Arguments to filter VideoGenerations to count.
     * @example
     * // Count the number of VideoGenerations
     * const count = await prisma.videoGeneration.count({
     *   where: {
     *     // ... the filter for the VideoGenerations we want to count
     *   }
     * })
    **/
    count<T extends VideoGenerationCountArgs>(
      args?: Subset<T, VideoGenerationCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], VideoGenerationCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a VideoGeneration.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VideoGenerationAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends VideoGenerationAggregateArgs>(args: Subset<T, VideoGenerationAggregateArgs>): Prisma.PrismaPromise<GetVideoGenerationAggregateType<T>>

    /**
     * Group by VideoGeneration.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VideoGenerationGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends VideoGenerationGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: VideoGenerationGroupByArgs['orderBy'] }
        : { orderBy?: VideoGenerationGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, VideoGenerationGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetVideoGenerationGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the VideoGeneration model
   */
  readonly fields: VideoGenerationFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for VideoGeneration.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__VideoGenerationClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    project<T extends VideoProjectDefaultArgs<ExtArgs> = {}>(args?: Subset<T, VideoProjectDefaultArgs<ExtArgs>>): Prisma__VideoProjectClient<$Result.GetResult<Prisma.$VideoProjectPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    scenes<T extends VideoGeneration$scenesArgs<ExtArgs> = {}>(args?: Subset<T, VideoGeneration$scenesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$VideoScenePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the VideoGeneration model
   */
  interface VideoGenerationFieldRefs {
    readonly id: FieldRef<"VideoGeneration", 'String'>
    readonly projectId: FieldRef<"VideoGeneration", 'String'>
    readonly generationNo: FieldRef<"VideoGeneration", 'Int'>
    readonly aiModel: FieldRef<"VideoGeneration", 'String'>
    readonly resolution: FieldRef<"VideoGeneration", 'String'>
    readonly aspectRatio: FieldRef<"VideoGeneration", 'String'>
    readonly voiceSettings: FieldRef<"VideoGeneration", 'Json'>
    readonly status: FieldRef<"VideoGeneration", 'String'>
    readonly outputUrl: FieldRef<"VideoGeneration", 'String'>
    readonly thumbnailUrl: FieldRef<"VideoGeneration", 'String'>
    readonly durationSeconds: FieldRef<"VideoGeneration", 'Int'>
    readonly createdAt: FieldRef<"VideoGeneration", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * VideoGeneration findUnique
   */
  export type VideoGenerationFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VideoGeneration
     */
    select?: VideoGenerationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the VideoGeneration
     */
    omit?: VideoGenerationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VideoGenerationInclude<ExtArgs> | null
    /**
     * Filter, which VideoGeneration to fetch.
     */
    where: VideoGenerationWhereUniqueInput
  }

  /**
   * VideoGeneration findUniqueOrThrow
   */
  export type VideoGenerationFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VideoGeneration
     */
    select?: VideoGenerationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the VideoGeneration
     */
    omit?: VideoGenerationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VideoGenerationInclude<ExtArgs> | null
    /**
     * Filter, which VideoGeneration to fetch.
     */
    where: VideoGenerationWhereUniqueInput
  }

  /**
   * VideoGeneration findFirst
   */
  export type VideoGenerationFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VideoGeneration
     */
    select?: VideoGenerationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the VideoGeneration
     */
    omit?: VideoGenerationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VideoGenerationInclude<ExtArgs> | null
    /**
     * Filter, which VideoGeneration to fetch.
     */
    where?: VideoGenerationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of VideoGenerations to fetch.
     */
    orderBy?: VideoGenerationOrderByWithRelationInput | VideoGenerationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for VideoGenerations.
     */
    cursor?: VideoGenerationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` VideoGenerations from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` VideoGenerations.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of VideoGenerations.
     */
    distinct?: VideoGenerationScalarFieldEnum | VideoGenerationScalarFieldEnum[]
  }

  /**
   * VideoGeneration findFirstOrThrow
   */
  export type VideoGenerationFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VideoGeneration
     */
    select?: VideoGenerationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the VideoGeneration
     */
    omit?: VideoGenerationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VideoGenerationInclude<ExtArgs> | null
    /**
     * Filter, which VideoGeneration to fetch.
     */
    where?: VideoGenerationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of VideoGenerations to fetch.
     */
    orderBy?: VideoGenerationOrderByWithRelationInput | VideoGenerationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for VideoGenerations.
     */
    cursor?: VideoGenerationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` VideoGenerations from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` VideoGenerations.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of VideoGenerations.
     */
    distinct?: VideoGenerationScalarFieldEnum | VideoGenerationScalarFieldEnum[]
  }

  /**
   * VideoGeneration findMany
   */
  export type VideoGenerationFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VideoGeneration
     */
    select?: VideoGenerationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the VideoGeneration
     */
    omit?: VideoGenerationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VideoGenerationInclude<ExtArgs> | null
    /**
     * Filter, which VideoGenerations to fetch.
     */
    where?: VideoGenerationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of VideoGenerations to fetch.
     */
    orderBy?: VideoGenerationOrderByWithRelationInput | VideoGenerationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing VideoGenerations.
     */
    cursor?: VideoGenerationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` VideoGenerations from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` VideoGenerations.
     */
    skip?: number
    distinct?: VideoGenerationScalarFieldEnum | VideoGenerationScalarFieldEnum[]
  }

  /**
   * VideoGeneration create
   */
  export type VideoGenerationCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VideoGeneration
     */
    select?: VideoGenerationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the VideoGeneration
     */
    omit?: VideoGenerationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VideoGenerationInclude<ExtArgs> | null
    /**
     * The data needed to create a VideoGeneration.
     */
    data: XOR<VideoGenerationCreateInput, VideoGenerationUncheckedCreateInput>
  }

  /**
   * VideoGeneration createMany
   */
  export type VideoGenerationCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many VideoGenerations.
     */
    data: VideoGenerationCreateManyInput | VideoGenerationCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * VideoGeneration createManyAndReturn
   */
  export type VideoGenerationCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VideoGeneration
     */
    select?: VideoGenerationSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the VideoGeneration
     */
    omit?: VideoGenerationOmit<ExtArgs> | null
    /**
     * The data used to create many VideoGenerations.
     */
    data: VideoGenerationCreateManyInput | VideoGenerationCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VideoGenerationIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * VideoGeneration update
   */
  export type VideoGenerationUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VideoGeneration
     */
    select?: VideoGenerationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the VideoGeneration
     */
    omit?: VideoGenerationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VideoGenerationInclude<ExtArgs> | null
    /**
     * The data needed to update a VideoGeneration.
     */
    data: XOR<VideoGenerationUpdateInput, VideoGenerationUncheckedUpdateInput>
    /**
     * Choose, which VideoGeneration to update.
     */
    where: VideoGenerationWhereUniqueInput
  }

  /**
   * VideoGeneration updateMany
   */
  export type VideoGenerationUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update VideoGenerations.
     */
    data: XOR<VideoGenerationUpdateManyMutationInput, VideoGenerationUncheckedUpdateManyInput>
    /**
     * Filter which VideoGenerations to update
     */
    where?: VideoGenerationWhereInput
    /**
     * Limit how many VideoGenerations to update.
     */
    limit?: number
  }

  /**
   * VideoGeneration updateManyAndReturn
   */
  export type VideoGenerationUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VideoGeneration
     */
    select?: VideoGenerationSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the VideoGeneration
     */
    omit?: VideoGenerationOmit<ExtArgs> | null
    /**
     * The data used to update VideoGenerations.
     */
    data: XOR<VideoGenerationUpdateManyMutationInput, VideoGenerationUncheckedUpdateManyInput>
    /**
     * Filter which VideoGenerations to update
     */
    where?: VideoGenerationWhereInput
    /**
     * Limit how many VideoGenerations to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VideoGenerationIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * VideoGeneration upsert
   */
  export type VideoGenerationUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VideoGeneration
     */
    select?: VideoGenerationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the VideoGeneration
     */
    omit?: VideoGenerationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VideoGenerationInclude<ExtArgs> | null
    /**
     * The filter to search for the VideoGeneration to update in case it exists.
     */
    where: VideoGenerationWhereUniqueInput
    /**
     * In case the VideoGeneration found by the `where` argument doesn't exist, create a new VideoGeneration with this data.
     */
    create: XOR<VideoGenerationCreateInput, VideoGenerationUncheckedCreateInput>
    /**
     * In case the VideoGeneration was found with the provided `where` argument, update it with this data.
     */
    update: XOR<VideoGenerationUpdateInput, VideoGenerationUncheckedUpdateInput>
  }

  /**
   * VideoGeneration delete
   */
  export type VideoGenerationDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VideoGeneration
     */
    select?: VideoGenerationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the VideoGeneration
     */
    omit?: VideoGenerationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VideoGenerationInclude<ExtArgs> | null
    /**
     * Filter which VideoGeneration to delete.
     */
    where: VideoGenerationWhereUniqueInput
  }

  /**
   * VideoGeneration deleteMany
   */
  export type VideoGenerationDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which VideoGenerations to delete
     */
    where?: VideoGenerationWhereInput
    /**
     * Limit how many VideoGenerations to delete.
     */
    limit?: number
  }

  /**
   * VideoGeneration.scenes
   */
  export type VideoGeneration$scenesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VideoScene
     */
    select?: VideoSceneSelect<ExtArgs> | null
    /**
     * Omit specific fields from the VideoScene
     */
    omit?: VideoSceneOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VideoSceneInclude<ExtArgs> | null
    where?: VideoSceneWhereInput
    orderBy?: VideoSceneOrderByWithRelationInput | VideoSceneOrderByWithRelationInput[]
    cursor?: VideoSceneWhereUniqueInput
    take?: number
    skip?: number
    distinct?: VideoSceneScalarFieldEnum | VideoSceneScalarFieldEnum[]
  }

  /**
   * VideoGeneration without action
   */
  export type VideoGenerationDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VideoGeneration
     */
    select?: VideoGenerationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the VideoGeneration
     */
    omit?: VideoGenerationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VideoGenerationInclude<ExtArgs> | null
  }


  /**
   * Model VideoScene
   */

  export type AggregateVideoScene = {
    _count: VideoSceneCountAggregateOutputType | null
    _avg: VideoSceneAvgAggregateOutputType | null
    _sum: VideoSceneSumAggregateOutputType | null
    _min: VideoSceneMinAggregateOutputType | null
    _max: VideoSceneMaxAggregateOutputType | null
  }

  export type VideoSceneAvgAggregateOutputType = {
    sceneOrder: number | null
  }

  export type VideoSceneSumAggregateOutputType = {
    sceneOrder: number | null
  }

  export type VideoSceneMinAggregateOutputType = {
    id: string | null
    generationId: string | null
    sceneOrder: number | null
    promptText: string | null
    imageUrl: string | null
    audioUrl: string | null
  }

  export type VideoSceneMaxAggregateOutputType = {
    id: string | null
    generationId: string | null
    sceneOrder: number | null
    promptText: string | null
    imageUrl: string | null
    audioUrl: string | null
  }

  export type VideoSceneCountAggregateOutputType = {
    id: number
    generationId: number
    sceneOrder: number
    promptText: number
    imageUrl: number
    audioUrl: number
    _all: number
  }


  export type VideoSceneAvgAggregateInputType = {
    sceneOrder?: true
  }

  export type VideoSceneSumAggregateInputType = {
    sceneOrder?: true
  }

  export type VideoSceneMinAggregateInputType = {
    id?: true
    generationId?: true
    sceneOrder?: true
    promptText?: true
    imageUrl?: true
    audioUrl?: true
  }

  export type VideoSceneMaxAggregateInputType = {
    id?: true
    generationId?: true
    sceneOrder?: true
    promptText?: true
    imageUrl?: true
    audioUrl?: true
  }

  export type VideoSceneCountAggregateInputType = {
    id?: true
    generationId?: true
    sceneOrder?: true
    promptText?: true
    imageUrl?: true
    audioUrl?: true
    _all?: true
  }

  export type VideoSceneAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which VideoScene to aggregate.
     */
    where?: VideoSceneWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of VideoScenes to fetch.
     */
    orderBy?: VideoSceneOrderByWithRelationInput | VideoSceneOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: VideoSceneWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` VideoScenes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` VideoScenes.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned VideoScenes
    **/
    _count?: true | VideoSceneCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: VideoSceneAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: VideoSceneSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: VideoSceneMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: VideoSceneMaxAggregateInputType
  }

  export type GetVideoSceneAggregateType<T extends VideoSceneAggregateArgs> = {
        [P in keyof T & keyof AggregateVideoScene]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateVideoScene[P]>
      : GetScalarType<T[P], AggregateVideoScene[P]>
  }




  export type VideoSceneGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: VideoSceneWhereInput
    orderBy?: VideoSceneOrderByWithAggregationInput | VideoSceneOrderByWithAggregationInput[]
    by: VideoSceneScalarFieldEnum[] | VideoSceneScalarFieldEnum
    having?: VideoSceneScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: VideoSceneCountAggregateInputType | true
    _avg?: VideoSceneAvgAggregateInputType
    _sum?: VideoSceneSumAggregateInputType
    _min?: VideoSceneMinAggregateInputType
    _max?: VideoSceneMaxAggregateInputType
  }

  export type VideoSceneGroupByOutputType = {
    id: string
    generationId: string
    sceneOrder: number
    promptText: string | null
    imageUrl: string | null
    audioUrl: string | null
    _count: VideoSceneCountAggregateOutputType | null
    _avg: VideoSceneAvgAggregateOutputType | null
    _sum: VideoSceneSumAggregateOutputType | null
    _min: VideoSceneMinAggregateOutputType | null
    _max: VideoSceneMaxAggregateOutputType | null
  }

  type GetVideoSceneGroupByPayload<T extends VideoSceneGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<VideoSceneGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof VideoSceneGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], VideoSceneGroupByOutputType[P]>
            : GetScalarType<T[P], VideoSceneGroupByOutputType[P]>
        }
      >
    >


  export type VideoSceneSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    generationId?: boolean
    sceneOrder?: boolean
    promptText?: boolean
    imageUrl?: boolean
    audioUrl?: boolean
    generation?: boolean | VideoGenerationDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["videoScene"]>

  export type VideoSceneSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    generationId?: boolean
    sceneOrder?: boolean
    promptText?: boolean
    imageUrl?: boolean
    audioUrl?: boolean
    generation?: boolean | VideoGenerationDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["videoScene"]>

  export type VideoSceneSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    generationId?: boolean
    sceneOrder?: boolean
    promptText?: boolean
    imageUrl?: boolean
    audioUrl?: boolean
    generation?: boolean | VideoGenerationDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["videoScene"]>

  export type VideoSceneSelectScalar = {
    id?: boolean
    generationId?: boolean
    sceneOrder?: boolean
    promptText?: boolean
    imageUrl?: boolean
    audioUrl?: boolean
  }

  export type VideoSceneOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "generationId" | "sceneOrder" | "promptText" | "imageUrl" | "audioUrl", ExtArgs["result"]["videoScene"]>
  export type VideoSceneInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    generation?: boolean | VideoGenerationDefaultArgs<ExtArgs>
  }
  export type VideoSceneIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    generation?: boolean | VideoGenerationDefaultArgs<ExtArgs>
  }
  export type VideoSceneIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    generation?: boolean | VideoGenerationDefaultArgs<ExtArgs>
  }

  export type $VideoScenePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "VideoScene"
    objects: {
      generation: Prisma.$VideoGenerationPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      generationId: string
      sceneOrder: number
      promptText: string | null
      imageUrl: string | null
      audioUrl: string | null
    }, ExtArgs["result"]["videoScene"]>
    composites: {}
  }

  type VideoSceneGetPayload<S extends boolean | null | undefined | VideoSceneDefaultArgs> = $Result.GetResult<Prisma.$VideoScenePayload, S>

  type VideoSceneCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<VideoSceneFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: VideoSceneCountAggregateInputType | true
    }

  export interface VideoSceneDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['VideoScene'], meta: { name: 'VideoScene' } }
    /**
     * Find zero or one VideoScene that matches the filter.
     * @param {VideoSceneFindUniqueArgs} args - Arguments to find a VideoScene
     * @example
     * // Get one VideoScene
     * const videoScene = await prisma.videoScene.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends VideoSceneFindUniqueArgs>(args: SelectSubset<T, VideoSceneFindUniqueArgs<ExtArgs>>): Prisma__VideoSceneClient<$Result.GetResult<Prisma.$VideoScenePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one VideoScene that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {VideoSceneFindUniqueOrThrowArgs} args - Arguments to find a VideoScene
     * @example
     * // Get one VideoScene
     * const videoScene = await prisma.videoScene.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends VideoSceneFindUniqueOrThrowArgs>(args: SelectSubset<T, VideoSceneFindUniqueOrThrowArgs<ExtArgs>>): Prisma__VideoSceneClient<$Result.GetResult<Prisma.$VideoScenePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first VideoScene that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VideoSceneFindFirstArgs} args - Arguments to find a VideoScene
     * @example
     * // Get one VideoScene
     * const videoScene = await prisma.videoScene.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends VideoSceneFindFirstArgs>(args?: SelectSubset<T, VideoSceneFindFirstArgs<ExtArgs>>): Prisma__VideoSceneClient<$Result.GetResult<Prisma.$VideoScenePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first VideoScene that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VideoSceneFindFirstOrThrowArgs} args - Arguments to find a VideoScene
     * @example
     * // Get one VideoScene
     * const videoScene = await prisma.videoScene.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends VideoSceneFindFirstOrThrowArgs>(args?: SelectSubset<T, VideoSceneFindFirstOrThrowArgs<ExtArgs>>): Prisma__VideoSceneClient<$Result.GetResult<Prisma.$VideoScenePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more VideoScenes that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VideoSceneFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all VideoScenes
     * const videoScenes = await prisma.videoScene.findMany()
     * 
     * // Get first 10 VideoScenes
     * const videoScenes = await prisma.videoScene.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const videoSceneWithIdOnly = await prisma.videoScene.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends VideoSceneFindManyArgs>(args?: SelectSubset<T, VideoSceneFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$VideoScenePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a VideoScene.
     * @param {VideoSceneCreateArgs} args - Arguments to create a VideoScene.
     * @example
     * // Create one VideoScene
     * const VideoScene = await prisma.videoScene.create({
     *   data: {
     *     // ... data to create a VideoScene
     *   }
     * })
     * 
     */
    create<T extends VideoSceneCreateArgs>(args: SelectSubset<T, VideoSceneCreateArgs<ExtArgs>>): Prisma__VideoSceneClient<$Result.GetResult<Prisma.$VideoScenePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many VideoScenes.
     * @param {VideoSceneCreateManyArgs} args - Arguments to create many VideoScenes.
     * @example
     * // Create many VideoScenes
     * const videoScene = await prisma.videoScene.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends VideoSceneCreateManyArgs>(args?: SelectSubset<T, VideoSceneCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many VideoScenes and returns the data saved in the database.
     * @param {VideoSceneCreateManyAndReturnArgs} args - Arguments to create many VideoScenes.
     * @example
     * // Create many VideoScenes
     * const videoScene = await prisma.videoScene.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many VideoScenes and only return the `id`
     * const videoSceneWithIdOnly = await prisma.videoScene.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends VideoSceneCreateManyAndReturnArgs>(args?: SelectSubset<T, VideoSceneCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$VideoScenePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a VideoScene.
     * @param {VideoSceneDeleteArgs} args - Arguments to delete one VideoScene.
     * @example
     * // Delete one VideoScene
     * const VideoScene = await prisma.videoScene.delete({
     *   where: {
     *     // ... filter to delete one VideoScene
     *   }
     * })
     * 
     */
    delete<T extends VideoSceneDeleteArgs>(args: SelectSubset<T, VideoSceneDeleteArgs<ExtArgs>>): Prisma__VideoSceneClient<$Result.GetResult<Prisma.$VideoScenePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one VideoScene.
     * @param {VideoSceneUpdateArgs} args - Arguments to update one VideoScene.
     * @example
     * // Update one VideoScene
     * const videoScene = await prisma.videoScene.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends VideoSceneUpdateArgs>(args: SelectSubset<T, VideoSceneUpdateArgs<ExtArgs>>): Prisma__VideoSceneClient<$Result.GetResult<Prisma.$VideoScenePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more VideoScenes.
     * @param {VideoSceneDeleteManyArgs} args - Arguments to filter VideoScenes to delete.
     * @example
     * // Delete a few VideoScenes
     * const { count } = await prisma.videoScene.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends VideoSceneDeleteManyArgs>(args?: SelectSubset<T, VideoSceneDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more VideoScenes.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VideoSceneUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many VideoScenes
     * const videoScene = await prisma.videoScene.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends VideoSceneUpdateManyArgs>(args: SelectSubset<T, VideoSceneUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more VideoScenes and returns the data updated in the database.
     * @param {VideoSceneUpdateManyAndReturnArgs} args - Arguments to update many VideoScenes.
     * @example
     * // Update many VideoScenes
     * const videoScene = await prisma.videoScene.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more VideoScenes and only return the `id`
     * const videoSceneWithIdOnly = await prisma.videoScene.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends VideoSceneUpdateManyAndReturnArgs>(args: SelectSubset<T, VideoSceneUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$VideoScenePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one VideoScene.
     * @param {VideoSceneUpsertArgs} args - Arguments to update or create a VideoScene.
     * @example
     * // Update or create a VideoScene
     * const videoScene = await prisma.videoScene.upsert({
     *   create: {
     *     // ... data to create a VideoScene
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the VideoScene we want to update
     *   }
     * })
     */
    upsert<T extends VideoSceneUpsertArgs>(args: SelectSubset<T, VideoSceneUpsertArgs<ExtArgs>>): Prisma__VideoSceneClient<$Result.GetResult<Prisma.$VideoScenePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of VideoScenes.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VideoSceneCountArgs} args - Arguments to filter VideoScenes to count.
     * @example
     * // Count the number of VideoScenes
     * const count = await prisma.videoScene.count({
     *   where: {
     *     // ... the filter for the VideoScenes we want to count
     *   }
     * })
    **/
    count<T extends VideoSceneCountArgs>(
      args?: Subset<T, VideoSceneCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], VideoSceneCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a VideoScene.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VideoSceneAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends VideoSceneAggregateArgs>(args: Subset<T, VideoSceneAggregateArgs>): Prisma.PrismaPromise<GetVideoSceneAggregateType<T>>

    /**
     * Group by VideoScene.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VideoSceneGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends VideoSceneGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: VideoSceneGroupByArgs['orderBy'] }
        : { orderBy?: VideoSceneGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, VideoSceneGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetVideoSceneGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the VideoScene model
   */
  readonly fields: VideoSceneFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for VideoScene.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__VideoSceneClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    generation<T extends VideoGenerationDefaultArgs<ExtArgs> = {}>(args?: Subset<T, VideoGenerationDefaultArgs<ExtArgs>>): Prisma__VideoGenerationClient<$Result.GetResult<Prisma.$VideoGenerationPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the VideoScene model
   */
  interface VideoSceneFieldRefs {
    readonly id: FieldRef<"VideoScene", 'String'>
    readonly generationId: FieldRef<"VideoScene", 'String'>
    readonly sceneOrder: FieldRef<"VideoScene", 'Int'>
    readonly promptText: FieldRef<"VideoScene", 'String'>
    readonly imageUrl: FieldRef<"VideoScene", 'String'>
    readonly audioUrl: FieldRef<"VideoScene", 'String'>
  }
    

  // Custom InputTypes
  /**
   * VideoScene findUnique
   */
  export type VideoSceneFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VideoScene
     */
    select?: VideoSceneSelect<ExtArgs> | null
    /**
     * Omit specific fields from the VideoScene
     */
    omit?: VideoSceneOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VideoSceneInclude<ExtArgs> | null
    /**
     * Filter, which VideoScene to fetch.
     */
    where: VideoSceneWhereUniqueInput
  }

  /**
   * VideoScene findUniqueOrThrow
   */
  export type VideoSceneFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VideoScene
     */
    select?: VideoSceneSelect<ExtArgs> | null
    /**
     * Omit specific fields from the VideoScene
     */
    omit?: VideoSceneOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VideoSceneInclude<ExtArgs> | null
    /**
     * Filter, which VideoScene to fetch.
     */
    where: VideoSceneWhereUniqueInput
  }

  /**
   * VideoScene findFirst
   */
  export type VideoSceneFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VideoScene
     */
    select?: VideoSceneSelect<ExtArgs> | null
    /**
     * Omit specific fields from the VideoScene
     */
    omit?: VideoSceneOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VideoSceneInclude<ExtArgs> | null
    /**
     * Filter, which VideoScene to fetch.
     */
    where?: VideoSceneWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of VideoScenes to fetch.
     */
    orderBy?: VideoSceneOrderByWithRelationInput | VideoSceneOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for VideoScenes.
     */
    cursor?: VideoSceneWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` VideoScenes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` VideoScenes.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of VideoScenes.
     */
    distinct?: VideoSceneScalarFieldEnum | VideoSceneScalarFieldEnum[]
  }

  /**
   * VideoScene findFirstOrThrow
   */
  export type VideoSceneFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VideoScene
     */
    select?: VideoSceneSelect<ExtArgs> | null
    /**
     * Omit specific fields from the VideoScene
     */
    omit?: VideoSceneOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VideoSceneInclude<ExtArgs> | null
    /**
     * Filter, which VideoScene to fetch.
     */
    where?: VideoSceneWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of VideoScenes to fetch.
     */
    orderBy?: VideoSceneOrderByWithRelationInput | VideoSceneOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for VideoScenes.
     */
    cursor?: VideoSceneWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` VideoScenes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` VideoScenes.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of VideoScenes.
     */
    distinct?: VideoSceneScalarFieldEnum | VideoSceneScalarFieldEnum[]
  }

  /**
   * VideoScene findMany
   */
  export type VideoSceneFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VideoScene
     */
    select?: VideoSceneSelect<ExtArgs> | null
    /**
     * Omit specific fields from the VideoScene
     */
    omit?: VideoSceneOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VideoSceneInclude<ExtArgs> | null
    /**
     * Filter, which VideoScenes to fetch.
     */
    where?: VideoSceneWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of VideoScenes to fetch.
     */
    orderBy?: VideoSceneOrderByWithRelationInput | VideoSceneOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing VideoScenes.
     */
    cursor?: VideoSceneWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` VideoScenes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` VideoScenes.
     */
    skip?: number
    distinct?: VideoSceneScalarFieldEnum | VideoSceneScalarFieldEnum[]
  }

  /**
   * VideoScene create
   */
  export type VideoSceneCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VideoScene
     */
    select?: VideoSceneSelect<ExtArgs> | null
    /**
     * Omit specific fields from the VideoScene
     */
    omit?: VideoSceneOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VideoSceneInclude<ExtArgs> | null
    /**
     * The data needed to create a VideoScene.
     */
    data: XOR<VideoSceneCreateInput, VideoSceneUncheckedCreateInput>
  }

  /**
   * VideoScene createMany
   */
  export type VideoSceneCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many VideoScenes.
     */
    data: VideoSceneCreateManyInput | VideoSceneCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * VideoScene createManyAndReturn
   */
  export type VideoSceneCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VideoScene
     */
    select?: VideoSceneSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the VideoScene
     */
    omit?: VideoSceneOmit<ExtArgs> | null
    /**
     * The data used to create many VideoScenes.
     */
    data: VideoSceneCreateManyInput | VideoSceneCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VideoSceneIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * VideoScene update
   */
  export type VideoSceneUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VideoScene
     */
    select?: VideoSceneSelect<ExtArgs> | null
    /**
     * Omit specific fields from the VideoScene
     */
    omit?: VideoSceneOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VideoSceneInclude<ExtArgs> | null
    /**
     * The data needed to update a VideoScene.
     */
    data: XOR<VideoSceneUpdateInput, VideoSceneUncheckedUpdateInput>
    /**
     * Choose, which VideoScene to update.
     */
    where: VideoSceneWhereUniqueInput
  }

  /**
   * VideoScene updateMany
   */
  export type VideoSceneUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update VideoScenes.
     */
    data: XOR<VideoSceneUpdateManyMutationInput, VideoSceneUncheckedUpdateManyInput>
    /**
     * Filter which VideoScenes to update
     */
    where?: VideoSceneWhereInput
    /**
     * Limit how many VideoScenes to update.
     */
    limit?: number
  }

  /**
   * VideoScene updateManyAndReturn
   */
  export type VideoSceneUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VideoScene
     */
    select?: VideoSceneSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the VideoScene
     */
    omit?: VideoSceneOmit<ExtArgs> | null
    /**
     * The data used to update VideoScenes.
     */
    data: XOR<VideoSceneUpdateManyMutationInput, VideoSceneUncheckedUpdateManyInput>
    /**
     * Filter which VideoScenes to update
     */
    where?: VideoSceneWhereInput
    /**
     * Limit how many VideoScenes to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VideoSceneIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * VideoScene upsert
   */
  export type VideoSceneUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VideoScene
     */
    select?: VideoSceneSelect<ExtArgs> | null
    /**
     * Omit specific fields from the VideoScene
     */
    omit?: VideoSceneOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VideoSceneInclude<ExtArgs> | null
    /**
     * The filter to search for the VideoScene to update in case it exists.
     */
    where: VideoSceneWhereUniqueInput
    /**
     * In case the VideoScene found by the `where` argument doesn't exist, create a new VideoScene with this data.
     */
    create: XOR<VideoSceneCreateInput, VideoSceneUncheckedCreateInput>
    /**
     * In case the VideoScene was found with the provided `where` argument, update it with this data.
     */
    update: XOR<VideoSceneUpdateInput, VideoSceneUncheckedUpdateInput>
  }

  /**
   * VideoScene delete
   */
  export type VideoSceneDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VideoScene
     */
    select?: VideoSceneSelect<ExtArgs> | null
    /**
     * Omit specific fields from the VideoScene
     */
    omit?: VideoSceneOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VideoSceneInclude<ExtArgs> | null
    /**
     * Filter which VideoScene to delete.
     */
    where: VideoSceneWhereUniqueInput
  }

  /**
   * VideoScene deleteMany
   */
  export type VideoSceneDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which VideoScenes to delete
     */
    where?: VideoSceneWhereInput
    /**
     * Limit how many VideoScenes to delete.
     */
    limit?: number
  }

  /**
   * VideoScene without action
   */
  export type VideoSceneDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VideoScene
     */
    select?: VideoSceneSelect<ExtArgs> | null
    /**
     * Omit specific fields from the VideoScene
     */
    omit?: VideoSceneOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VideoSceneInclude<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const UserScalarFieldEnum: {
    id: 'id',
    email: 'email',
    fullName: 'fullName',
    passwordHash: 'passwordHash',
    createdAt: 'createdAt'
  };

  export type UserScalarFieldEnum = (typeof UserScalarFieldEnum)[keyof typeof UserScalarFieldEnum]


  export const VideoProjectScalarFieldEnum: {
    id: 'id',
    userId: 'userId',
    title: 'title',
    storyTopic: 'storyTopic',
    characterDescription: 'characterDescription',
    script: 'script',
    contentTone: 'contentTone',
    videoGenre: 'videoGenre',
    numberOfScenes: 'numberOfScenes',
    status: 'status',
    videoConfig: 'videoConfig',
    imageConfig: 'imageConfig',
    audioConfig: 'audioConfig',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type VideoProjectScalarFieldEnum = (typeof VideoProjectScalarFieldEnum)[keyof typeof VideoProjectScalarFieldEnum]


  export const VideoGenerationScalarFieldEnum: {
    id: 'id',
    projectId: 'projectId',
    generationNo: 'generationNo',
    aiModel: 'aiModel',
    resolution: 'resolution',
    aspectRatio: 'aspectRatio',
    voiceSettings: 'voiceSettings',
    status: 'status',
    outputUrl: 'outputUrl',
    thumbnailUrl: 'thumbnailUrl',
    durationSeconds: 'durationSeconds',
    createdAt: 'createdAt'
  };

  export type VideoGenerationScalarFieldEnum = (typeof VideoGenerationScalarFieldEnum)[keyof typeof VideoGenerationScalarFieldEnum]


  export const VideoSceneScalarFieldEnum: {
    id: 'id',
    generationId: 'generationId',
    sceneOrder: 'sceneOrder',
    promptText: 'promptText',
    imageUrl: 'imageUrl',
    audioUrl: 'audioUrl'
  };

  export type VideoSceneScalarFieldEnum = (typeof VideoSceneScalarFieldEnum)[keyof typeof VideoSceneScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const NullableJsonNullValueInput: {
    DbNull: typeof DbNull,
    JsonNull: typeof JsonNull
  };

  export type NullableJsonNullValueInput = (typeof NullableJsonNullValueInput)[keyof typeof NullableJsonNullValueInput]


  export const QueryMode: {
    default: 'default',
    insensitive: 'insensitive'
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode]


  export const JsonNullValueFilter: {
    DbNull: typeof DbNull,
    JsonNull: typeof JsonNull,
    AnyNull: typeof AnyNull
  };

  export type JsonNullValueFilter = (typeof JsonNullValueFilter)[keyof typeof JsonNullValueFilter]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  /**
   * Field references
   */


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'String[]'
   */
  export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    


  /**
   * Reference to a field of type 'Json'
   */
  export type JsonFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Json'>
    


  /**
   * Reference to a field of type 'QueryMode'
   */
  export type EnumQueryModeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'QueryMode'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    


  /**
   * Reference to a field of type 'Float[]'
   */
  export type ListFloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float[]'>
    
  /**
   * Deep Input Types
   */


  export type UserWhereInput = {
    AND?: UserWhereInput | UserWhereInput[]
    OR?: UserWhereInput[]
    NOT?: UserWhereInput | UserWhereInput[]
    id?: UuidFilter<"User"> | string
    email?: StringFilter<"User"> | string
    fullName?: StringFilter<"User"> | string
    passwordHash?: StringFilter<"User"> | string
    createdAt?: DateTimeFilter<"User"> | Date | string
    projects?: VideoProjectListRelationFilter
  }

  export type UserOrderByWithRelationInput = {
    id?: SortOrder
    email?: SortOrder
    fullName?: SortOrder
    passwordHash?: SortOrder
    createdAt?: SortOrder
    projects?: VideoProjectOrderByRelationAggregateInput
  }

  export type UserWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    email?: string
    AND?: UserWhereInput | UserWhereInput[]
    OR?: UserWhereInput[]
    NOT?: UserWhereInput | UserWhereInput[]
    fullName?: StringFilter<"User"> | string
    passwordHash?: StringFilter<"User"> | string
    createdAt?: DateTimeFilter<"User"> | Date | string
    projects?: VideoProjectListRelationFilter
  }, "id" | "email">

  export type UserOrderByWithAggregationInput = {
    id?: SortOrder
    email?: SortOrder
    fullName?: SortOrder
    passwordHash?: SortOrder
    createdAt?: SortOrder
    _count?: UserCountOrderByAggregateInput
    _max?: UserMaxOrderByAggregateInput
    _min?: UserMinOrderByAggregateInput
  }

  export type UserScalarWhereWithAggregatesInput = {
    AND?: UserScalarWhereWithAggregatesInput | UserScalarWhereWithAggregatesInput[]
    OR?: UserScalarWhereWithAggregatesInput[]
    NOT?: UserScalarWhereWithAggregatesInput | UserScalarWhereWithAggregatesInput[]
    id?: UuidWithAggregatesFilter<"User"> | string
    email?: StringWithAggregatesFilter<"User"> | string
    fullName?: StringWithAggregatesFilter<"User"> | string
    passwordHash?: StringWithAggregatesFilter<"User"> | string
    createdAt?: DateTimeWithAggregatesFilter<"User"> | Date | string
  }

  export type VideoProjectWhereInput = {
    AND?: VideoProjectWhereInput | VideoProjectWhereInput[]
    OR?: VideoProjectWhereInput[]
    NOT?: VideoProjectWhereInput | VideoProjectWhereInput[]
    id?: UuidFilter<"VideoProject"> | string
    userId?: UuidFilter<"VideoProject"> | string
    title?: StringFilter<"VideoProject"> | string
    storyTopic?: StringNullableFilter<"VideoProject"> | string | null
    characterDescription?: StringNullableFilter<"VideoProject"> | string | null
    script?: StringNullableFilter<"VideoProject"> | string | null
    contentTone?: StringNullableFilter<"VideoProject"> | string | null
    videoGenre?: StringNullableFilter<"VideoProject"> | string | null
    numberOfScenes?: IntNullableFilter<"VideoProject"> | number | null
    status?: StringNullableFilter<"VideoProject"> | string | null
    videoConfig?: JsonNullableFilter<"VideoProject">
    imageConfig?: JsonNullableFilter<"VideoProject">
    audioConfig?: JsonNullableFilter<"VideoProject">
    createdAt?: DateTimeFilter<"VideoProject"> | Date | string
    updatedAt?: DateTimeFilter<"VideoProject"> | Date | string
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
    generations?: VideoGenerationListRelationFilter
  }

  export type VideoProjectOrderByWithRelationInput = {
    id?: SortOrder
    userId?: SortOrder
    title?: SortOrder
    storyTopic?: SortOrderInput | SortOrder
    characterDescription?: SortOrderInput | SortOrder
    script?: SortOrderInput | SortOrder
    contentTone?: SortOrderInput | SortOrder
    videoGenre?: SortOrderInput | SortOrder
    numberOfScenes?: SortOrderInput | SortOrder
    status?: SortOrderInput | SortOrder
    videoConfig?: SortOrderInput | SortOrder
    imageConfig?: SortOrderInput | SortOrder
    audioConfig?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    user?: UserOrderByWithRelationInput
    generations?: VideoGenerationOrderByRelationAggregateInput
  }

  export type VideoProjectWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: VideoProjectWhereInput | VideoProjectWhereInput[]
    OR?: VideoProjectWhereInput[]
    NOT?: VideoProjectWhereInput | VideoProjectWhereInput[]
    userId?: UuidFilter<"VideoProject"> | string
    title?: StringFilter<"VideoProject"> | string
    storyTopic?: StringNullableFilter<"VideoProject"> | string | null
    characterDescription?: StringNullableFilter<"VideoProject"> | string | null
    script?: StringNullableFilter<"VideoProject"> | string | null
    contentTone?: StringNullableFilter<"VideoProject"> | string | null
    videoGenre?: StringNullableFilter<"VideoProject"> | string | null
    numberOfScenes?: IntNullableFilter<"VideoProject"> | number | null
    status?: StringNullableFilter<"VideoProject"> | string | null
    videoConfig?: JsonNullableFilter<"VideoProject">
    imageConfig?: JsonNullableFilter<"VideoProject">
    audioConfig?: JsonNullableFilter<"VideoProject">
    createdAt?: DateTimeFilter<"VideoProject"> | Date | string
    updatedAt?: DateTimeFilter<"VideoProject"> | Date | string
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
    generations?: VideoGenerationListRelationFilter
  }, "id">

  export type VideoProjectOrderByWithAggregationInput = {
    id?: SortOrder
    userId?: SortOrder
    title?: SortOrder
    storyTopic?: SortOrderInput | SortOrder
    characterDescription?: SortOrderInput | SortOrder
    script?: SortOrderInput | SortOrder
    contentTone?: SortOrderInput | SortOrder
    videoGenre?: SortOrderInput | SortOrder
    numberOfScenes?: SortOrderInput | SortOrder
    status?: SortOrderInput | SortOrder
    videoConfig?: SortOrderInput | SortOrder
    imageConfig?: SortOrderInput | SortOrder
    audioConfig?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: VideoProjectCountOrderByAggregateInput
    _avg?: VideoProjectAvgOrderByAggregateInput
    _max?: VideoProjectMaxOrderByAggregateInput
    _min?: VideoProjectMinOrderByAggregateInput
    _sum?: VideoProjectSumOrderByAggregateInput
  }

  export type VideoProjectScalarWhereWithAggregatesInput = {
    AND?: VideoProjectScalarWhereWithAggregatesInput | VideoProjectScalarWhereWithAggregatesInput[]
    OR?: VideoProjectScalarWhereWithAggregatesInput[]
    NOT?: VideoProjectScalarWhereWithAggregatesInput | VideoProjectScalarWhereWithAggregatesInput[]
    id?: UuidWithAggregatesFilter<"VideoProject"> | string
    userId?: UuidWithAggregatesFilter<"VideoProject"> | string
    title?: StringWithAggregatesFilter<"VideoProject"> | string
    storyTopic?: StringNullableWithAggregatesFilter<"VideoProject"> | string | null
    characterDescription?: StringNullableWithAggregatesFilter<"VideoProject"> | string | null
    script?: StringNullableWithAggregatesFilter<"VideoProject"> | string | null
    contentTone?: StringNullableWithAggregatesFilter<"VideoProject"> | string | null
    videoGenre?: StringNullableWithAggregatesFilter<"VideoProject"> | string | null
    numberOfScenes?: IntNullableWithAggregatesFilter<"VideoProject"> | number | null
    status?: StringNullableWithAggregatesFilter<"VideoProject"> | string | null
    videoConfig?: JsonNullableWithAggregatesFilter<"VideoProject">
    imageConfig?: JsonNullableWithAggregatesFilter<"VideoProject">
    audioConfig?: JsonNullableWithAggregatesFilter<"VideoProject">
    createdAt?: DateTimeWithAggregatesFilter<"VideoProject"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"VideoProject"> | Date | string
  }

  export type VideoGenerationWhereInput = {
    AND?: VideoGenerationWhereInput | VideoGenerationWhereInput[]
    OR?: VideoGenerationWhereInput[]
    NOT?: VideoGenerationWhereInput | VideoGenerationWhereInput[]
    id?: UuidFilter<"VideoGeneration"> | string
    projectId?: UuidFilter<"VideoGeneration"> | string
    generationNo?: IntFilter<"VideoGeneration"> | number
    aiModel?: StringNullableFilter<"VideoGeneration"> | string | null
    resolution?: StringNullableFilter<"VideoGeneration"> | string | null
    aspectRatio?: StringNullableFilter<"VideoGeneration"> | string | null
    voiceSettings?: JsonNullableFilter<"VideoGeneration">
    status?: StringNullableFilter<"VideoGeneration"> | string | null
    outputUrl?: StringNullableFilter<"VideoGeneration"> | string | null
    thumbnailUrl?: StringNullableFilter<"VideoGeneration"> | string | null
    durationSeconds?: IntNullableFilter<"VideoGeneration"> | number | null
    createdAt?: DateTimeFilter<"VideoGeneration"> | Date | string
    project?: XOR<VideoProjectScalarRelationFilter, VideoProjectWhereInput>
    scenes?: VideoSceneListRelationFilter
  }

  export type VideoGenerationOrderByWithRelationInput = {
    id?: SortOrder
    projectId?: SortOrder
    generationNo?: SortOrder
    aiModel?: SortOrderInput | SortOrder
    resolution?: SortOrderInput | SortOrder
    aspectRatio?: SortOrderInput | SortOrder
    voiceSettings?: SortOrderInput | SortOrder
    status?: SortOrderInput | SortOrder
    outputUrl?: SortOrderInput | SortOrder
    thumbnailUrl?: SortOrderInput | SortOrder
    durationSeconds?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    project?: VideoProjectOrderByWithRelationInput
    scenes?: VideoSceneOrderByRelationAggregateInput
  }

  export type VideoGenerationWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    projectId_generationNo?: VideoGenerationProjectIdGenerationNoCompoundUniqueInput
    AND?: VideoGenerationWhereInput | VideoGenerationWhereInput[]
    OR?: VideoGenerationWhereInput[]
    NOT?: VideoGenerationWhereInput | VideoGenerationWhereInput[]
    projectId?: UuidFilter<"VideoGeneration"> | string
    generationNo?: IntFilter<"VideoGeneration"> | number
    aiModel?: StringNullableFilter<"VideoGeneration"> | string | null
    resolution?: StringNullableFilter<"VideoGeneration"> | string | null
    aspectRatio?: StringNullableFilter<"VideoGeneration"> | string | null
    voiceSettings?: JsonNullableFilter<"VideoGeneration">
    status?: StringNullableFilter<"VideoGeneration"> | string | null
    outputUrl?: StringNullableFilter<"VideoGeneration"> | string | null
    thumbnailUrl?: StringNullableFilter<"VideoGeneration"> | string | null
    durationSeconds?: IntNullableFilter<"VideoGeneration"> | number | null
    createdAt?: DateTimeFilter<"VideoGeneration"> | Date | string
    project?: XOR<VideoProjectScalarRelationFilter, VideoProjectWhereInput>
    scenes?: VideoSceneListRelationFilter
  }, "id" | "projectId_generationNo">

  export type VideoGenerationOrderByWithAggregationInput = {
    id?: SortOrder
    projectId?: SortOrder
    generationNo?: SortOrder
    aiModel?: SortOrderInput | SortOrder
    resolution?: SortOrderInput | SortOrder
    aspectRatio?: SortOrderInput | SortOrder
    voiceSettings?: SortOrderInput | SortOrder
    status?: SortOrderInput | SortOrder
    outputUrl?: SortOrderInput | SortOrder
    thumbnailUrl?: SortOrderInput | SortOrder
    durationSeconds?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    _count?: VideoGenerationCountOrderByAggregateInput
    _avg?: VideoGenerationAvgOrderByAggregateInput
    _max?: VideoGenerationMaxOrderByAggregateInput
    _min?: VideoGenerationMinOrderByAggregateInput
    _sum?: VideoGenerationSumOrderByAggregateInput
  }

  export type VideoGenerationScalarWhereWithAggregatesInput = {
    AND?: VideoGenerationScalarWhereWithAggregatesInput | VideoGenerationScalarWhereWithAggregatesInput[]
    OR?: VideoGenerationScalarWhereWithAggregatesInput[]
    NOT?: VideoGenerationScalarWhereWithAggregatesInput | VideoGenerationScalarWhereWithAggregatesInput[]
    id?: UuidWithAggregatesFilter<"VideoGeneration"> | string
    projectId?: UuidWithAggregatesFilter<"VideoGeneration"> | string
    generationNo?: IntWithAggregatesFilter<"VideoGeneration"> | number
    aiModel?: StringNullableWithAggregatesFilter<"VideoGeneration"> | string | null
    resolution?: StringNullableWithAggregatesFilter<"VideoGeneration"> | string | null
    aspectRatio?: StringNullableWithAggregatesFilter<"VideoGeneration"> | string | null
    voiceSettings?: JsonNullableWithAggregatesFilter<"VideoGeneration">
    status?: StringNullableWithAggregatesFilter<"VideoGeneration"> | string | null
    outputUrl?: StringNullableWithAggregatesFilter<"VideoGeneration"> | string | null
    thumbnailUrl?: StringNullableWithAggregatesFilter<"VideoGeneration"> | string | null
    durationSeconds?: IntNullableWithAggregatesFilter<"VideoGeneration"> | number | null
    createdAt?: DateTimeWithAggregatesFilter<"VideoGeneration"> | Date | string
  }

  export type VideoSceneWhereInput = {
    AND?: VideoSceneWhereInput | VideoSceneWhereInput[]
    OR?: VideoSceneWhereInput[]
    NOT?: VideoSceneWhereInput | VideoSceneWhereInput[]
    id?: UuidFilter<"VideoScene"> | string
    generationId?: UuidFilter<"VideoScene"> | string
    sceneOrder?: IntFilter<"VideoScene"> | number
    promptText?: StringNullableFilter<"VideoScene"> | string | null
    imageUrl?: StringNullableFilter<"VideoScene"> | string | null
    audioUrl?: StringNullableFilter<"VideoScene"> | string | null
    generation?: XOR<VideoGenerationScalarRelationFilter, VideoGenerationWhereInput>
  }

  export type VideoSceneOrderByWithRelationInput = {
    id?: SortOrder
    generationId?: SortOrder
    sceneOrder?: SortOrder
    promptText?: SortOrderInput | SortOrder
    imageUrl?: SortOrderInput | SortOrder
    audioUrl?: SortOrderInput | SortOrder
    generation?: VideoGenerationOrderByWithRelationInput
  }

  export type VideoSceneWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    generationId_sceneOrder?: VideoSceneGenerationIdSceneOrderCompoundUniqueInput
    AND?: VideoSceneWhereInput | VideoSceneWhereInput[]
    OR?: VideoSceneWhereInput[]
    NOT?: VideoSceneWhereInput | VideoSceneWhereInput[]
    generationId?: UuidFilter<"VideoScene"> | string
    sceneOrder?: IntFilter<"VideoScene"> | number
    promptText?: StringNullableFilter<"VideoScene"> | string | null
    imageUrl?: StringNullableFilter<"VideoScene"> | string | null
    audioUrl?: StringNullableFilter<"VideoScene"> | string | null
    generation?: XOR<VideoGenerationScalarRelationFilter, VideoGenerationWhereInput>
  }, "id" | "generationId_sceneOrder">

  export type VideoSceneOrderByWithAggregationInput = {
    id?: SortOrder
    generationId?: SortOrder
    sceneOrder?: SortOrder
    promptText?: SortOrderInput | SortOrder
    imageUrl?: SortOrderInput | SortOrder
    audioUrl?: SortOrderInput | SortOrder
    _count?: VideoSceneCountOrderByAggregateInput
    _avg?: VideoSceneAvgOrderByAggregateInput
    _max?: VideoSceneMaxOrderByAggregateInput
    _min?: VideoSceneMinOrderByAggregateInput
    _sum?: VideoSceneSumOrderByAggregateInput
  }

  export type VideoSceneScalarWhereWithAggregatesInput = {
    AND?: VideoSceneScalarWhereWithAggregatesInput | VideoSceneScalarWhereWithAggregatesInput[]
    OR?: VideoSceneScalarWhereWithAggregatesInput[]
    NOT?: VideoSceneScalarWhereWithAggregatesInput | VideoSceneScalarWhereWithAggregatesInput[]
    id?: UuidWithAggregatesFilter<"VideoScene"> | string
    generationId?: UuidWithAggregatesFilter<"VideoScene"> | string
    sceneOrder?: IntWithAggregatesFilter<"VideoScene"> | number
    promptText?: StringNullableWithAggregatesFilter<"VideoScene"> | string | null
    imageUrl?: StringNullableWithAggregatesFilter<"VideoScene"> | string | null
    audioUrl?: StringNullableWithAggregatesFilter<"VideoScene"> | string | null
  }

  export type UserCreateInput = {
    id?: string
    email: string
    fullName: string
    passwordHash: string
    createdAt?: Date | string
    projects?: VideoProjectCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateInput = {
    id?: string
    email: string
    fullName: string
    passwordHash: string
    createdAt?: Date | string
    projects?: VideoProjectUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    fullName?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    projects?: VideoProjectUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    fullName?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    projects?: VideoProjectUncheckedUpdateManyWithoutUserNestedInput
  }

  export type UserCreateManyInput = {
    id?: string
    email: string
    fullName: string
    passwordHash: string
    createdAt?: Date | string
  }

  export type UserUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    fullName?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    fullName?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type VideoProjectCreateInput = {
    id?: string
    title: string
    storyTopic?: string | null
    characterDescription?: string | null
    script?: string | null
    contentTone?: string | null
    videoGenre?: string | null
    numberOfScenes?: number | null
    status?: string | null
    videoConfig?: NullableJsonNullValueInput | InputJsonValue
    imageConfig?: NullableJsonNullValueInput | InputJsonValue
    audioConfig?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
    user: UserCreateNestedOneWithoutProjectsInput
    generations?: VideoGenerationCreateNestedManyWithoutProjectInput
  }

  export type VideoProjectUncheckedCreateInput = {
    id?: string
    userId: string
    title: string
    storyTopic?: string | null
    characterDescription?: string | null
    script?: string | null
    contentTone?: string | null
    videoGenre?: string | null
    numberOfScenes?: number | null
    status?: string | null
    videoConfig?: NullableJsonNullValueInput | InputJsonValue
    imageConfig?: NullableJsonNullValueInput | InputJsonValue
    audioConfig?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
    generations?: VideoGenerationUncheckedCreateNestedManyWithoutProjectInput
  }

  export type VideoProjectUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    storyTopic?: NullableStringFieldUpdateOperationsInput | string | null
    characterDescription?: NullableStringFieldUpdateOperationsInput | string | null
    script?: NullableStringFieldUpdateOperationsInput | string | null
    contentTone?: NullableStringFieldUpdateOperationsInput | string | null
    videoGenre?: NullableStringFieldUpdateOperationsInput | string | null
    numberOfScenes?: NullableIntFieldUpdateOperationsInput | number | null
    status?: NullableStringFieldUpdateOperationsInput | string | null
    videoConfig?: NullableJsonNullValueInput | InputJsonValue
    imageConfig?: NullableJsonNullValueInput | InputJsonValue
    audioConfig?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneRequiredWithoutProjectsNestedInput
    generations?: VideoGenerationUpdateManyWithoutProjectNestedInput
  }

  export type VideoProjectUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    storyTopic?: NullableStringFieldUpdateOperationsInput | string | null
    characterDescription?: NullableStringFieldUpdateOperationsInput | string | null
    script?: NullableStringFieldUpdateOperationsInput | string | null
    contentTone?: NullableStringFieldUpdateOperationsInput | string | null
    videoGenre?: NullableStringFieldUpdateOperationsInput | string | null
    numberOfScenes?: NullableIntFieldUpdateOperationsInput | number | null
    status?: NullableStringFieldUpdateOperationsInput | string | null
    videoConfig?: NullableJsonNullValueInput | InputJsonValue
    imageConfig?: NullableJsonNullValueInput | InputJsonValue
    audioConfig?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    generations?: VideoGenerationUncheckedUpdateManyWithoutProjectNestedInput
  }

  export type VideoProjectCreateManyInput = {
    id?: string
    userId: string
    title: string
    storyTopic?: string | null
    characterDescription?: string | null
    script?: string | null
    contentTone?: string | null
    videoGenre?: string | null
    numberOfScenes?: number | null
    status?: string | null
    videoConfig?: NullableJsonNullValueInput | InputJsonValue
    imageConfig?: NullableJsonNullValueInput | InputJsonValue
    audioConfig?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type VideoProjectUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    storyTopic?: NullableStringFieldUpdateOperationsInput | string | null
    characterDescription?: NullableStringFieldUpdateOperationsInput | string | null
    script?: NullableStringFieldUpdateOperationsInput | string | null
    contentTone?: NullableStringFieldUpdateOperationsInput | string | null
    videoGenre?: NullableStringFieldUpdateOperationsInput | string | null
    numberOfScenes?: NullableIntFieldUpdateOperationsInput | number | null
    status?: NullableStringFieldUpdateOperationsInput | string | null
    videoConfig?: NullableJsonNullValueInput | InputJsonValue
    imageConfig?: NullableJsonNullValueInput | InputJsonValue
    audioConfig?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type VideoProjectUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    storyTopic?: NullableStringFieldUpdateOperationsInput | string | null
    characterDescription?: NullableStringFieldUpdateOperationsInput | string | null
    script?: NullableStringFieldUpdateOperationsInput | string | null
    contentTone?: NullableStringFieldUpdateOperationsInput | string | null
    videoGenre?: NullableStringFieldUpdateOperationsInput | string | null
    numberOfScenes?: NullableIntFieldUpdateOperationsInput | number | null
    status?: NullableStringFieldUpdateOperationsInput | string | null
    videoConfig?: NullableJsonNullValueInput | InputJsonValue
    imageConfig?: NullableJsonNullValueInput | InputJsonValue
    audioConfig?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type VideoGenerationCreateInput = {
    id?: string
    generationNo: number
    aiModel?: string | null
    resolution?: string | null
    aspectRatio?: string | null
    voiceSettings?: NullableJsonNullValueInput | InputJsonValue
    status?: string | null
    outputUrl?: string | null
    thumbnailUrl?: string | null
    durationSeconds?: number | null
    createdAt?: Date | string
    project: VideoProjectCreateNestedOneWithoutGenerationsInput
    scenes?: VideoSceneCreateNestedManyWithoutGenerationInput
  }

  export type VideoGenerationUncheckedCreateInput = {
    id?: string
    projectId: string
    generationNo: number
    aiModel?: string | null
    resolution?: string | null
    aspectRatio?: string | null
    voiceSettings?: NullableJsonNullValueInput | InputJsonValue
    status?: string | null
    outputUrl?: string | null
    thumbnailUrl?: string | null
    durationSeconds?: number | null
    createdAt?: Date | string
    scenes?: VideoSceneUncheckedCreateNestedManyWithoutGenerationInput
  }

  export type VideoGenerationUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    generationNo?: IntFieldUpdateOperationsInput | number
    aiModel?: NullableStringFieldUpdateOperationsInput | string | null
    resolution?: NullableStringFieldUpdateOperationsInput | string | null
    aspectRatio?: NullableStringFieldUpdateOperationsInput | string | null
    voiceSettings?: NullableJsonNullValueInput | InputJsonValue
    status?: NullableStringFieldUpdateOperationsInput | string | null
    outputUrl?: NullableStringFieldUpdateOperationsInput | string | null
    thumbnailUrl?: NullableStringFieldUpdateOperationsInput | string | null
    durationSeconds?: NullableIntFieldUpdateOperationsInput | number | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    project?: VideoProjectUpdateOneRequiredWithoutGenerationsNestedInput
    scenes?: VideoSceneUpdateManyWithoutGenerationNestedInput
  }

  export type VideoGenerationUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    projectId?: StringFieldUpdateOperationsInput | string
    generationNo?: IntFieldUpdateOperationsInput | number
    aiModel?: NullableStringFieldUpdateOperationsInput | string | null
    resolution?: NullableStringFieldUpdateOperationsInput | string | null
    aspectRatio?: NullableStringFieldUpdateOperationsInput | string | null
    voiceSettings?: NullableJsonNullValueInput | InputJsonValue
    status?: NullableStringFieldUpdateOperationsInput | string | null
    outputUrl?: NullableStringFieldUpdateOperationsInput | string | null
    thumbnailUrl?: NullableStringFieldUpdateOperationsInput | string | null
    durationSeconds?: NullableIntFieldUpdateOperationsInput | number | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    scenes?: VideoSceneUncheckedUpdateManyWithoutGenerationNestedInput
  }

  export type VideoGenerationCreateManyInput = {
    id?: string
    projectId: string
    generationNo: number
    aiModel?: string | null
    resolution?: string | null
    aspectRatio?: string | null
    voiceSettings?: NullableJsonNullValueInput | InputJsonValue
    status?: string | null
    outputUrl?: string | null
    thumbnailUrl?: string | null
    durationSeconds?: number | null
    createdAt?: Date | string
  }

  export type VideoGenerationUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    generationNo?: IntFieldUpdateOperationsInput | number
    aiModel?: NullableStringFieldUpdateOperationsInput | string | null
    resolution?: NullableStringFieldUpdateOperationsInput | string | null
    aspectRatio?: NullableStringFieldUpdateOperationsInput | string | null
    voiceSettings?: NullableJsonNullValueInput | InputJsonValue
    status?: NullableStringFieldUpdateOperationsInput | string | null
    outputUrl?: NullableStringFieldUpdateOperationsInput | string | null
    thumbnailUrl?: NullableStringFieldUpdateOperationsInput | string | null
    durationSeconds?: NullableIntFieldUpdateOperationsInput | number | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type VideoGenerationUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    projectId?: StringFieldUpdateOperationsInput | string
    generationNo?: IntFieldUpdateOperationsInput | number
    aiModel?: NullableStringFieldUpdateOperationsInput | string | null
    resolution?: NullableStringFieldUpdateOperationsInput | string | null
    aspectRatio?: NullableStringFieldUpdateOperationsInput | string | null
    voiceSettings?: NullableJsonNullValueInput | InputJsonValue
    status?: NullableStringFieldUpdateOperationsInput | string | null
    outputUrl?: NullableStringFieldUpdateOperationsInput | string | null
    thumbnailUrl?: NullableStringFieldUpdateOperationsInput | string | null
    durationSeconds?: NullableIntFieldUpdateOperationsInput | number | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type VideoSceneCreateInput = {
    id?: string
    sceneOrder: number
    promptText?: string | null
    imageUrl?: string | null
    audioUrl?: string | null
    generation: VideoGenerationCreateNestedOneWithoutScenesInput
  }

  export type VideoSceneUncheckedCreateInput = {
    id?: string
    generationId: string
    sceneOrder: number
    promptText?: string | null
    imageUrl?: string | null
    audioUrl?: string | null
  }

  export type VideoSceneUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    sceneOrder?: IntFieldUpdateOperationsInput | number
    promptText?: NullableStringFieldUpdateOperationsInput | string | null
    imageUrl?: NullableStringFieldUpdateOperationsInput | string | null
    audioUrl?: NullableStringFieldUpdateOperationsInput | string | null
    generation?: VideoGenerationUpdateOneRequiredWithoutScenesNestedInput
  }

  export type VideoSceneUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    generationId?: StringFieldUpdateOperationsInput | string
    sceneOrder?: IntFieldUpdateOperationsInput | number
    promptText?: NullableStringFieldUpdateOperationsInput | string | null
    imageUrl?: NullableStringFieldUpdateOperationsInput | string | null
    audioUrl?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type VideoSceneCreateManyInput = {
    id?: string
    generationId: string
    sceneOrder: number
    promptText?: string | null
    imageUrl?: string | null
    audioUrl?: string | null
  }

  export type VideoSceneUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    sceneOrder?: IntFieldUpdateOperationsInput | number
    promptText?: NullableStringFieldUpdateOperationsInput | string | null
    imageUrl?: NullableStringFieldUpdateOperationsInput | string | null
    audioUrl?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type VideoSceneUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    generationId?: StringFieldUpdateOperationsInput | string
    sceneOrder?: IntFieldUpdateOperationsInput | number
    promptText?: NullableStringFieldUpdateOperationsInput | string | null
    imageUrl?: NullableStringFieldUpdateOperationsInput | string | null
    audioUrl?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type UuidFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedUuidFilter<$PrismaModel> | string
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type VideoProjectListRelationFilter = {
    every?: VideoProjectWhereInput
    some?: VideoProjectWhereInput
    none?: VideoProjectWhereInput
  }

  export type VideoProjectOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type UserCountOrderByAggregateInput = {
    id?: SortOrder
    email?: SortOrder
    fullName?: SortOrder
    passwordHash?: SortOrder
    createdAt?: SortOrder
  }

  export type UserMaxOrderByAggregateInput = {
    id?: SortOrder
    email?: SortOrder
    fullName?: SortOrder
    passwordHash?: SortOrder
    createdAt?: SortOrder
  }

  export type UserMinOrderByAggregateInput = {
    id?: SortOrder
    email?: SortOrder
    fullName?: SortOrder
    passwordHash?: SortOrder
    createdAt?: SortOrder
  }

  export type UuidWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedUuidWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type IntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }
  export type JsonNullableFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonNullableFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonNullableFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonNullableFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonNullableFilterBase<$PrismaModel>>, 'path'>>

  export type JsonNullableFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type UserScalarRelationFilter = {
    is?: UserWhereInput
    isNot?: UserWhereInput
  }

  export type VideoGenerationListRelationFilter = {
    every?: VideoGenerationWhereInput
    some?: VideoGenerationWhereInput
    none?: VideoGenerationWhereInput
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type VideoGenerationOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type VideoProjectCountOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    title?: SortOrder
    storyTopic?: SortOrder
    characterDescription?: SortOrder
    script?: SortOrder
    contentTone?: SortOrder
    videoGenre?: SortOrder
    numberOfScenes?: SortOrder
    status?: SortOrder
    videoConfig?: SortOrder
    imageConfig?: SortOrder
    audioConfig?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type VideoProjectAvgOrderByAggregateInput = {
    numberOfScenes?: SortOrder
  }

  export type VideoProjectMaxOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    title?: SortOrder
    storyTopic?: SortOrder
    characterDescription?: SortOrder
    script?: SortOrder
    contentTone?: SortOrder
    videoGenre?: SortOrder
    numberOfScenes?: SortOrder
    status?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type VideoProjectMinOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    title?: SortOrder
    storyTopic?: SortOrder
    characterDescription?: SortOrder
    script?: SortOrder
    contentTone?: SortOrder
    videoGenre?: SortOrder
    numberOfScenes?: SortOrder
    status?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type VideoProjectSumOrderByAggregateInput = {
    numberOfScenes?: SortOrder
  }

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type IntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }
  export type JsonNullableWithAggregatesFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, 'path'>>

  export type JsonNullableWithAggregatesFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedJsonNullableFilter<$PrismaModel>
    _max?: NestedJsonNullableFilter<$PrismaModel>
  }

  export type IntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type VideoProjectScalarRelationFilter = {
    is?: VideoProjectWhereInput
    isNot?: VideoProjectWhereInput
  }

  export type VideoSceneListRelationFilter = {
    every?: VideoSceneWhereInput
    some?: VideoSceneWhereInput
    none?: VideoSceneWhereInput
  }

  export type VideoSceneOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type VideoGenerationProjectIdGenerationNoCompoundUniqueInput = {
    projectId: string
    generationNo: number
  }

  export type VideoGenerationCountOrderByAggregateInput = {
    id?: SortOrder
    projectId?: SortOrder
    generationNo?: SortOrder
    aiModel?: SortOrder
    resolution?: SortOrder
    aspectRatio?: SortOrder
    voiceSettings?: SortOrder
    status?: SortOrder
    outputUrl?: SortOrder
    thumbnailUrl?: SortOrder
    durationSeconds?: SortOrder
    createdAt?: SortOrder
  }

  export type VideoGenerationAvgOrderByAggregateInput = {
    generationNo?: SortOrder
    durationSeconds?: SortOrder
  }

  export type VideoGenerationMaxOrderByAggregateInput = {
    id?: SortOrder
    projectId?: SortOrder
    generationNo?: SortOrder
    aiModel?: SortOrder
    resolution?: SortOrder
    aspectRatio?: SortOrder
    status?: SortOrder
    outputUrl?: SortOrder
    thumbnailUrl?: SortOrder
    durationSeconds?: SortOrder
    createdAt?: SortOrder
  }

  export type VideoGenerationMinOrderByAggregateInput = {
    id?: SortOrder
    projectId?: SortOrder
    generationNo?: SortOrder
    aiModel?: SortOrder
    resolution?: SortOrder
    aspectRatio?: SortOrder
    status?: SortOrder
    outputUrl?: SortOrder
    thumbnailUrl?: SortOrder
    durationSeconds?: SortOrder
    createdAt?: SortOrder
  }

  export type VideoGenerationSumOrderByAggregateInput = {
    generationNo?: SortOrder
    durationSeconds?: SortOrder
  }

  export type IntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type VideoGenerationScalarRelationFilter = {
    is?: VideoGenerationWhereInput
    isNot?: VideoGenerationWhereInput
  }

  export type VideoSceneGenerationIdSceneOrderCompoundUniqueInput = {
    generationId: string
    sceneOrder: number
  }

  export type VideoSceneCountOrderByAggregateInput = {
    id?: SortOrder
    generationId?: SortOrder
    sceneOrder?: SortOrder
    promptText?: SortOrder
    imageUrl?: SortOrder
    audioUrl?: SortOrder
  }

  export type VideoSceneAvgOrderByAggregateInput = {
    sceneOrder?: SortOrder
  }

  export type VideoSceneMaxOrderByAggregateInput = {
    id?: SortOrder
    generationId?: SortOrder
    sceneOrder?: SortOrder
    promptText?: SortOrder
    imageUrl?: SortOrder
    audioUrl?: SortOrder
  }

  export type VideoSceneMinOrderByAggregateInput = {
    id?: SortOrder
    generationId?: SortOrder
    sceneOrder?: SortOrder
    promptText?: SortOrder
    imageUrl?: SortOrder
    audioUrl?: SortOrder
  }

  export type VideoSceneSumOrderByAggregateInput = {
    sceneOrder?: SortOrder
  }

  export type VideoProjectCreateNestedManyWithoutUserInput = {
    create?: XOR<VideoProjectCreateWithoutUserInput, VideoProjectUncheckedCreateWithoutUserInput> | VideoProjectCreateWithoutUserInput[] | VideoProjectUncheckedCreateWithoutUserInput[]
    connectOrCreate?: VideoProjectCreateOrConnectWithoutUserInput | VideoProjectCreateOrConnectWithoutUserInput[]
    createMany?: VideoProjectCreateManyUserInputEnvelope
    connect?: VideoProjectWhereUniqueInput | VideoProjectWhereUniqueInput[]
  }

  export type VideoProjectUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<VideoProjectCreateWithoutUserInput, VideoProjectUncheckedCreateWithoutUserInput> | VideoProjectCreateWithoutUserInput[] | VideoProjectUncheckedCreateWithoutUserInput[]
    connectOrCreate?: VideoProjectCreateOrConnectWithoutUserInput | VideoProjectCreateOrConnectWithoutUserInput[]
    createMany?: VideoProjectCreateManyUserInputEnvelope
    connect?: VideoProjectWhereUniqueInput | VideoProjectWhereUniqueInput[]
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type VideoProjectUpdateManyWithoutUserNestedInput = {
    create?: XOR<VideoProjectCreateWithoutUserInput, VideoProjectUncheckedCreateWithoutUserInput> | VideoProjectCreateWithoutUserInput[] | VideoProjectUncheckedCreateWithoutUserInput[]
    connectOrCreate?: VideoProjectCreateOrConnectWithoutUserInput | VideoProjectCreateOrConnectWithoutUserInput[]
    upsert?: VideoProjectUpsertWithWhereUniqueWithoutUserInput | VideoProjectUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: VideoProjectCreateManyUserInputEnvelope
    set?: VideoProjectWhereUniqueInput | VideoProjectWhereUniqueInput[]
    disconnect?: VideoProjectWhereUniqueInput | VideoProjectWhereUniqueInput[]
    delete?: VideoProjectWhereUniqueInput | VideoProjectWhereUniqueInput[]
    connect?: VideoProjectWhereUniqueInput | VideoProjectWhereUniqueInput[]
    update?: VideoProjectUpdateWithWhereUniqueWithoutUserInput | VideoProjectUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: VideoProjectUpdateManyWithWhereWithoutUserInput | VideoProjectUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: VideoProjectScalarWhereInput | VideoProjectScalarWhereInput[]
  }

  export type VideoProjectUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<VideoProjectCreateWithoutUserInput, VideoProjectUncheckedCreateWithoutUserInput> | VideoProjectCreateWithoutUserInput[] | VideoProjectUncheckedCreateWithoutUserInput[]
    connectOrCreate?: VideoProjectCreateOrConnectWithoutUserInput | VideoProjectCreateOrConnectWithoutUserInput[]
    upsert?: VideoProjectUpsertWithWhereUniqueWithoutUserInput | VideoProjectUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: VideoProjectCreateManyUserInputEnvelope
    set?: VideoProjectWhereUniqueInput | VideoProjectWhereUniqueInput[]
    disconnect?: VideoProjectWhereUniqueInput | VideoProjectWhereUniqueInput[]
    delete?: VideoProjectWhereUniqueInput | VideoProjectWhereUniqueInput[]
    connect?: VideoProjectWhereUniqueInput | VideoProjectWhereUniqueInput[]
    update?: VideoProjectUpdateWithWhereUniqueWithoutUserInput | VideoProjectUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: VideoProjectUpdateManyWithWhereWithoutUserInput | VideoProjectUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: VideoProjectScalarWhereInput | VideoProjectScalarWhereInput[]
  }

  export type UserCreateNestedOneWithoutProjectsInput = {
    create?: XOR<UserCreateWithoutProjectsInput, UserUncheckedCreateWithoutProjectsInput>
    connectOrCreate?: UserCreateOrConnectWithoutProjectsInput
    connect?: UserWhereUniqueInput
  }

  export type VideoGenerationCreateNestedManyWithoutProjectInput = {
    create?: XOR<VideoGenerationCreateWithoutProjectInput, VideoGenerationUncheckedCreateWithoutProjectInput> | VideoGenerationCreateWithoutProjectInput[] | VideoGenerationUncheckedCreateWithoutProjectInput[]
    connectOrCreate?: VideoGenerationCreateOrConnectWithoutProjectInput | VideoGenerationCreateOrConnectWithoutProjectInput[]
    createMany?: VideoGenerationCreateManyProjectInputEnvelope
    connect?: VideoGenerationWhereUniqueInput | VideoGenerationWhereUniqueInput[]
  }

  export type VideoGenerationUncheckedCreateNestedManyWithoutProjectInput = {
    create?: XOR<VideoGenerationCreateWithoutProjectInput, VideoGenerationUncheckedCreateWithoutProjectInput> | VideoGenerationCreateWithoutProjectInput[] | VideoGenerationUncheckedCreateWithoutProjectInput[]
    connectOrCreate?: VideoGenerationCreateOrConnectWithoutProjectInput | VideoGenerationCreateOrConnectWithoutProjectInput[]
    createMany?: VideoGenerationCreateManyProjectInputEnvelope
    connect?: VideoGenerationWhereUniqueInput | VideoGenerationWhereUniqueInput[]
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type NullableIntFieldUpdateOperationsInput = {
    set?: number | null
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type UserUpdateOneRequiredWithoutProjectsNestedInput = {
    create?: XOR<UserCreateWithoutProjectsInput, UserUncheckedCreateWithoutProjectsInput>
    connectOrCreate?: UserCreateOrConnectWithoutProjectsInput
    upsert?: UserUpsertWithoutProjectsInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutProjectsInput, UserUpdateWithoutProjectsInput>, UserUncheckedUpdateWithoutProjectsInput>
  }

  export type VideoGenerationUpdateManyWithoutProjectNestedInput = {
    create?: XOR<VideoGenerationCreateWithoutProjectInput, VideoGenerationUncheckedCreateWithoutProjectInput> | VideoGenerationCreateWithoutProjectInput[] | VideoGenerationUncheckedCreateWithoutProjectInput[]
    connectOrCreate?: VideoGenerationCreateOrConnectWithoutProjectInput | VideoGenerationCreateOrConnectWithoutProjectInput[]
    upsert?: VideoGenerationUpsertWithWhereUniqueWithoutProjectInput | VideoGenerationUpsertWithWhereUniqueWithoutProjectInput[]
    createMany?: VideoGenerationCreateManyProjectInputEnvelope
    set?: VideoGenerationWhereUniqueInput | VideoGenerationWhereUniqueInput[]
    disconnect?: VideoGenerationWhereUniqueInput | VideoGenerationWhereUniqueInput[]
    delete?: VideoGenerationWhereUniqueInput | VideoGenerationWhereUniqueInput[]
    connect?: VideoGenerationWhereUniqueInput | VideoGenerationWhereUniqueInput[]
    update?: VideoGenerationUpdateWithWhereUniqueWithoutProjectInput | VideoGenerationUpdateWithWhereUniqueWithoutProjectInput[]
    updateMany?: VideoGenerationUpdateManyWithWhereWithoutProjectInput | VideoGenerationUpdateManyWithWhereWithoutProjectInput[]
    deleteMany?: VideoGenerationScalarWhereInput | VideoGenerationScalarWhereInput[]
  }

  export type VideoGenerationUncheckedUpdateManyWithoutProjectNestedInput = {
    create?: XOR<VideoGenerationCreateWithoutProjectInput, VideoGenerationUncheckedCreateWithoutProjectInput> | VideoGenerationCreateWithoutProjectInput[] | VideoGenerationUncheckedCreateWithoutProjectInput[]
    connectOrCreate?: VideoGenerationCreateOrConnectWithoutProjectInput | VideoGenerationCreateOrConnectWithoutProjectInput[]
    upsert?: VideoGenerationUpsertWithWhereUniqueWithoutProjectInput | VideoGenerationUpsertWithWhereUniqueWithoutProjectInput[]
    createMany?: VideoGenerationCreateManyProjectInputEnvelope
    set?: VideoGenerationWhereUniqueInput | VideoGenerationWhereUniqueInput[]
    disconnect?: VideoGenerationWhereUniqueInput | VideoGenerationWhereUniqueInput[]
    delete?: VideoGenerationWhereUniqueInput | VideoGenerationWhereUniqueInput[]
    connect?: VideoGenerationWhereUniqueInput | VideoGenerationWhereUniqueInput[]
    update?: VideoGenerationUpdateWithWhereUniqueWithoutProjectInput | VideoGenerationUpdateWithWhereUniqueWithoutProjectInput[]
    updateMany?: VideoGenerationUpdateManyWithWhereWithoutProjectInput | VideoGenerationUpdateManyWithWhereWithoutProjectInput[]
    deleteMany?: VideoGenerationScalarWhereInput | VideoGenerationScalarWhereInput[]
  }

  export type VideoProjectCreateNestedOneWithoutGenerationsInput = {
    create?: XOR<VideoProjectCreateWithoutGenerationsInput, VideoProjectUncheckedCreateWithoutGenerationsInput>
    connectOrCreate?: VideoProjectCreateOrConnectWithoutGenerationsInput
    connect?: VideoProjectWhereUniqueInput
  }

  export type VideoSceneCreateNestedManyWithoutGenerationInput = {
    create?: XOR<VideoSceneCreateWithoutGenerationInput, VideoSceneUncheckedCreateWithoutGenerationInput> | VideoSceneCreateWithoutGenerationInput[] | VideoSceneUncheckedCreateWithoutGenerationInput[]
    connectOrCreate?: VideoSceneCreateOrConnectWithoutGenerationInput | VideoSceneCreateOrConnectWithoutGenerationInput[]
    createMany?: VideoSceneCreateManyGenerationInputEnvelope
    connect?: VideoSceneWhereUniqueInput | VideoSceneWhereUniqueInput[]
  }

  export type VideoSceneUncheckedCreateNestedManyWithoutGenerationInput = {
    create?: XOR<VideoSceneCreateWithoutGenerationInput, VideoSceneUncheckedCreateWithoutGenerationInput> | VideoSceneCreateWithoutGenerationInput[] | VideoSceneUncheckedCreateWithoutGenerationInput[]
    connectOrCreate?: VideoSceneCreateOrConnectWithoutGenerationInput | VideoSceneCreateOrConnectWithoutGenerationInput[]
    createMany?: VideoSceneCreateManyGenerationInputEnvelope
    connect?: VideoSceneWhereUniqueInput | VideoSceneWhereUniqueInput[]
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type VideoProjectUpdateOneRequiredWithoutGenerationsNestedInput = {
    create?: XOR<VideoProjectCreateWithoutGenerationsInput, VideoProjectUncheckedCreateWithoutGenerationsInput>
    connectOrCreate?: VideoProjectCreateOrConnectWithoutGenerationsInput
    upsert?: VideoProjectUpsertWithoutGenerationsInput
    connect?: VideoProjectWhereUniqueInput
    update?: XOR<XOR<VideoProjectUpdateToOneWithWhereWithoutGenerationsInput, VideoProjectUpdateWithoutGenerationsInput>, VideoProjectUncheckedUpdateWithoutGenerationsInput>
  }

  export type VideoSceneUpdateManyWithoutGenerationNestedInput = {
    create?: XOR<VideoSceneCreateWithoutGenerationInput, VideoSceneUncheckedCreateWithoutGenerationInput> | VideoSceneCreateWithoutGenerationInput[] | VideoSceneUncheckedCreateWithoutGenerationInput[]
    connectOrCreate?: VideoSceneCreateOrConnectWithoutGenerationInput | VideoSceneCreateOrConnectWithoutGenerationInput[]
    upsert?: VideoSceneUpsertWithWhereUniqueWithoutGenerationInput | VideoSceneUpsertWithWhereUniqueWithoutGenerationInput[]
    createMany?: VideoSceneCreateManyGenerationInputEnvelope
    set?: VideoSceneWhereUniqueInput | VideoSceneWhereUniqueInput[]
    disconnect?: VideoSceneWhereUniqueInput | VideoSceneWhereUniqueInput[]
    delete?: VideoSceneWhereUniqueInput | VideoSceneWhereUniqueInput[]
    connect?: VideoSceneWhereUniqueInput | VideoSceneWhereUniqueInput[]
    update?: VideoSceneUpdateWithWhereUniqueWithoutGenerationInput | VideoSceneUpdateWithWhereUniqueWithoutGenerationInput[]
    updateMany?: VideoSceneUpdateManyWithWhereWithoutGenerationInput | VideoSceneUpdateManyWithWhereWithoutGenerationInput[]
    deleteMany?: VideoSceneScalarWhereInput | VideoSceneScalarWhereInput[]
  }

  export type VideoSceneUncheckedUpdateManyWithoutGenerationNestedInput = {
    create?: XOR<VideoSceneCreateWithoutGenerationInput, VideoSceneUncheckedCreateWithoutGenerationInput> | VideoSceneCreateWithoutGenerationInput[] | VideoSceneUncheckedCreateWithoutGenerationInput[]
    connectOrCreate?: VideoSceneCreateOrConnectWithoutGenerationInput | VideoSceneCreateOrConnectWithoutGenerationInput[]
    upsert?: VideoSceneUpsertWithWhereUniqueWithoutGenerationInput | VideoSceneUpsertWithWhereUniqueWithoutGenerationInput[]
    createMany?: VideoSceneCreateManyGenerationInputEnvelope
    set?: VideoSceneWhereUniqueInput | VideoSceneWhereUniqueInput[]
    disconnect?: VideoSceneWhereUniqueInput | VideoSceneWhereUniqueInput[]
    delete?: VideoSceneWhereUniqueInput | VideoSceneWhereUniqueInput[]
    connect?: VideoSceneWhereUniqueInput | VideoSceneWhereUniqueInput[]
    update?: VideoSceneUpdateWithWhereUniqueWithoutGenerationInput | VideoSceneUpdateWithWhereUniqueWithoutGenerationInput[]
    updateMany?: VideoSceneUpdateManyWithWhereWithoutGenerationInput | VideoSceneUpdateManyWithWhereWithoutGenerationInput[]
    deleteMany?: VideoSceneScalarWhereInput | VideoSceneScalarWhereInput[]
  }

  export type VideoGenerationCreateNestedOneWithoutScenesInput = {
    create?: XOR<VideoGenerationCreateWithoutScenesInput, VideoGenerationUncheckedCreateWithoutScenesInput>
    connectOrCreate?: VideoGenerationCreateOrConnectWithoutScenesInput
    connect?: VideoGenerationWhereUniqueInput
  }

  export type VideoGenerationUpdateOneRequiredWithoutScenesNestedInput = {
    create?: XOR<VideoGenerationCreateWithoutScenesInput, VideoGenerationUncheckedCreateWithoutScenesInput>
    connectOrCreate?: VideoGenerationCreateOrConnectWithoutScenesInput
    upsert?: VideoGenerationUpsertWithoutScenesInput
    connect?: VideoGenerationWhereUniqueInput
    update?: XOR<XOR<VideoGenerationUpdateToOneWithWhereWithoutScenesInput, VideoGenerationUpdateWithoutScenesInput>, VideoGenerationUncheckedUpdateWithoutScenesInput>
  }

  export type NestedUuidFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedUuidFilter<$PrismaModel> | string
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedUuidWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedUuidWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type NestedFloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null
  }
  export type NestedJsonNullableFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<NestedJsonNullableFilterBase<$PrismaModel>>, Exclude<keyof Required<NestedJsonNullableFilterBase<$PrismaModel>>, 'path'>>,
        Required<NestedJsonNullableFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<NestedJsonNullableFilterBase<$PrismaModel>>, 'path'>>

  export type NestedJsonNullableFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type NestedIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type VideoProjectCreateWithoutUserInput = {
    id?: string
    title: string
    storyTopic?: string | null
    characterDescription?: string | null
    script?: string | null
    contentTone?: string | null
    videoGenre?: string | null
    numberOfScenes?: number | null
    status?: string | null
    videoConfig?: NullableJsonNullValueInput | InputJsonValue
    imageConfig?: NullableJsonNullValueInput | InputJsonValue
    audioConfig?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
    generations?: VideoGenerationCreateNestedManyWithoutProjectInput
  }

  export type VideoProjectUncheckedCreateWithoutUserInput = {
    id?: string
    title: string
    storyTopic?: string | null
    characterDescription?: string | null
    script?: string | null
    contentTone?: string | null
    videoGenre?: string | null
    numberOfScenes?: number | null
    status?: string | null
    videoConfig?: NullableJsonNullValueInput | InputJsonValue
    imageConfig?: NullableJsonNullValueInput | InputJsonValue
    audioConfig?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
    generations?: VideoGenerationUncheckedCreateNestedManyWithoutProjectInput
  }

  export type VideoProjectCreateOrConnectWithoutUserInput = {
    where: VideoProjectWhereUniqueInput
    create: XOR<VideoProjectCreateWithoutUserInput, VideoProjectUncheckedCreateWithoutUserInput>
  }

  export type VideoProjectCreateManyUserInputEnvelope = {
    data: VideoProjectCreateManyUserInput | VideoProjectCreateManyUserInput[]
    skipDuplicates?: boolean
  }

  export type VideoProjectUpsertWithWhereUniqueWithoutUserInput = {
    where: VideoProjectWhereUniqueInput
    update: XOR<VideoProjectUpdateWithoutUserInput, VideoProjectUncheckedUpdateWithoutUserInput>
    create: XOR<VideoProjectCreateWithoutUserInput, VideoProjectUncheckedCreateWithoutUserInput>
  }

  export type VideoProjectUpdateWithWhereUniqueWithoutUserInput = {
    where: VideoProjectWhereUniqueInput
    data: XOR<VideoProjectUpdateWithoutUserInput, VideoProjectUncheckedUpdateWithoutUserInput>
  }

  export type VideoProjectUpdateManyWithWhereWithoutUserInput = {
    where: VideoProjectScalarWhereInput
    data: XOR<VideoProjectUpdateManyMutationInput, VideoProjectUncheckedUpdateManyWithoutUserInput>
  }

  export type VideoProjectScalarWhereInput = {
    AND?: VideoProjectScalarWhereInput | VideoProjectScalarWhereInput[]
    OR?: VideoProjectScalarWhereInput[]
    NOT?: VideoProjectScalarWhereInput | VideoProjectScalarWhereInput[]
    id?: UuidFilter<"VideoProject"> | string
    userId?: UuidFilter<"VideoProject"> | string
    title?: StringFilter<"VideoProject"> | string
    storyTopic?: StringNullableFilter<"VideoProject"> | string | null
    characterDescription?: StringNullableFilter<"VideoProject"> | string | null
    script?: StringNullableFilter<"VideoProject"> | string | null
    contentTone?: StringNullableFilter<"VideoProject"> | string | null
    videoGenre?: StringNullableFilter<"VideoProject"> | string | null
    numberOfScenes?: IntNullableFilter<"VideoProject"> | number | null
    status?: StringNullableFilter<"VideoProject"> | string | null
    videoConfig?: JsonNullableFilter<"VideoProject">
    imageConfig?: JsonNullableFilter<"VideoProject">
    audioConfig?: JsonNullableFilter<"VideoProject">
    createdAt?: DateTimeFilter<"VideoProject"> | Date | string
    updatedAt?: DateTimeFilter<"VideoProject"> | Date | string
  }

  export type UserCreateWithoutProjectsInput = {
    id?: string
    email: string
    fullName: string
    passwordHash: string
    createdAt?: Date | string
  }

  export type UserUncheckedCreateWithoutProjectsInput = {
    id?: string
    email: string
    fullName: string
    passwordHash: string
    createdAt?: Date | string
  }

  export type UserCreateOrConnectWithoutProjectsInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutProjectsInput, UserUncheckedCreateWithoutProjectsInput>
  }

  export type VideoGenerationCreateWithoutProjectInput = {
    id?: string
    generationNo: number
    aiModel?: string | null
    resolution?: string | null
    aspectRatio?: string | null
    voiceSettings?: NullableJsonNullValueInput | InputJsonValue
    status?: string | null
    outputUrl?: string | null
    thumbnailUrl?: string | null
    durationSeconds?: number | null
    createdAt?: Date | string
    scenes?: VideoSceneCreateNestedManyWithoutGenerationInput
  }

  export type VideoGenerationUncheckedCreateWithoutProjectInput = {
    id?: string
    generationNo: number
    aiModel?: string | null
    resolution?: string | null
    aspectRatio?: string | null
    voiceSettings?: NullableJsonNullValueInput | InputJsonValue
    status?: string | null
    outputUrl?: string | null
    thumbnailUrl?: string | null
    durationSeconds?: number | null
    createdAt?: Date | string
    scenes?: VideoSceneUncheckedCreateNestedManyWithoutGenerationInput
  }

  export type VideoGenerationCreateOrConnectWithoutProjectInput = {
    where: VideoGenerationWhereUniqueInput
    create: XOR<VideoGenerationCreateWithoutProjectInput, VideoGenerationUncheckedCreateWithoutProjectInput>
  }

  export type VideoGenerationCreateManyProjectInputEnvelope = {
    data: VideoGenerationCreateManyProjectInput | VideoGenerationCreateManyProjectInput[]
    skipDuplicates?: boolean
  }

  export type UserUpsertWithoutProjectsInput = {
    update: XOR<UserUpdateWithoutProjectsInput, UserUncheckedUpdateWithoutProjectsInput>
    create: XOR<UserCreateWithoutProjectsInput, UserUncheckedCreateWithoutProjectsInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutProjectsInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutProjectsInput, UserUncheckedUpdateWithoutProjectsInput>
  }

  export type UserUpdateWithoutProjectsInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    fullName?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserUncheckedUpdateWithoutProjectsInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    fullName?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type VideoGenerationUpsertWithWhereUniqueWithoutProjectInput = {
    where: VideoGenerationWhereUniqueInput
    update: XOR<VideoGenerationUpdateWithoutProjectInput, VideoGenerationUncheckedUpdateWithoutProjectInput>
    create: XOR<VideoGenerationCreateWithoutProjectInput, VideoGenerationUncheckedCreateWithoutProjectInput>
  }

  export type VideoGenerationUpdateWithWhereUniqueWithoutProjectInput = {
    where: VideoGenerationWhereUniqueInput
    data: XOR<VideoGenerationUpdateWithoutProjectInput, VideoGenerationUncheckedUpdateWithoutProjectInput>
  }

  export type VideoGenerationUpdateManyWithWhereWithoutProjectInput = {
    where: VideoGenerationScalarWhereInput
    data: XOR<VideoGenerationUpdateManyMutationInput, VideoGenerationUncheckedUpdateManyWithoutProjectInput>
  }

  export type VideoGenerationScalarWhereInput = {
    AND?: VideoGenerationScalarWhereInput | VideoGenerationScalarWhereInput[]
    OR?: VideoGenerationScalarWhereInput[]
    NOT?: VideoGenerationScalarWhereInput | VideoGenerationScalarWhereInput[]
    id?: UuidFilter<"VideoGeneration"> | string
    projectId?: UuidFilter<"VideoGeneration"> | string
    generationNo?: IntFilter<"VideoGeneration"> | number
    aiModel?: StringNullableFilter<"VideoGeneration"> | string | null
    resolution?: StringNullableFilter<"VideoGeneration"> | string | null
    aspectRatio?: StringNullableFilter<"VideoGeneration"> | string | null
    voiceSettings?: JsonNullableFilter<"VideoGeneration">
    status?: StringNullableFilter<"VideoGeneration"> | string | null
    outputUrl?: StringNullableFilter<"VideoGeneration"> | string | null
    thumbnailUrl?: StringNullableFilter<"VideoGeneration"> | string | null
    durationSeconds?: IntNullableFilter<"VideoGeneration"> | number | null
    createdAt?: DateTimeFilter<"VideoGeneration"> | Date | string
  }

  export type VideoProjectCreateWithoutGenerationsInput = {
    id?: string
    title: string
    storyTopic?: string | null
    characterDescription?: string | null
    script?: string | null
    contentTone?: string | null
    videoGenre?: string | null
    numberOfScenes?: number | null
    status?: string | null
    videoConfig?: NullableJsonNullValueInput | InputJsonValue
    imageConfig?: NullableJsonNullValueInput | InputJsonValue
    audioConfig?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
    user: UserCreateNestedOneWithoutProjectsInput
  }

  export type VideoProjectUncheckedCreateWithoutGenerationsInput = {
    id?: string
    userId: string
    title: string
    storyTopic?: string | null
    characterDescription?: string | null
    script?: string | null
    contentTone?: string | null
    videoGenre?: string | null
    numberOfScenes?: number | null
    status?: string | null
    videoConfig?: NullableJsonNullValueInput | InputJsonValue
    imageConfig?: NullableJsonNullValueInput | InputJsonValue
    audioConfig?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type VideoProjectCreateOrConnectWithoutGenerationsInput = {
    where: VideoProjectWhereUniqueInput
    create: XOR<VideoProjectCreateWithoutGenerationsInput, VideoProjectUncheckedCreateWithoutGenerationsInput>
  }

  export type VideoSceneCreateWithoutGenerationInput = {
    id?: string
    sceneOrder: number
    promptText?: string | null
    imageUrl?: string | null
    audioUrl?: string | null
  }

  export type VideoSceneUncheckedCreateWithoutGenerationInput = {
    id?: string
    sceneOrder: number
    promptText?: string | null
    imageUrl?: string | null
    audioUrl?: string | null
  }

  export type VideoSceneCreateOrConnectWithoutGenerationInput = {
    where: VideoSceneWhereUniqueInput
    create: XOR<VideoSceneCreateWithoutGenerationInput, VideoSceneUncheckedCreateWithoutGenerationInput>
  }

  export type VideoSceneCreateManyGenerationInputEnvelope = {
    data: VideoSceneCreateManyGenerationInput | VideoSceneCreateManyGenerationInput[]
    skipDuplicates?: boolean
  }

  export type VideoProjectUpsertWithoutGenerationsInput = {
    update: XOR<VideoProjectUpdateWithoutGenerationsInput, VideoProjectUncheckedUpdateWithoutGenerationsInput>
    create: XOR<VideoProjectCreateWithoutGenerationsInput, VideoProjectUncheckedCreateWithoutGenerationsInput>
    where?: VideoProjectWhereInput
  }

  export type VideoProjectUpdateToOneWithWhereWithoutGenerationsInput = {
    where?: VideoProjectWhereInput
    data: XOR<VideoProjectUpdateWithoutGenerationsInput, VideoProjectUncheckedUpdateWithoutGenerationsInput>
  }

  export type VideoProjectUpdateWithoutGenerationsInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    storyTopic?: NullableStringFieldUpdateOperationsInput | string | null
    characterDescription?: NullableStringFieldUpdateOperationsInput | string | null
    script?: NullableStringFieldUpdateOperationsInput | string | null
    contentTone?: NullableStringFieldUpdateOperationsInput | string | null
    videoGenre?: NullableStringFieldUpdateOperationsInput | string | null
    numberOfScenes?: NullableIntFieldUpdateOperationsInput | number | null
    status?: NullableStringFieldUpdateOperationsInput | string | null
    videoConfig?: NullableJsonNullValueInput | InputJsonValue
    imageConfig?: NullableJsonNullValueInput | InputJsonValue
    audioConfig?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneRequiredWithoutProjectsNestedInput
  }

  export type VideoProjectUncheckedUpdateWithoutGenerationsInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    storyTopic?: NullableStringFieldUpdateOperationsInput | string | null
    characterDescription?: NullableStringFieldUpdateOperationsInput | string | null
    script?: NullableStringFieldUpdateOperationsInput | string | null
    contentTone?: NullableStringFieldUpdateOperationsInput | string | null
    videoGenre?: NullableStringFieldUpdateOperationsInput | string | null
    numberOfScenes?: NullableIntFieldUpdateOperationsInput | number | null
    status?: NullableStringFieldUpdateOperationsInput | string | null
    videoConfig?: NullableJsonNullValueInput | InputJsonValue
    imageConfig?: NullableJsonNullValueInput | InputJsonValue
    audioConfig?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type VideoSceneUpsertWithWhereUniqueWithoutGenerationInput = {
    where: VideoSceneWhereUniqueInput
    update: XOR<VideoSceneUpdateWithoutGenerationInput, VideoSceneUncheckedUpdateWithoutGenerationInput>
    create: XOR<VideoSceneCreateWithoutGenerationInput, VideoSceneUncheckedCreateWithoutGenerationInput>
  }

  export type VideoSceneUpdateWithWhereUniqueWithoutGenerationInput = {
    where: VideoSceneWhereUniqueInput
    data: XOR<VideoSceneUpdateWithoutGenerationInput, VideoSceneUncheckedUpdateWithoutGenerationInput>
  }

  export type VideoSceneUpdateManyWithWhereWithoutGenerationInput = {
    where: VideoSceneScalarWhereInput
    data: XOR<VideoSceneUpdateManyMutationInput, VideoSceneUncheckedUpdateManyWithoutGenerationInput>
  }

  export type VideoSceneScalarWhereInput = {
    AND?: VideoSceneScalarWhereInput | VideoSceneScalarWhereInput[]
    OR?: VideoSceneScalarWhereInput[]
    NOT?: VideoSceneScalarWhereInput | VideoSceneScalarWhereInput[]
    id?: UuidFilter<"VideoScene"> | string
    generationId?: UuidFilter<"VideoScene"> | string
    sceneOrder?: IntFilter<"VideoScene"> | number
    promptText?: StringNullableFilter<"VideoScene"> | string | null
    imageUrl?: StringNullableFilter<"VideoScene"> | string | null
    audioUrl?: StringNullableFilter<"VideoScene"> | string | null
  }

  export type VideoGenerationCreateWithoutScenesInput = {
    id?: string
    generationNo: number
    aiModel?: string | null
    resolution?: string | null
    aspectRatio?: string | null
    voiceSettings?: NullableJsonNullValueInput | InputJsonValue
    status?: string | null
    outputUrl?: string | null
    thumbnailUrl?: string | null
    durationSeconds?: number | null
    createdAt?: Date | string
    project: VideoProjectCreateNestedOneWithoutGenerationsInput
  }

  export type VideoGenerationUncheckedCreateWithoutScenesInput = {
    id?: string
    projectId: string
    generationNo: number
    aiModel?: string | null
    resolution?: string | null
    aspectRatio?: string | null
    voiceSettings?: NullableJsonNullValueInput | InputJsonValue
    status?: string | null
    outputUrl?: string | null
    thumbnailUrl?: string | null
    durationSeconds?: number | null
    createdAt?: Date | string
  }

  export type VideoGenerationCreateOrConnectWithoutScenesInput = {
    where: VideoGenerationWhereUniqueInput
    create: XOR<VideoGenerationCreateWithoutScenesInput, VideoGenerationUncheckedCreateWithoutScenesInput>
  }

  export type VideoGenerationUpsertWithoutScenesInput = {
    update: XOR<VideoGenerationUpdateWithoutScenesInput, VideoGenerationUncheckedUpdateWithoutScenesInput>
    create: XOR<VideoGenerationCreateWithoutScenesInput, VideoGenerationUncheckedCreateWithoutScenesInput>
    where?: VideoGenerationWhereInput
  }

  export type VideoGenerationUpdateToOneWithWhereWithoutScenesInput = {
    where?: VideoGenerationWhereInput
    data: XOR<VideoGenerationUpdateWithoutScenesInput, VideoGenerationUncheckedUpdateWithoutScenesInput>
  }

  export type VideoGenerationUpdateWithoutScenesInput = {
    id?: StringFieldUpdateOperationsInput | string
    generationNo?: IntFieldUpdateOperationsInput | number
    aiModel?: NullableStringFieldUpdateOperationsInput | string | null
    resolution?: NullableStringFieldUpdateOperationsInput | string | null
    aspectRatio?: NullableStringFieldUpdateOperationsInput | string | null
    voiceSettings?: NullableJsonNullValueInput | InputJsonValue
    status?: NullableStringFieldUpdateOperationsInput | string | null
    outputUrl?: NullableStringFieldUpdateOperationsInput | string | null
    thumbnailUrl?: NullableStringFieldUpdateOperationsInput | string | null
    durationSeconds?: NullableIntFieldUpdateOperationsInput | number | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    project?: VideoProjectUpdateOneRequiredWithoutGenerationsNestedInput
  }

  export type VideoGenerationUncheckedUpdateWithoutScenesInput = {
    id?: StringFieldUpdateOperationsInput | string
    projectId?: StringFieldUpdateOperationsInput | string
    generationNo?: IntFieldUpdateOperationsInput | number
    aiModel?: NullableStringFieldUpdateOperationsInput | string | null
    resolution?: NullableStringFieldUpdateOperationsInput | string | null
    aspectRatio?: NullableStringFieldUpdateOperationsInput | string | null
    voiceSettings?: NullableJsonNullValueInput | InputJsonValue
    status?: NullableStringFieldUpdateOperationsInput | string | null
    outputUrl?: NullableStringFieldUpdateOperationsInput | string | null
    thumbnailUrl?: NullableStringFieldUpdateOperationsInput | string | null
    durationSeconds?: NullableIntFieldUpdateOperationsInput | number | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type VideoProjectCreateManyUserInput = {
    id?: string
    title: string
    storyTopic?: string | null
    characterDescription?: string | null
    script?: string | null
    contentTone?: string | null
    videoGenre?: string | null
    numberOfScenes?: number | null
    status?: string | null
    videoConfig?: NullableJsonNullValueInput | InputJsonValue
    imageConfig?: NullableJsonNullValueInput | InputJsonValue
    audioConfig?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type VideoProjectUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    storyTopic?: NullableStringFieldUpdateOperationsInput | string | null
    characterDescription?: NullableStringFieldUpdateOperationsInput | string | null
    script?: NullableStringFieldUpdateOperationsInput | string | null
    contentTone?: NullableStringFieldUpdateOperationsInput | string | null
    videoGenre?: NullableStringFieldUpdateOperationsInput | string | null
    numberOfScenes?: NullableIntFieldUpdateOperationsInput | number | null
    status?: NullableStringFieldUpdateOperationsInput | string | null
    videoConfig?: NullableJsonNullValueInput | InputJsonValue
    imageConfig?: NullableJsonNullValueInput | InputJsonValue
    audioConfig?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    generations?: VideoGenerationUpdateManyWithoutProjectNestedInput
  }

  export type VideoProjectUncheckedUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    storyTopic?: NullableStringFieldUpdateOperationsInput | string | null
    characterDescription?: NullableStringFieldUpdateOperationsInput | string | null
    script?: NullableStringFieldUpdateOperationsInput | string | null
    contentTone?: NullableStringFieldUpdateOperationsInput | string | null
    videoGenre?: NullableStringFieldUpdateOperationsInput | string | null
    numberOfScenes?: NullableIntFieldUpdateOperationsInput | number | null
    status?: NullableStringFieldUpdateOperationsInput | string | null
    videoConfig?: NullableJsonNullValueInput | InputJsonValue
    imageConfig?: NullableJsonNullValueInput | InputJsonValue
    audioConfig?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    generations?: VideoGenerationUncheckedUpdateManyWithoutProjectNestedInput
  }

  export type VideoProjectUncheckedUpdateManyWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    storyTopic?: NullableStringFieldUpdateOperationsInput | string | null
    characterDescription?: NullableStringFieldUpdateOperationsInput | string | null
    script?: NullableStringFieldUpdateOperationsInput | string | null
    contentTone?: NullableStringFieldUpdateOperationsInput | string | null
    videoGenre?: NullableStringFieldUpdateOperationsInput | string | null
    numberOfScenes?: NullableIntFieldUpdateOperationsInput | number | null
    status?: NullableStringFieldUpdateOperationsInput | string | null
    videoConfig?: NullableJsonNullValueInput | InputJsonValue
    imageConfig?: NullableJsonNullValueInput | InputJsonValue
    audioConfig?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type VideoGenerationCreateManyProjectInput = {
    id?: string
    generationNo: number
    aiModel?: string | null
    resolution?: string | null
    aspectRatio?: string | null
    voiceSettings?: NullableJsonNullValueInput | InputJsonValue
    status?: string | null
    outputUrl?: string | null
    thumbnailUrl?: string | null
    durationSeconds?: number | null
    createdAt?: Date | string
  }

  export type VideoGenerationUpdateWithoutProjectInput = {
    id?: StringFieldUpdateOperationsInput | string
    generationNo?: IntFieldUpdateOperationsInput | number
    aiModel?: NullableStringFieldUpdateOperationsInput | string | null
    resolution?: NullableStringFieldUpdateOperationsInput | string | null
    aspectRatio?: NullableStringFieldUpdateOperationsInput | string | null
    voiceSettings?: NullableJsonNullValueInput | InputJsonValue
    status?: NullableStringFieldUpdateOperationsInput | string | null
    outputUrl?: NullableStringFieldUpdateOperationsInput | string | null
    thumbnailUrl?: NullableStringFieldUpdateOperationsInput | string | null
    durationSeconds?: NullableIntFieldUpdateOperationsInput | number | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    scenes?: VideoSceneUpdateManyWithoutGenerationNestedInput
  }

  export type VideoGenerationUncheckedUpdateWithoutProjectInput = {
    id?: StringFieldUpdateOperationsInput | string
    generationNo?: IntFieldUpdateOperationsInput | number
    aiModel?: NullableStringFieldUpdateOperationsInput | string | null
    resolution?: NullableStringFieldUpdateOperationsInput | string | null
    aspectRatio?: NullableStringFieldUpdateOperationsInput | string | null
    voiceSettings?: NullableJsonNullValueInput | InputJsonValue
    status?: NullableStringFieldUpdateOperationsInput | string | null
    outputUrl?: NullableStringFieldUpdateOperationsInput | string | null
    thumbnailUrl?: NullableStringFieldUpdateOperationsInput | string | null
    durationSeconds?: NullableIntFieldUpdateOperationsInput | number | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    scenes?: VideoSceneUncheckedUpdateManyWithoutGenerationNestedInput
  }

  export type VideoGenerationUncheckedUpdateManyWithoutProjectInput = {
    id?: StringFieldUpdateOperationsInput | string
    generationNo?: IntFieldUpdateOperationsInput | number
    aiModel?: NullableStringFieldUpdateOperationsInput | string | null
    resolution?: NullableStringFieldUpdateOperationsInput | string | null
    aspectRatio?: NullableStringFieldUpdateOperationsInput | string | null
    voiceSettings?: NullableJsonNullValueInput | InputJsonValue
    status?: NullableStringFieldUpdateOperationsInput | string | null
    outputUrl?: NullableStringFieldUpdateOperationsInput | string | null
    thumbnailUrl?: NullableStringFieldUpdateOperationsInput | string | null
    durationSeconds?: NullableIntFieldUpdateOperationsInput | number | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type VideoSceneCreateManyGenerationInput = {
    id?: string
    sceneOrder: number
    promptText?: string | null
    imageUrl?: string | null
    audioUrl?: string | null
  }

  export type VideoSceneUpdateWithoutGenerationInput = {
    id?: StringFieldUpdateOperationsInput | string
    sceneOrder?: IntFieldUpdateOperationsInput | number
    promptText?: NullableStringFieldUpdateOperationsInput | string | null
    imageUrl?: NullableStringFieldUpdateOperationsInput | string | null
    audioUrl?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type VideoSceneUncheckedUpdateWithoutGenerationInput = {
    id?: StringFieldUpdateOperationsInput | string
    sceneOrder?: IntFieldUpdateOperationsInput | number
    promptText?: NullableStringFieldUpdateOperationsInput | string | null
    imageUrl?: NullableStringFieldUpdateOperationsInput | string | null
    audioUrl?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type VideoSceneUncheckedUpdateManyWithoutGenerationInput = {
    id?: StringFieldUpdateOperationsInput | string
    sceneOrder?: IntFieldUpdateOperationsInput | number
    promptText?: NullableStringFieldUpdateOperationsInput | string | null
    imageUrl?: NullableStringFieldUpdateOperationsInput | string | null
    audioUrl?: NullableStringFieldUpdateOperationsInput | string | null
  }



  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}