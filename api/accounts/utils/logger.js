const winston = require('winston')
const { ENVIRONMENT } = require('./secrets')

const logger = winston.createLogger({
  transports: [
    new winston.transports.Console({
      level: ENVIRONMENT === 'production' ? 'error' : 'debug'
    }),
    new winston.transports.File({ filename: 'debug.log', level: 'debug' })
  ]
})

if (ENVIRONMENT !== 'production') {
  logger.debug('Logging initialized at debug level')
}

module.exports = logger
