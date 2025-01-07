const url = "http://localhost:3000/api/file";
const upload = document.getElementById("upload-form");
const saveChanges = document.getElementById("save-changes");
const showOptions = document.getElementById("graph-options");
const makeChanges = document.getElementById("make-edits");

const updateChartButton = document.getElementById("updateChart");
const chartTitleInput = document.getElementById("chartTitle");
const datasetNameInput = document.getElementById("datasetName");
const customLabelsInput = document.getElementById("customLabels");

let filename = "";
let fileContent = null;
let ff;
upload.addEventListener("submit", async (e) => {
  e.preventDefault();

  const inputFile = document.querySelector("input[type='file']");
  const formData = new FormData();
  formData.append("file", inputFile.files[0]);

  try {
    // Step 1: Upload the file
    const uploadResponse = await fetch(url, {
      method: "POST",
      body: formData,
    });

    const existingTable = document.getElementById("edit-table"); // Replace with your table's ID
    if (existingTable) {
      existingTable.style.display = "none"; // Removes the table from the DOM
    }
    const data = await uploadResponse.json();
    showOptions.innerHTML = "";

    if (window.currentChart) {
      window.currentChart.destroy();
      document.getElementById("customizationPanel").style.display = "none";
    }

    filename = data.filename;
    fileContent = data.data;
    ff = !data.validity;
    // Step 2: Check if the uploaded data is valid
    if (ff) {
      console.log("Data is invalid. Show editable table.");
      liveEdit(); // Initiates table editing
    } else {
      // console.log("Data is valid. Show graph options.");
      makeChanges.style.display = "block";
      document.getElementById("editSection").style.display = "block";
      renderGraphOptions(data.graphs);
    }
  } catch (error) {
    console.error("Error during file upload:", error);
  }
});

/**
 * Render graph options dynamically and handle chart rendering.
 * @param {Object} graphs - Recommended graph options for the dataset.
 */
function renderGraphOptions(graphs) {
  showOptions.innerHTML = ""; // Clear previous options if any
  console.log("graphs", graphs);
  Object.keys(graphs).forEach((key) => {
    const choicesDiv = document.createElement("div");
    const h4 = document.createElement("h4");
    h4.textContent = key;
    choicesDiv.appendChild(h4);

    const choices = graphs[key];
    choices.forEach((choice) => {
      const button = document.createElement("button");
      button.textContent = choice;
      button.addEventListener("click", () => handleGraphSelection(key, choice));
      choicesDiv.appendChild(button);
    });

    showOptions.appendChild(choicesDiv);
  });

  console.log(showOptions);

  showOptions.style.display = "block";
}

/**
 * Handle graph selection and process data for graph rendering.
 * @param {string} key - Selected dataset attribute(s).
 * @param {string} graphType - Chosen graph type.
 */
async function handleGraphSelection(key, graphType) {
  const keyParts = key.split(" ");
  const requestBody = {
    pikedGraph: graphType,
    value: keyParts.length === 1 ? keyParts[0] : [keyParts[0], keyParts[2]],
  };

  // console.log("Request Body:", requestBody);

  try {
    const processResponse = await fetch(`${url}/process/${filename}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ body: requestBody }),
    });

    if (!processResponse.ok) {
      throw new Error(`HTTP error! Status: ${processResponse.status}`);
    }

    // console.log(processResponse);

    const result = await processResponse.json();
    // console.log(result);
    // const processedData = JSON.parse(processResponse.dataProcessed);

    renderChart(graphType, result, key);
  } catch (error) {
    console.error("Error processing data:", error.message);
  }
}

/**
 * Render the chart using Chart.js.
 * @param {string} graphType - Type of graph to render.
 * @param {Object} data - Processed data for the chart.
 * @param {string} title - Title of the chart.
 */
function renderChart(graphType, dP, title) {
  const canvas = document.getElementById("chart");
  const ctx = canvas.getContext("2d");

  if (window.currentChart) {
    window.currentChart.destroy();
  }

  console.log("Graph Type:", graphType);
  console.log("Processed Data:", dP);
  console.log("Chart Title:", title);

  const dataProcessed = dP.dataProcessed;
  // console.log(Object.keys(dataProcessed.dataProcessed));

  let chartConfig;

  if (["donut", "bar", "pie"].includes(graphType)) {
    chartConfig = {
      type: graphType === "donut" ? "doughnut" : graphType,
      data: {
        labels: dataProcessed.labels,
        datasets: [
          {
            label: title || "Dataset",
            data: dataProcessed.data,
            backgroundColor: generateColors(dataProcessed.data.length),
          },
        ],
      },
      options: {
        plugins: {
          title: {
            display: true,
            text: title || "Chart",
          },
        },
      },
    };
  } else if (["line"].includes(graphType)) {
    // For line and scatterplot-single charts
    console.log(graphType);
    chartConfig = {
      type: "line",
      data: {
        labels: graphType === "line" ? dataProcessed.labels : undefined,
        datasets: [
          {
            label: title || "Dataset",
            data:
              graphType === "line"
                ? dataProcessed.data
                : dataProcessed.data.map((point) => ({
                    x: point.x,
                    y: point.y,
                  })),
            backgroundColor: "rgba(75, 192, 192, 0.4)",
            borderColor: "rgba(75, 192, 192, 1)",
            fill: graphType === "line",
          },
        ],
      },
      options: {
        plugins: {
          title: {
            display: true,
            text: title || "Chart",
          },
        },
        scales:
          graphType === "scatterplot-single"
            ? {
                x: {
                  type: "linear",
                  position: "bottom",
                  title: {
                    display: true,
                    text: "X-Axis",
                  },
                },
                y: {
                  title: {
                    display: true,
                    text: "Y-Axis",
                  },
                },
              }
            : {},
      },
    };
  } else if (graphType === "grouped-bar") {
    // For grouped-bar charts
    const datasets = dataProcessed.data.map((group) => ({
      label: group.label,
      data: group.data,
      backgroundColor: generateColors(dataProcessed.labels.length),
    }));

    chartConfig = {
      type: "bar",
      data: {
        labels: dataProcessed.labels,
        datasets: datasets,
      },
      options: {
        plugins: {
          title: {
            display: true,
            text: title || "Grouped Bar Chart",
          },
        },
        scales: {
          x: {
            stacked: true,
          },
          y: {
            stacked: true,
          },
        },
      },
    };
  } else if (graphType === "scatterplot") {
    // For scatterplot with numerical vs numerical data
    chartConfig = {
      type: "scatter",
      data: {
        datasets: dataProcessed.datasets.map((dataset) => ({
          label: dataset.label,
          data: dataset.data,
          backgroundColor: "rgba(153, 102, 255, 0.5)",
          borderColor: "rgba(153, 102, 255, 1)",
        })),
      },
      options: {
        plugins: {
          title: {
            display: true,
            text: title || "Scatterplot",
          },
        },
        scales: {
          x: {
            type: "linear",
            position: "bottom",
            title: {
              display: true,
              text: "X-Axis",
            },
          },
          y: {
            title: {
              display: true,
              text: "Y-Axis",
            },
          },
        },
      },
    };
  } else {
    console.error("Unsupported graph type:", graphType);
    return;
  }

  window.currentChart = new Chart(ctx, chartConfig);

  const customize = document.getElementById("customizationPanel");
  customize.style.display = "block";
}

function generateColors(length) {
  const colors = [];
  for (let i = 0; i < length; i++) {
    const hue = (i * 360) / length;
    colors.push(`hsl(${hue}, 70%, 60%)`);
  }
  return colors;
}

const liveEdit = (state) => {
  makeChanges.style.display = "none";
  const table = document.getElementById("edit-table");
  const headers = Object.keys(fileContent[0]);
  const tableHeader = document.createElement("thead");
  const headerRow = document.createElement("tr");
  table.innerHTML = "";

  headers.forEach((header) => {
    const th = document.createElement("th");
    if (/_\d+$/.test(header)) {
      th.style.color = "red";
    }
    th.contentEditable = !state;
    th.textContent = header;
    headerRow.appendChild(th);
  });

  tableHeader.appendChild(headerRow);
  table.appendChild(tableHeader);

  const tableBody = document.createElement("tbody");
  fileContent.forEach((entry) => {
    // console.log(enrty);
    const trow = document.createElement("tr");
    headers.forEach((header) => {
      const tdata = document.createElement("td");
      tdata.contentEditable = true;
      tdata.textContent = entry[header];
      trow.appendChild(tdata);
    });
    tableBody.appendChild(trow);
  });

  table.appendChild(tableBody);
  table.style.display = "block";
  document.getElementById("editSection").style.display = "block";
  saveChanges.style.display = "block";
};

saveChanges.addEventListener("click", async (e) => {
  const table = document.getElementById("edit-table");
  const rows = document.querySelectorAll("tr");
  const data = [];
  const headers = Array.from(rows[0].querySelectorAll("th")).map(
    (th) => th.textContent
  );

  const headerSet = new Set();
  let validHeaders = true;
  headers.forEach((header) => {
    if (!header || headerSet.has(header)) {
      validHeaders = false;
    }
    headerSet.add(header);
  });

  if (!validHeaders) {
    alert("Invalid headers: Headers must be unique and non-empty.");
    return;
  }

  for (let i = 1; i < rows.length; i++) {
    const cells = rows[i].querySelectorAll("td");
    const rowData = {};
    cells.forEach((cell, index) => {
      const value = cell.textContent.trim();

      if (!isNaN(value) && value !== "") {
        rowData[headers[index]] = value.includes(".")
          ? parseFloat(value)
          : parseInt(value, 10);
      } else {
        rowData[headers[index]] = value;
      }
    });
    data.push(rowData);
  }

  try {
    const response = await fetch(`http://localhost:3000/api/file/${filename}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ data }),
    });

    const result = await response.json();
    console.log(result);
    console.log(result.graphs);

    if (result) {
      renderGraphOptions(result.graphs);
    }
  } catch (error) {
    console.error("Error updating file:", error);
  }
});

makeChanges.addEventListener("click", async (e) => {
  liveEdit(true);
});

updateChartButton.addEventListener("click", () => {
  if (!window.currentChart) {
    alert("No chart available to update!");
    return;
  }

  // Update chart title
  const newTitle = chartTitleInput.value.trim();
  if (newTitle) {
    window.currentChart.options.plugins.title.text = newTitle;
  }

  // Update dataset name
  const newDatasetName = datasetNameInput.value.trim();
  if (newDatasetName) {
    window.currentChart.data.datasets[0].label = newDatasetName;
  }

  // Update custom labels
  const customLabels = customLabelsInput.value
    .split(",")
    .map((label) => label.trim());
  if (customLabels.length > 0 && customLabels[0] !== "") {
    if (customLabels.length === window.currentChart.data.labels.length) {
      window.currentChart.data.labels = customLabels;
    } else {
      alert("Number of custom labels must match the number of data points!");
    }
  }

  // Re-render the chart with updated options and data
  window.currentChart.update();
});
