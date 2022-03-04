import { useResolve } from "../src";
describe("list resolve", () => {
  it("root list", () => {
    const rootListResolve = useResolve<number[]>([() => 1, () => 2, () => 3]);
    rootListResolve("number").then((res) => {
      expect(res?.[0]).toBe(1);
      expect(res?.[1]).toBe(2);
      expect(res?.[2]).toBe(3);
      expect(res?.length).toBe(3);
    });
  });
  it("member list", () => {
    const memberListResolve = useResolve<{ list: number[] }>(() => ({
      list: [() => 1, () => 2, () => 3],
    }));
    memberListResolve({ list: "number" }).then((res) => {
      expect(res?.list?.[0]).toBe(1);
      expect(res?.list?.[1]).toBe(2);
      expect(res?.list?.[2]).toBe(3);
      expect(res?.list?.length).toBe(3);
    });
  });
  it("promise result", () => {
    const promiseResult = useResolve<{ list: number[] }>(() => ({
      list: () => [Promise.resolve(1), Promise.resolve(2), Promise.resolve(3)],
    }));
    promiseResult({ list: "number" }).then((res) => {
      expect(res?.list?.[0]).toBe(1);
      expect(res?.list?.[1]).toBe(2);
      expect(res?.list?.[2]).toBe(3);
      expect(res?.list?.length).toBe(3);
    });
  });
});
