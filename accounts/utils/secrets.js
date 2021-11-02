const fs = require('fs')
const dotenv = require('dotenv')
const logger = require('./logger')

if (fs.existsSync('.env')) {
  logger.debug('Using .env file to supply config environment variables')
  dotenv.config({ path: '.env' })
} else {
  logger.debug('Using .env.example file to supply config environment variables')
  dotenv.config({ path: '.env.example' }) // you can delete this after you create your own .env file!
}

const ENVIRONMENT = process.env.NODE_ENV

exports.ENVIRONMENT = ENVIRONMENT
exports.COOKIE_SECURE = ENVIRONMENT !== 'dev'
exports.BASE_URL = process.env.BASE_URL
exports.SHOPIFY_MULTIPASS_SECRET = process.env.SHOPIFY_MULTIPASS_SECRET
exports.MYSHOPIFY_DOMAIN = process.env.MYSHOPIFY_DOMAIN
exports.SHOPIFY_STOREFRONT_ACCESS_TOKEN =
  process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN

// Netlify Functions specific
exports.ENDPOINT = ENVIRONMENT === 'dev' ? '/.netlify/functions' : '/api'

const NACELLE_PASSPORT_SECRET = process.env.NACELLE_PASSPORT_SECRET
const FACEBOOK_APP_ID = process.env.FACEBOOK_APP_ID
const FACEBOOK_APP_SECRET = process.env.FACEBOOK_APP_SECRET
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET

exports.NACELLE_PASSPORT_SECRET = NACELLE_PASSPORT_SECRET
exports.FACEBOOK_APP_ID = FACEBOOK_APP_ID
exports.FACEBOOK_APP_SECRET = FACEBOOK_APP_SECRET
exports.GOOGLE_CLIENT_ID = GOOGLE_CLIENT_ID
exports.GOOGLE_CLIENT_SECRET = GOOGLE_CLIENT_SECRET

if (!NACELLE_PASSPORT_SECRET) {
  logger.error(
    'No client secret. Set NACELLE_PASSPORT_SECRET environment variable.'
  )
  process.exit(1)
}

if (!FACEBOOK_APP_ID) {
  logger.error(
    'No client facebook id. Set FACEBOOK_APP_ID environment variable.'
  )
  process.exit(1)
}

if (!FACEBOOK_APP_SECRET) {
  logger.error(
    'No client facebook secret. Set FACEBOOK_APP_SECRET environment variable.'
  )
  process.exit(1)
}

if (!GOOGLE_CLIENT_ID) {
  logger.error(
    'No client google id. Set GOOGLE_CLIENT_ID environment variable.'
  )
  process.exit(1)
}

if (!GOOGLE_CLIENT_SECRET) {
  logger.error(
    'No client google secret. Set GOOGLE_CLIENT_SECRET environment variable.'
  )
  process.exit(1)
}
