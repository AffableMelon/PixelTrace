require("dotenv").config();

const PORT = 3000;
const MONGODB_URL =
  process.env.NODE_ENV === "test"
    ? process.env.TEST_URL
    : process.env.MONGODB_URL;

module.exports = {
  PORT,
};
