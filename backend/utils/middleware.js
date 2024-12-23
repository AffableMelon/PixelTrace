const logger = require("./logger");
// const jwt = require("jsonwebtoken");
// const User = require("../models/users");

const requestLogger = (request, response, next) => {
  logger.info("Method:", request.method);
  logger.info("Path:  ", request.path);
  logger.info("File:  ", request.file);
  logger.info("---");
  next();
};

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" });
};

// const errorHandler = (error, request, response, next) => {
//   logger.error(error);

//   if (error.name === "CastError") {
//     return response.status(400).send({ error: "malformatted id" });
//   } else if (error.name === "ValidationError") {
//     return response.status(400).json({ error: error.message });
//   } else if (error.name === "PasswordErr") {
//     return response.status(400).json({ error: error.message });
//   } else if (error.name === "MongoServerError" && error.code === 11000) {
//     return response.status(400).json({ error: "Username Taken" });
//   } else if (error.name === "JsonWebTokenError") {
//     return response.status(401).json({
//       error: "inivalid token",
//     });
//   }

//   next(error);
// };
module.exports = {
  requestLogger,

  unknownEndpoint,
};