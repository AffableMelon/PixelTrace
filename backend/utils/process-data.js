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

// Backend logic for generating summaries
const summarizeData = (data, dataTypes) => {
  const summaries = {};

  for (const column in dataTypes) {
    const type = dataTypes[column];
    const values = data.map((row) => row[column]);

    if (type === "categorical") {
      // Calculate frequencies for categorical columns
      const frequencies = values.reduce((acc, value) => {
        acc[value] = (acc[value] || 0) + 1;
        return acc;
      }, {});

      const total = values.length;
      summaries[column] = Object.entries(frequencies).map(([key, count]) => {
        return {
          value: key,
          frequency: count,
          percentage: ((count / total) * 100).toFixed(2) + "%",
        };
      });
    } else if (type === "numerical") {
      // Calculate mean, median, and mode for numerical columns
      const numericValues = values.map(Number).filter((v) => !isNaN(v));
      const total = numericValues.length;

      const mean = (
        numericValues.reduce((sum, v) => sum + v, 0) / total
      ).toFixed(2);

      const sorted = [...numericValues].sort((a, b) => a - b);
      const median =
        total % 2 === 0
          ? ((sorted[total / 2 - 1] + sorted[total / 2]) / 2).toFixed(2)
          : sorted[Math.floor(total / 2)].toFixed(2);

      const modeMap = numericValues.reduce((acc, value) => {
        acc[value] = (acc[value] || 0) + 1;
        return acc;
      }, {});
      const maxFrequency = Math.max(...Object.values(modeMap));
      const modes = Object.entries(modeMap)
        .filter(([_, freq]) => freq === maxFrequency)
        .map(([value]) => Number(value));

      summaries[column] = { mean, median, mode: modes };
    }
  }

  return summaries;
};
module.exports = {
  classifyAttributes,
  recommendGraphs,
  processDataForGraph,
  summarizeData,
};
