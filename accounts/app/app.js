const dotenv = require('dotenv')
const passport = require('passport')
const Express = require('express')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')

// Load environment variables from .env file, where API keys and passwords are configured
dotenv.config({ path: '.env' })

const routes = require('./routes')

class App {
  constructor() {
    this.app = Express()
    this.config()
  }

  config() {
    // Set router base path for local dev
    const routerBasePath =
      process.env.NODE_ENV === 'dev' ? `/.netlify/functions/` : `/api`
    this.app.use(bodyParser.urlencoded({ extended: true }))
    this.app.use(bodyParser.json())
    this.app.use(cookieParser())
    this.app.use(passport.initialize())
    this.app.use(routerBasePath, routes)
  }
}

module.exports = new App().app
