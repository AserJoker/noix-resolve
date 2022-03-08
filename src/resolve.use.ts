import { IResolve, ResolveFunction, SchemaValue } from "./types";

const resolve = async (
  getter: ResolveFunction | ResolveFunction[],
  schema: SchemaValue,
  path: string,
  ctx: Record<string, unknown>
): Promise<unknown> => {
  if (Array.isArray(schema)) {
    const [param, next] = schema;
    if (Array.isArray(getter)) {
      const list: unknown[] = [];
      await Promise.all(
        getter.map(async (handle, index) => {
          list[index] = await resolve(
            () => handle(param, ctx),
            next,
            `${path}()[${index}]`,
            ctx
          );
        })
      );
      return list;
    } else {
      return resolve(() => getter(param, ctx), next, `${path}()`, ctx);
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
          res[index] = await handle({}, ctx);
        })
      );
      return res;
    } else {
      const res = await getter({}, ctx);
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
          list[index] = await resolve(handle, schema, `${path}[${index}]`, ctx);
        })
      );
      return list;
    } else {
      const value = (await getter({}, ctx)) as IResolve | IResolve[];
      if (!value) {
        return null;
      }
      const keys = Object.keys(schema);
      if (Array.isArray(value)) {
        const list: unknown[] = [];
        await Promise.all(
          value.map(async (val, index) => {
            list[index] = await resolve(
              () => val,
              schema,
              `${path}[${index}]`,
              ctx
            );
          })
        );
        return list;
      } else {
        const res: Record<string, unknown> = {};
        if (keys.length) {
          await keys.reduce(async (last, key) => {
            await last;
            const handle = value[key];
            if (handle) {
              res[key] = await resolve(
                handle,
                schema[key] as SchemaValue,
                `${path}.${key}`,
                ctx
              );
            } else {
              res[key] = null;
            }
          }, Promise.resolve());
        }
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
  return async (schema: SchemaValue, ctx: Record<string, unknown> = {}) => {
    const res = await resolve(host, schema, globalName, ctx);
    return res as T | null;
  };
};
