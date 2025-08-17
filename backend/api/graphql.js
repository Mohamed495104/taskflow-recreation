const serverless = require("serverless-http");
const app = require("../server"); // exported Express app

module.exports = serverless(app);
