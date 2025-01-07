const { classifyAttributes } = require("../utils/process-data");
const { test, describe } = require("node:test");
const assert = require("assert");

describe("Attribute Type Classifier", () => {
  test(" string and numerical attributes correctly identified", () => {
    const data = [
      { Name: "Alice", Gender: "Female", Age: 23 },
      { Name: "Bob", Gender: "Female", Age: 22 },
      { Name: "Agent", Gender: "Female", Age: 18 },
      { Name: "Brazil", Gender: "Female", Age: 22 },
    ];

    const result = classifyAttributes(data);

    assert.deepStrictEqual(result, {
      Name: "categorical",
      Age: "numerical",
      Gender: "categorical",
    });
  });

  test(" empty arrays gracefully handeled", () => {
    const data = [];

    const result = classifyAttributes(data);

    assert.deepStrictEqual(result, {});
  });

  test("attributes with mixed types are undefined", () => {
    const data = [
      { Name: "Alice", Age: 25 },
      { Name: "Bob", Age: "thirty" },
      { Name: "dong", Age: 32 },
    ];

    const result = classifyAttributes(data);

    assert.deepStrictEqual(result, {
      Name: "categorical",
      Age: "undefined",
    });
  });

  test("null values in columns can be passed ", () => {
    const data = [
      { Name: "Alice", Gender: "Female", Age: null },
      { Name: "Bob", Gender: null, Age: 22 },
      { Name: null, Gender: "Female", Age: null },
      { Name: "Brazil", Gender: "Female", Age: 22 },
    ];

    const result = classifyAttributes(data);

    assert.deepStrictEqual(result, {
      Name: "categorical",
      Age: "numerical",
      Gender: "categorical",
    });
  });
});
