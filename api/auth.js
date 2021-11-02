const serverless = require('serverless-http')
const app = require('./accounts/app/app.js')

module.exports = app
module.exports.handler = serverless(app)
