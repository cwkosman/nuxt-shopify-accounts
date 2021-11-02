const Express = require('express')
const passport = require('passport')
const router = Express.Router()

const AuthController = require('../controllers/auth.controller')

router.get('/auth/facebook', (req, res, next) => {
  const state = AuthController.preservedState(req)
  const authenticator = passport.authenticate('facebook', {
    scope: ['email'],
    session: false,
    state
  })
  authenticator(req, res, next)
})

router.get(
  '/auth/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/', session: false }),
  AuthController.handleCallback
)

router.get('/auth/google/', (req, res, next) => {
  const state = AuthController.preservedState(req)
  const authenticator = passport.authenticate('google', {
    scope: ['openid', 'email', 'profile'],
    session: false,
    state
  })
  authenticator(req, res, next)
})

router.get(
  '/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/', session: false }),
  AuthController.handleCallback
)

router.get(
  '/auth/status',
  passport.authenticate('jwt', { session: false }),
  AuthController.getStatus
)

module.exports = router
