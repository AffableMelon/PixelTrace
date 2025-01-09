const fileRouter = require("express").Router();
const { error, requestLogger } = require("../utils/middleware.js");
const multer = require("multer");
const fs = require("fs");
const {
  checkHeadersXLSX,
  retriveFile,
  updateFile,
} = require("../utils/fileparse.js");
const {
  classifyAttributes,
  recommendGraphs,
  processDataForGraph,
  summarizeData,
} = require("../utils/process-data");

const upload = multer({ dest: "uploads/" });

fileRouter.get("/:filepath", requestLogger, async (req, resp) => {
  const filepath = `uploads/${req.params.filepath}`;
  try {
    const read = await retriveFile(filepath);
    // console.log(read);
    if (!read) {
      return resp.status(404).json({ error: "file not found" });
    } else {
      return resp.status(200).json({ data: read });
    }
  } catch (e) {
    console.log(e.message);
    console.log("Error reading the file prolly");
    return resp.status(500).json({ error: "something failed bro" });
  }
});

fileRouter.post(
  "/",
  upload.single("file"),
  requestLogger,
  async (req, resp) => {
    if (!req.file) {
      return resp.status(400).json({ error: "No file uploaded" });
    }
    const filepath = req.file.path;
    const filename = req.file.filename;

    const [validity, data] = await checkHeadersXLSX(filepath);

    console.log("headers are what?", [validity, data], filepath);
    if (!validity) {
      return resp.status(200).json({ validity, data, filename });
    } else {
      const identify = await classifyAttributes(data);
      const graphs = await recommendGraphs(identify);
      return resp.status(200).json({ validity, data, filename, graphs });
    }
  }
);

fileRouter.put("/:filepath", requestLogger, async (req, resp) => {
  const filepath = `uploads/${req.params.filepath}`;
  const datajson = req.body.data;

  console.log(filepath, datajson);
  if (!filepath || !datajson) {
    return resp.status(400).json({ error: "File path or data missing" });
  }

  const savedSucces = await updateFile(filepath, datajson);
  const dataReal = await retriveFile(filepath, true);

  console.log(dataReal);

  if (!savedSucces) {
    return resp.status(400).json({ error: "cant find the file" });
  } else {
    const identify = await classifyAttributes(dataReal);
    const graphs = await recommendGraphs(identify);
    return resp.status(200).json({ sucess: "saved changes", graphs });
  }
});

fileRouter.post("/process/:filepath", requestLogger, async (req, resp) => {
  const filepath = req.params.filepath;
  const data = await retriveFile(`uploads/${req.params.filepath}`);

  // console.log(data);
  const body = req.body.body;

  const dataProcessed = await processDataForGraph(
    data,
    body.pikedGraph,
    body.value
  );
  console.log(dataProcessed);

  return resp.status(200).json({ dataProcessed });
});

fileRouter.post("/summarize", requestLogger, async (req, resp) => {
  const filepath = `uploads/${req.body.filepath}`;
  // console.log(req.body);

  if (!filepath) {
    return resp.status(400).json({ error: "Filepath is required." });
  }

  try {
    const data = await retriveFile(filepath, true);
    const types = await classifyAttributes(data);

    // console.log()

    if (!data) {
      return resp.status(404).json({ error: "File not found or empty." });
    }

    const summary = await summarizeData(data, types);

    if (!summary) {
      return resp.status(500).json({ error: "Failed to summarize data." });
    }

    return resp.status(200).json({ summary });
  } catch (error) {
    console.error("Error in /summarize endpoint:", error);
    return resp.status(500).json({ error: "Internal Server Error." });
  }
});

module.exports = fileRouter;
