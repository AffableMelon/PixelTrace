const { summarizeData } = require("../utils/process-data");
const { test, describe } = require("node:test");
const assert = require("assert");

const testSummarizeData = () => {
  const data = [
    { gender: "Male", age: 25 },
    { gender: "Female", age: 30 },
    { gender: "Male", age: 25 },
    { gender: "Female", age: 35 },
    { gender: "Male", age: 40 },
  ];

  const dataTypes = {
    gender: "categorical",
    age: "numerical",
  };

  const summaries = summarizeData(data, dataTypes);

  // Test categorical column
  assert.deepStrictEqual(summaries.gender, [
    { value: "Male", frequency: 3, percentage: "60.00%" },
    { value: "Female", frequency: 2, percentage: "40.00%" },
  ]);

  // Test numerical column
  assert.deepStrictEqual(summaries.age, {
    mean: "31.00",
    median: "30.00",
    mode: [25],
  });

  console.log("All tests passed.");
};

testSummarizeData();

module.exports = summarizeData;
