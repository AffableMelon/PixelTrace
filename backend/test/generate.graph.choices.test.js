const { recommendGraphs } = require("../utils/process-data");
const { test, describe } = require("node:test");
const assert = require("assert");

describe("Graph Recommendation Logic", () => {
  test("Recommends graphs for single categorical attribute", () => {
    const attributes = { Gender: "categorical" };
    const result = recommendGraphs(attributes);

    assert.deepStrictEqual(result, {
      Gender: ["bar", "pie", "donut"],
    });
  });

  test("Recommends graphs for single numerical attribute", () => {
    const attributes = { Age: "numerical" };
    const result = recommendGraphs(attributes);

    assert.deepStrictEqual(result, {
      Age: ["line", "histogram"],
    });
  });

  test("Recommends graphs for categorical and numerical combination", () => {
    const attributes = { Gender: "categorical", Age: "numerical" };
    const result = recommendGraphs(attributes);

    assert.deepStrictEqual(result, {
      Gender: ["bar", "pie", "donut"],
      Age: ["line", "histogram"],
      "Gender vs Age": ["grouped-bar"],
    });
  });

  test("Handles undefined or empty attributes gracefully", () => {
    const attributes = {};
    const result = recommendGraphs(attributes);

    assert.deepStrictEqual(result, {});
  });
});
