const fs = require("fs");
const XLSX = require("xlsx");
const { info, error } = require("./logger.js");

checkHeadersXLSX = (path) => {
  return new Promise((res, rej) => {
    try {
      const workbook = XLSX.readFile(path);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet);
      const headers = XLSX.utils.sheet_to_json(worksheet, { header: 1 })[0];
      const headerSet = new Set();
      let validHeaders = true;
      // let changeHeaders = [];

      for (let header of headers) {
        if (!header || headerSet.has(header)) {
          validHeaders = false;
          break;
        }
        headerSet.add(header);
      }

      info("Parsed Headers:", headers);
      info("Parsed Headers:", headerSet);
      info("headers are", validHeaders);
      res([validHeaders, data]);
    } catch (error) {
      console.log("Unexpected error:", error);
      rej(error);
    }
  });
};

updateFile = (path, data) => {
  return new Promise((res, rej) => {
    const workbook = XLSX.utils.book_new();
    try {
      const worksheet = XLSX.utils.json_to_sheet(data);
      XLSX.utils.book_append_sheet(workbook, worksheet, "sheet1");
      XLSX.writeFile(workbook, path);
      res(true);
    } catch (e) {
      error(e);
      rej(e);
    }
  });
};

retriveFile = (path, check) => {
  try {
    console.log(check);
    const workbook = XLSX.readFile(path);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet, { raw: true });
    console.log(worksheet);

    return data;
  } catch (e) {
    console.log("file path prolly doesnt exist", e);
  }
};
module.exports = {
  checkHeadersXLSX,
  retriveFile,
  updateFile,
};
