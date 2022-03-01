import { IResolve, ResolveFunction, ResolveValue, SchemaValue } from "./types";

const resolve = async (
  host: ResolveValue | ResolveFunction,
  schema: SchemaValue,
  path: string
): Promise<unknown> => {
  if (host === null) {
    // null
    return null;
  }
  if (typeof schema === "string") {
    // string|number|boolean|Promise<string|number|boolean>
    if (Array.isArray(host)) {
      const list: unknown[] = [];
      await Promise.all(
        host.map(async (item, index) => {
          const val = await item;
          if (typeof val !== schema) {
            throw new Error(`invalid type ${schema} @${path}[${index}]`);
          }
          list[index] = val;
        })
      );
      return list;
    }
    const value = await Promise.resolve(host as string | number | boolean);
    if (typeof value !== schema) {
      throw new Error(`invalid type ${schema} @${path}`);
    }
    return value;
  }
  if (Array.isArray(schema)) {
    const [param, next] = schema;
    if (typeof host !== "function") {
      throw new Error(`${path} is not a function`);
    }
    const value = await host(param);
    if (Array.isArray(value)) {
      const list: unknown[] = [];
      await Promise.all(
        value.map(async (item, index) => {
          const val = await item;
          list[index] = await resolve(val, next, `${path}()[${index}]`);
        })
      );
      return list;
    }
    return resolve(value, next, path + "()");
  }
  if (Array.isArray(host)) {
    const list: unknown[] = [];
    await Promise.all(
      host.map(async (item, index) => {
        const val = await item;
        list[index] = await resolve(val, schema, `${path}[index]`);
      })
    );
    return list;
  } else {
    const keys = Object.keys(schema);
    const res: Record<string, unknown> = {};
    await Promise.all(
      keys.map(async (key) => {
        const node = schema[key] as SchemaValue;
        const val = (host as IResolve)[key];
        if (!val) {
          throw new Error(`unknown field "${path}.${key}"`);
        }
        res[key] = await resolve(val, node, `${path}.${key}`);
      })
    );
    return res;
  }
};
export const useResolve = <T>(
  host: ResolveValue | ResolveFunction,
  globalName = "global"
) => {
  return async (schema: SchemaValue) => {
    const res = await resolve(
      host as ResolveValue | ResolveFunction,
      schema,
      globalName
    );
    return res as T;
  };
};
