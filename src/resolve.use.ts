import { IResolve, ResolveFunction, SchemaValue } from "./types";

const resolve = async (
  getter: ResolveFunction | ResolveFunction[],
  schema: SchemaValue,
  path: string
): Promise<unknown> => {
  if (Array.isArray(schema)) {
    const [param, next] = schema;
    if (Array.isArray(getter)) {
      const list: unknown[] = [];
      await Promise.all(
        getter.map(async (handle, index) => {
          list[index] = await resolve(
            () => handle(param),
            next,
            `${path}()[${index}]`
          );
        })
      );
      return list;
    } else {
      return resolve(() => getter(param), next, `${path}()`);
    }
  } else if (
    schema === "string" ||
    schema === "boolean" ||
    schema === "number"
  ) {
    if (Array.isArray(getter)) {
      const res: unknown[] = [];
      await Promise.all(
        getter.map(async (handle, index) => {
          res[index] = await handle({});
        })
      );
      return res;
    } else {
      const res = await getter({});
      if (Array.isArray(res)) {
        const list: unknown[] = [];
        await Promise.all(
          res.map(async (val, index) => {
            list[index] = await val;
          })
        );
        return list;
      }
      return res;
    }
  } else {
    if (Array.isArray(getter)) {
      const list: unknown[] = [];
      await Promise.all(
        getter.map(async (handle, index) => {
          list[index] = await resolve(handle, schema, `${path}[${index}]`);
        })
      );
      return list;
    } else {
      const value = (await getter({})) as IResolve | IResolve[];
      if (!value) {
        return null;
      }
      const keys = Object.keys(schema);
      if (Array.isArray(value)) {
        const list: unknown[] = [];
        await Promise.all(
          value.map(async (val, index) => {
            list[index] = await resolve(() => val, schema, `${path}[${index}]`);
          })
        );
        return list;
      } else {
        const res: Record<string, unknown> = {};
        await Promise.all(
          keys.map(async (key) => {
            const handle = value[key];
            if (handle) {
              res[key] = await resolve(
                handle,
                schema[key] as SchemaValue,
                `${path}.${key}`
              );
            } else {
              res[key] = null;
            }
          })
        );
        return res;
      }
    }
  }
};
/**
 * Returns the resolve function with host
 * @function useResolve
 * @param  host the resolve host
 * @param  globalName global value name default: "global"
 * @returns the resolve function with host
 */
export const useResolve = <T>(
  host: ResolveFunction | ResolveFunction[],
  globalName = "global"
) => {
  return async (schema: SchemaValue) => {
    const res = await resolve(host, schema, globalName);
    return res as T | null;
  };
};
