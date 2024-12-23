const express = require("express");
const cors = require("cors");
const fileRouter = require("./controllers/file.js");
const { requestLogger } = require("./utils/middleware.js");

const app = express();

app.use(express.json());
app.use(cors());

app.use("/api/file", fileRouter);
app.use(requestLogger);
module.exports = app;
