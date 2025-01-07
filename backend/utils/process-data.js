// const data = [
//   { year: 2010, count: 10 },
//   { year: 2011, count: 20 },
//   { year: 2012, count: 15 },
//   { year: 2013, count: 25 },
//   { year: 2014, count: 22 },
//   { year: 2015, count: 30 },
//   { year: 2016, count: 28 },
// ];

// data = [
//   { Name: "Student_1", Gender: "Female", Age: 23 },
//   { Name: "Student_2", Gender: "Female", Age: 22 },
//   { Name: "Student_3", Gender: "Female", Age: 18 },
//   { Name: "Student_4", Gender: "Female", Age: 22 },
//   { Name: "Student_5", Gender: "Female", Age: 19 },
//   { Name: "Student_6", Gender: "Female", Age: 25 },
//   { Name: "Student_7", Gender: "Male", Age: 21 },
//   { Name: "Student_8", Gender: "Male", Age: 23 },
//   { Name: "Student_9", Gender: "Male", Age: 23 },
//   { Name: "Student_10", Gender: "Male", Age: 21 },
//   { Name: "Student_11", Gender: "Female", Age: 23 },
//   { Name: "Student_12", Gender: "Female", Age: 18 },
//   { Name: "Student_13", Gender: "Female", Age: 18 },
//   { Name: "Student_14", Gender: "Female", Age: 22 },
//   { Name: "Student_15", Gender: "Male", Age: 25 },
//   { Name: "Student_16", Gender: "Female", Age: 21 },
//   { Name: "Student_17", Gender: "Female", Age: 21 },
//   { Name: "Student_18", Gender: "Male", Age: 23 },
//   { Name: "Student_19", Gender: "Male", Age: 22 },
//   { Name: "Student_20", Gender: "Female", Age: 25 },
// ];

// data = [
//   { Name: "Student_1", Gender: "Female", Age: 23 },
//   { Name: "Student_2", Gender: "Female", Age: 22 },
//   { Name: "Student_3", Gender: "Female", Age: 18 },
//   { Name: "Student_4", Gender: "Female", Age: 22 },
// ];

const classifyAttributes = (data) => {
  if (data.length === 0) return {};

  const result = {};
  const keys = Object.keys(data[0]);

  const potentiallyCategorical = (values) => {
    // console.log(values);
    const uniqueValues = Array.from(
      new Set(values.filter((val) => typeof val === "number"))
    );
    // console.log(uniqueValues);

    // console.log(uniqueValues);

    // Check if values are in strictly increasing or strictly decreasing order

    const isStrictlyDecreasing = values.every(
      (val, i, arr) => i === 0 || val < arr[i - 1]
    );

    // console.log(isStrictlyDecreasing);

    const check2 = isStrictlyDecreasing
      ? isStrictlyDecreasing
      : values.every((val, i, arr) => i === 0 || val > arr[i - 1]);
    console.log("check is ", check2);
    console.log("size is ", uniqueValues.length);

    return uniqueValues.length <= 20 && check2;
  };

  keys.forEach((key) => {
    const types = new Set();

    data.forEach((entry) => {
      const value = entry[key];
      if (value !== null && value !== undefined) {
        types.add(typeof value);
      }
    });

    if (types.size === 0) {
      result[key] = "undefined";
    } else if (types.size === 1) {
      const type = [...types][0];
      result[key] = type === "string" ? "categorical" : "numerical";
    } else {
      result[key] = "undefined";
    }

    // console.log(result[key] == "numerical");

    if (result[key] == "numerical") {
      const items = data.map((item) => item[key]);
      console.log(`${key} is `);
      console.log(potentiallyCategorical(items));
      if (potentiallyCategorical(items)) {
        console.log("hello mate");
        result[key] = "both";
      }
    }
  });

  return result;
};

// const attributes = { Gender: "categorical" };
//     const result = recommendGraphs(attributes);

//     expect(result).toEqual({
//       Gender: ["Bar Chart", "Pie Chart"],
//     });
const recommendGraphs = (data) => {
  // const attrs = Object.values(data);
  const keys = Object.keys(data);
  // console.log(attrs);
  const categoricalKeys = [];
  const numericalKeys = [];
  const undefinedKeys = [];

  const recomendations = {
    categorical: ["bar", "pie", "donut"],
    numerical: ["line", "histogram"],
    categoricalNumerical: ["grouped-bar"],
    numericals: ["scatterplot"],
  };

  const result = {};

  keys.forEach((key) => {
    if (data[key] == "categorical") {
      categoricalKeys.push(key);
      result[key] = recomendations.categorical;
    } else if (data[key] == "numerical") {
      numericalKeys.push(key);
      result[key] = recomendations.numerical;
    } else if (data[key] == "undefined") {
      undefinedKeys.push(key);
      result[key] = "undefined";
    } else if (data[key] == "both") {
      categoricalKeys.push(key);
      // numericalKeys.push(key);
      result[key] = recomendations.numerical;
    }
  });

  categoricalKeys.forEach((category) => {
    numericalKeys.forEach((numerical) => {
      result[`${category} vs ${numerical}`] =
        recomendations.categoricalNumerical;
    });
  });

  for (let i = 0; i < numericalKeys.length; i++) {
    for (let j = i + 1; j < numericalKeys.length; j++) {
      result[`${numericalKeys[i]} vs ${numericalKeys[j]}`] =
        recomendations.numericals;
    }
  }

  // console.log(result);

  return result;
};

const processDataForGraph = (data, pickedGraph, keys) => {
  let result = {
    labels: [],
    data: [],
  };

  // Handle Categorical Graphs: Bar, Pie, Donut
  if (["bar", "pie", "donut"].includes(pickedGraph)) {
    const counts = {};
    data.forEach((item) => {
      const value = item[keys];
      if (value != null) {
        counts[value] = (counts[value] || 0) + 1;
      }
    });
    result.labels = Object.keys(counts);
    result.data = Object.values(counts);
    return result;
  }

  // Handle Numerical Graphs: Line, Scatterplot
  else if (["line"].includes(pickedGraph)) {
    if (Array.isArray(keys)) {
      const [xKey, yKey] = keys;
      const xData = [];
      const yData = [];
      data.forEach((item) => {
        if (typeof item[xKey] === "number" && typeof item[yKey] === "number") {
          xData.push(item[xKey]);
          yData.push(item[yKey]);
        }
      });
      result.labels = xData; // x-axis values
      result.data = yData; // y-axis values
    } else {
      const values = [];
      data.forEach((item) => {
        const value = item[keys];
        if (typeof value === "number") {
          values.push(value);
        }
      });
      result.labels = Array.from({ length: values.length }, (_, i) => i); // Indices as x-axis
      result.data = values;
    }
    return result;
  } else if (pickedGraph === "scatterplot") {
    const [xKey, yKey] = keys;
    const datasets = [];
    const scatterData = data
      .filter(
        (item) =>
          typeof item[xKey] === "number" && typeof item[yKey] === "number"
      )
      .map((item) => ({ x: item[xKey], y: item[yKey] }));

    datasets.push({ label: "Data", data: scatterData });
    result.datasets = datasets;

    delete result.data;
    delete result.labels;
    return result;
  }

  // Handle Grouped Bar Chart: Categorical vs Numerical
  else if (pickedGraph === "grouped-bar") {
    const [categoryKey, valueKey] = keys;
    const groupedData = {};
    const categoryLabels = new Set();

    data.forEach((item) => {
      const category = item[categoryKey];
      const value = item[valueKey];
      if (category && typeof value === "number") {
        if (!groupedData[valueKey]) {
          groupedData[valueKey] = {};
        }
        groupedData[valueKey][category] =
          (groupedData[valueKey][category] || 0) + value;
        categoryLabels.add(category);
      }
    });

    result.labels = Array.from(categoryLabels);
    result.data = Object.keys(groupedData).map((key) => ({
      label: key,
      data: result.labels.map((label) => groupedData[key][label] || 0),
    }));
    return result;
  }

  // Handle Numerical Graphs: Histogram
  else if (pickedGraph === "histogram") {
    const bins = {};
    data.forEach((item) => {
      const value = item[keys];
      if (typeof value === "number") {
        const range = `${Math.floor(value / 10) * 10}-${
          Math.floor(value / 10) * 10 + 9
        }`;
        bins[range] = (bins[range] || 0) + 1;
      }
    });
    result.labels = Object.keys(bins);
    result.data = Object.values(bins);
    return result;
  }

  // Default case for unsupported graph types
  return result;
};

// const data3 = [
//   { X: 1, Y: 5 },
//   { X: 2, Y: 10 },
//   { X: 3, Y: 15 },
// ];

// const result = processDataForGraph(data3, "line", ["X", "Y"]);
// const data4 = [{ Gender: "Male" }, { Gender: "Female" }, { Gender: "Male" }];
// console.log(processDataForGraph(data4, "bar", ["Gender"]));

// processDataForGraph(data, "line", ["Gender_1"]);

// console.log(res);

// const processDataForGraph = (data, pickedGraph, keys) => {
//   let result = {
//     labels: [],
//     data: [],
//   };

//   if (
//     pickedGraph === "bar" ||
//     pickedGraph === "pie" ||
//     pickedGraph === "donut"
//   ) {
//     const key = keys[0]; // Assuming the first key is the category
//     const valueKey = keys[1]; // Assuming the second key is the value

//     const groupedData = data.reduce((acc, item) => {
//       const category = item[key];
//       const value = item[valueKey];

//       if (!acc[category]) {
//         acc[category] = 0;
//       }
//       acc[category] += value;
//       return acc;
//     }, {});

//     result.labels = Object.keys(groupedData);
//     result.data = Object.values(groupedData);
//   } else if (pickedGraph === "histogram") {
//     const valueKey = keys[0]; // Assuming the first key is the value

//     const groupedData = data.reduce((acc, item) => {
//       const value = item[valueKey];

//       if (!acc[value]) {
//         acc[value] = 0;
//       }
//       acc[value] += 1;
//       return acc;
//     }, {});

//     result.labels = Object.keys(groupedData);
//     result.data = Object.values(groupedData);
//   } else if (pickedGraph === "line" || pickedGraph === "scatterplot") {
//     const xKey = keys[0]; // Assuming the first key is the x-axis
//     const yKey = keys[1]; // Assuming the second key is the y-axis

//     result.data = data.map((item) => ({
//       x: item[xKey],
//       y: item[yKey],
//     }));
//   }

//   return result;
// };

// const data = [
//   { Category: "A", Value: 10 },
//   { Category: "B", Value: 15 },
//   { Category: "A", Value: 5 },
// ];
// const hmm = classifyAttributes(data);
// console.log(hmm);
// const hmm2 = recommendGraphs(hmm);
// // const finalhmm = processDataForGraph(data, "line", "Age");
// const finalhmm = processDataForGraph(data, "grouped-bar", [
//   "Category",
//   "Value",
// ]);
// console.log(finalhmm);
// console.log(finalhmm.data[0].data);

// console.log(hmm2);
module.exports = { classifyAttributes, recommendGraphs, processDataForGraph };
