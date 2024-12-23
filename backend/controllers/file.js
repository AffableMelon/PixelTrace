const fileRouter = require("express").Router();
const { error, requestLogger } = require("../utils/middleware.js");
const multer = require("multer");
const fs = require("fs");
const {
  checkHeadersXLSX,
  retriveFile,
  updateFile,
} = require("../utils/fileparse.js");

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

    return resp.status(200).json({ validity, data, filename });
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

  if (!savedSucces) {
    return resp.status(400).json({ error: "cant find the file" });
  } else {
    return resp.status(200).json({ sucess: "saved changes" });
  }
});

module.exports = fileRouter;
