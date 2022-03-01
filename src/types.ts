type BaseValueType = string | number | boolean | null;
export type SchemaValue =
  | "string"
  | "number"
  | "boolean"
  | [Record<string, unknown>, SchemaValue]
  | ISchema;
export type ResolveValue =
  | BaseValueType
  | IResolve
  | Array<BaseValueType>
  | Array<IResolve>
  | Promise<BaseValueType>
  | Promise<IResolve>
  | Array<Promise<BaseValueType>>
  | Array<Promise<IResolve>>
  | Promise<Array<BaseValueType>>
  | Promise<Array<IResolve>>;
export interface ISchema {
  [key: string]: SchemaValue;
}

export interface IResolve {
  [key: string]: ResolveValue | ResolveFunction;
}
export type ResolveFunction = ResolveFunctionHandle<Object>;
export type ResolveFunctionHandle<T extends Object = Object> = (
  arg: T
) => ResolveValue | Promise<ResolveValue>;
