import { useResolve } from "../src/resolve.use";
describe("base type", () => {
  it('123 is number "abc" is string true is boolean', () => {
    const numberResolve = useResolve(() => 123);
    const stringResolve = useResolve(() => "abc");
    const booleanResolve = useResolve(() => true);
    numberResolve("number").then((val) => {
      expect(val).toEqual(123);
      expect(typeof val).toEqual("number");
    });
    stringResolve("string").then((val) => {
      expect(val).toEqual("abc");
      expect(typeof val).toEqual("string");
    });
    booleanResolve("boolean").then((val) => {
      expect(val).toEqual(true);
      expect(typeof val).toEqual("boolean");
    });
  });
});
