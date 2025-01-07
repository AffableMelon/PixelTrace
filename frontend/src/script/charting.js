const defaultConfigs = {
  bar: (labels, data) => ({
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          label: "Dataset 1",
          data,
          backgroundColor: "rgba(75, 192, 192, 0.2)",
          borderColor: "rgba(75, 192, 192, 1)",
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: "top" },
        title: { display: true, text: "Bar Chart" },
      },
    },
  }),

  pie: (labels, data) => ({
    type: "pie",
    data: {
      labels,
      datasets: [
        {
          label: "Dataset 1",
          data,
          backgroundColor: [
            "rgba(255, 99, 132, 0.2)",
            "rgba(54, 162, 235, 0.2)",
            "rgba(255, 206, 86, 0.2)",
          ],
          borderColor: [
            "rgba(255, 99, 132, 1)",
            "rgba(54, 162, 235, 1)",
            "rgba(255, 206, 86, 1)",
          ],
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: "top" },
        title: { display: true, text: "Pie Chart" },
      },
    },
  }),

  line: (labels, data) => ({
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "Dataset 1",
          data,
          fill: false,
          borderColor: "rgb(75, 192, 192)",
          tension: 0.1,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: "top" },
        title: { display: true, text: "Line Chart" },
      },
    },
  }),
};

export const renderChart = (chartType, labels, data, title) => {
  const config = defaultConfigs[chartType](labels, data, title);

  // Destroy the existing chart
  if (activeChart) {
    activeChart.destroy();
  }

  // Create a new canvas for the chart
  const canvas = document.createElement("canvas");
  const chartContainer = document.getElementById("chartContainer");
  chartContainer.innerHTML = ""; // Clear the container
  chartContainer.appendChild(canvas);

  // Render the chart
  const ctx = canvas.getContext("2d");
  activeChart = new Chart(ctx, config);
};

// Update chart dynamically
export const updateChart = (title, datasetLabel, labels = null) => {
  if (!activeChart) return;

  // Update title
  activeChart.options.plugins.title.text = title;

  // Update dataset label
  activeChart.data.datasets[0].label = datasetLabel;

  // Optionally update labels
  if (labels) {
    activeChart.data.labels = labels;
  }

  activeChart.update();
};
