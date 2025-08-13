const serverless = require("serverless-http");
const app = require("../server"); // import the exported Express app

module.exports = serverless(app);
