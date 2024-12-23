const url = "http://localhost:3000/api/file";
const upload = document.getElementById("upload-form");
const saveChanges = document.getElementById("save-changes");
let filename = "";
let fileContent = null;
upload.addEventListener("submit", async (e) => {
  e.preventDefault();

  const inputFile = document.querySelector("input[type='file']");
  let formData = new FormData();
  formData.append("file", inputFile.files[0]);

  try {
    // console.log("before post");
    const resp = await fetch(url, {
      method: "POST",
      body: formData,
    });

    // console.log("after post");

    const data = await resp.json();
    console.log(data);
    filename = data.filename;
    fileContent = data.data;

    // const headers = Object.keys(data.checkHeaders.data[0]);

    // console.log(headers);

    if (!data.validity) {
      // open table to edit graph
      console.log("show editable table");
      liveEdit(); //when calling the live edit anywhere else (aka user initiate live edit to change data, make sure to have true in the params to not allow header edit)
    } else {
      // show graphs
      console.log("graphs");
    }
  } catch (e) {
    console.log(e);
  }
});

const liveEdit = (state) => {
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
      rowData[headers[index]] = cell.textContent;
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
  } catch (error) {
    console.error("Error updating file:", error);
  }
});
