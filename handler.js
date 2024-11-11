const serverless = require('serverless-http');
const app = require('./index');

// Export the handler for Lambda
module.exports.handler = serverless(app);