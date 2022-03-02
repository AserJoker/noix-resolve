import { useResolve } from "../src/resolve.use";
import { ResolveFunction, ResolveFunctionHandle } from "../src/types";
describe("function type", () => {
  it("root function", () => {
    const handle: ResolveFunctionHandle<{
      name: string;
      age: number;
    }> = ({ name, age }) => {
      return Promise.resolve(`name is ${name},age is ${age}`);
    };
    const rootFunction = useResolve(handle as ResolveFunction);
    rootFunction([{ name: "demo-name", age: 99 }, "string"]).then((res) => {
      expect(res).toBe("name is demo-name,age is 99");
      expect(typeof res).toBe("string");
    });
  });
  it("member function", () => {
    const handle: ResolveFunctionHandle<{ a: number; b: number }> = ({
      a,
      b,
    }) => {
      return a + b;
    };
    const memberResolve = useResolve<{ add: number }>(() => ({
      add: handle as ResolveFunction,
    }));
    memberResolve({ add: [{ a: 123, b: 234 }, "number"] }).then((res) => {
      expect(res?.add).toEqual(357);
      expect(typeof res?.add).toEqual("number");
    });
  });
});
