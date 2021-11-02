const serverless = require('serverless-http')
const app = require('../accounts/app/app')

const handler = serverless(app)
module.exports.handler = async (event, context, callback) => {
  return await handler(event, context)
}
