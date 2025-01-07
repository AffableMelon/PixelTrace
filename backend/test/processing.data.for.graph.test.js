const { processDataForGraph } = require("../utils/process-data");
const { test, describe } = require("node:test");
const assert = require("assert");

// Test: dataProcessing.test.js
// const { processDataForGraph } = require("../src/dataProcessing");

describe("Data Processing for Graphs", () => {
  test("Processes data for Bar Chart with categorical data", () => {
    const data = [{ Gender: "Male" }, { Gender: "Female" }, { Gender: "Male" }];
    const result = processDataForGraph(data, "bar", "Gender");

    assert.deepStrictEqual(result, {
      labels: ["Male", "Female"],
      data: [2, 1],
    });
  });

  test("Processes data for Pie Chart with categorical data", () => {
    const data = [{ Gender: "Male" }, { Gender: "Female" }, { Gender: "Male" }];
    const result = processDataForGraph(data, "pie", "Gender");

    assert.deepStrictEqual(result, {
      labels: ["Male", "Female"],
      data: [2, 1],
    });
  });

  test("Processes data for Histogram with numerical data", () => {
    const data = [{ Age: 18 }, { Age: 25 }, { Age: 19 }];
    const result = processDataForGraph(data, "histogram", "Age");

    assert.deepStrictEqual(result, {
      labels: ["10-19", "20-29"],
      data: [2, 1],
    });
  });

  test("Processes data for Line Chart with numerical data", () => {
    const data = [{ Age: 18 }, { Age: 25 }, { Age: 19 }];
    const result = processDataForGraph(data, "line", "Age");

    assert.deepStrictEqual(result, {
      labels: [0, 1, 2],
      data: [18, 25, 19],
    });
  });

  test("Handles missing values gracefully", () => {
    const data = [{ Age: 18 }, { Age: null }, { Age: 19 }];
    const result = processDataForGraph(data, "line", "Age");

    assert.deepStrictEqual(result, {
      labels: [0, 1],
      data: [18, 19],
    });
  });

  test("Handles mixed data types in a column", () => {
    const data = [{ Age: 18 }, { Age: "twenty" }, { Age: 19 }];
    const result = processDataForGraph(data, "histogram", "Age");

    assert.deepStrictEqual(result, {
      labels: ["10-19"],
      data: [2],
    });
  });

  test("Processes categorical vs numerical for Grouped Bar Chart", () => {
    const data = [
      { Category: "A", Value: 10 },
      { Category: "B", Value: 15 },
      { Category: "A", Value: 5 },
    ];
    const result = processDataForGraph(data, "grouped-bar", [
      "Category",
      "Value",
    ]);

    assert.deepStrictEqual(result, {
      labels: ["A", "B"],
      data: [
        { label: "Value", data: [15, 15] }, // Values grouped by category
      ],
    });
  });

  test("Processes numerical vs numerical for Scatterplot", () => {
    const data = [
      { X: 1, Y: 5 },
      { X: 2, Y: 10 },
      { X: 3, Y: 15 },
    ];
    const result = processDataForGraph(data, "scatterplot", ["X", "Y"]);
    //fails
    assert.deepStrictEqual(result, {
      datasets: [
        {
          label: "Data",
          data: [
            { x: 1, y: 5 },
            { x: 2, y: 10 },
            { x: 3, y: 15 },
          ],
        },
      ],
    });
  });

  test("Returns empty data structure for unsupported graph type", () => {
    const data = [{ Age: 18 }, { Age: 25 }, { Age: 19 }];
    const result = processDataForGraph(data, "undefined", "Age");

    assert.deepStrictEqual(result, {
      labels: [],
      data: [],
    });
  });
});
