const { sign } = require('jsonwebtoken')
const passport = require('passport')
const FacebookStrategy = require('passport-facebook')
const GoogleStrategy = require('passport-google-oauth20')
const passportJwt = require('passport-jwt')

const {
  ENDPOINT,
  BASE_URL,
  NACELLE_PASSPORT_SECRET,
  FACEBOOK_APP_ID,
  FACEBOOK_APP_SECRET,
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET
} = require('./secrets')

const authJwt = (email, strategy) => {
  return sign({ user: { email }, strategy }, NACELLE_PASSPORT_SECRET || '')
}

passport.use(
  new GoogleStrategy.Strategy(
    {
      clientID: GOOGLE_CLIENT_ID || '',
      clientSecret: GOOGLE_CLIENT_SECRET || '',
      callbackURL: `${BASE_URL}${ENDPOINT}/auth/google/callback`
    },
    (accessToken, refreshToken, profile, cb) => {
      try {
        const email =
          (profile && profile.emails && profile.emails[0].value) || ''

        // Here you'd typically create a new or load an existing user and
        // store the bare necessary informations about the user in the JWT.
        const jwt = authJwt(email, 'google')

        // eslint-disable-next-line node/no-callback-literal
        return cb('', { email, jwt, strategy: 'google' })
      } catch (error) {
        return cb(error)
      }
    }
  )
)

passport.use(
  new FacebookStrategy.Strategy(
    {
      clientID: FACEBOOK_APP_ID || '',
      clientSecret: FACEBOOK_APP_SECRET || '',
      callbackURL: `${BASE_URL}${ENDPOINT}/auth/facebook/callback`,
      profileFields: ['id', 'emails', 'name']
    },
    (accessToken, refreshToken, profile, done) => {
      try {
        const email =
          (profile && profile.emails && profile.emails[0].value) || ''

        // Here you'd typically create a new or load an existing user and
        // store the bare necessary informations about the user in the JWT.
        const jwt = authJwt(email, 'facebook')

        return done(null, { email, jwt, strategy: 'facebook' })
      } catch (error) {
        return done(error)
      }
    }
  )
)

passport.use(
  new passportJwt.Strategy(
    {
      jwtFromRequest(req) {
        if (!req.cookies) throw new Error('Missing cookie-parser middleware')
        return req.cookies.ncl && JSON.parse(req.cookies.ncl).jwt
      },
      secretOrKey: NACELLE_PASSPORT_SECRET
    },
    (payload, done) => {
      try {
        const {
          user: { email },
          strategy
        } = payload
        // Here you'd typically load an existing user
        // and use the data to create the JWT.
        const jwt = authJwt(email, strategy)

        return done(null, { email, jwt, strategy })
      } catch (error) {
        return done(error)
      }
    }
  )
)
