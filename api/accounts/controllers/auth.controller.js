require('../utils/passport')
const fetch = require('isomorphic-unfetch')
const Multipassify = require('multipassify')
const {
  COOKIE_SECURE,
  SHOPIFY_MULTIPASS_SECRET,
  MYSHOPIFY_DOMAIN,
  SHOPIFY_STOREFRONT_ACCESS_TOKEN
} = require('../utils/secrets')

const CUSTOMER_ACCESS_TOKEN_CREATE_WITH_MULTIPASS = `mutation customerAccessTokenCreateWithMultipass($multipassToken: String!) {
  customerAccessTokenCreateWithMultipass(multipassToken: $multipassToken) {
    customerAccessToken {
      accessToken
      expiresAt
    }
    customerUserErrors {
      code
      field
      message
    }
  }
}`

const multipassify = new Multipassify(SHOPIFY_MULTIPASS_SECRET)

async function accountClient(data) {
  return await fetch(`https://${MYSHOPIFY_DOMAIN}/api/2020-04/graphql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'X-Shopify-Storefront-Access-Token': SHOPIFY_STOREFRONT_ACCESS_TOKEN
    },
    body: JSON.stringify(data)
  }).then((res) => res.json())
}

const multipassLogin = (customer, returnTo) => {
  const customerData = {
    ...customer,
    return_to: returnTo
  }
  const multipassToken = multipassify.encode(customerData)

  return {
    multipassUrl: `https://${MYSHOPIFY_DOMAIN}/account/login/multipass/${multipassToken}`,
    multipassToken
  }
}

const exchangeMultipassForAccessToken = async (multipassToken) => {
  const variables = { multipassToken }
  const query = CUSTOMER_ACCESS_TOKEN_CREATE_WITH_MULTIPASS
  const response = await accountClient({ query, variables }).catch((err) => {
    throw new Error(err)
  })
  const { data, errors } = response && response.data
  if (errors && errors.length) {
    throw new Error(JSON.stringify(errors))
  }
  const { customerAccessToken, customerUserErrors } =
    data && data.customerAccessTokenCreateWithMultipass

  if (customerAccessToken) {
    return customerAccessToken
  } else {
    throw new Error(customerUserErrors)
  }
}

const handleCallback = async (req, res) => {
  try {
    const { state } = req.query
    if (state === undefined) {
      throw new Error('must set returnTo= query parameter on original request')
    }

    const { returnTo } = JSON.parse(Buffer.from(state, 'base64').toString())
    if (typeof returnTo === 'string') {
      const { multipassUrl, multipassToken } = multipassLogin(
        req.user,
        returnTo
      )
      const { accessToken, expiresAt } = await exchangeMultipassForAccessToken(
        multipassToken
      )
      const payload = {
        ...req.user,
        accessToken,
        expiresAt
      }
      res
        .cookie('ncl', JSON.stringify(payload), { secure: COOKIE_SECURE })
        .redirect(multipassUrl)
    } else {
      throw new TypeError('Invalid returnTo url')
    }
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    })
  }
}

// Needed for Dynamic Routing
const preservedState = (req) => {
  const { returnTo } = req.query
  return returnTo
    ? Buffer.from(JSON.stringify({ returnTo })).toString('base64')
    : undefined
}

const getStatus = (req, res) => {
  try {
    res.json(req.user)
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    })
  }
}

module.exports = {
  handleCallback,
  preservedState,
  getStatus
}
