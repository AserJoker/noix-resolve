type BaseValueType = string | number | boolean | null;
export interface ISchema {
  [key: string]: string | [Record<string, unknown>, ISchema] | ISchema;
}
export interface IResolve {
  [key: string]: BaseValueType | Promise<BaseValueType>;
}