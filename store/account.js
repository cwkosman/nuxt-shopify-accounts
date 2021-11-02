import fetch from 'isomorphic-unfetch'

import {
  set as setCookie,
  get as getCookie,
  remove as removeCookie
} from 'es-cookie'
import {
  CUSTOMER_ACCESS_TOKEN_CREATE,
  CUSTOMER_ACCESS_TOKEN_RENEW,
  CUSTOMER_ACCESS_TOKEN_DELETE,
  CUSTOMER_CREATE,
  CUSTOMER_RECOVER,
  CUSTOMER_RESET,
  CUSTOMER_ACTIVATE,
  GET_CUSTOMER,
  CUSTOMER_UPDATE,
  GET_CUSTOMER_ADDRESSES,
  CUSTOMER_ADDRESS_CREATE,
  CUSTOMER_ADDRESS_UPDATE,
  CUSTOMER_ADDRESS_DELETE,
  CUSTOMER_DEFAULT_ADDRESS_UPDATE,
  transformEdges
} from '../gql'

// The strict mode withholds the cookie from any kind of cross-site usage (including inbound links from external sites).
const sameSite = 'strict'

// Either true or false, indicating if the cookie transmission requires a secure protocol (https).
const secure = process.env.NODE_ENV !== 'development'

async function accountClientPost({
  query,
  variables,
  myshopifyDomain,
  shopifyToken
}) {
  if (!myshopifyDomain) {
    throw new Error(`Missing 'myshopifyDomain' in publicRuntimeConfig`)
  }

  if (!shopifyToken) {
    throw new Error(`Missing 'shopifyToken' in publicRuntimeConfig`)
  }
  const url = `https://${myshopifyDomain}/api/2020-04/graphql`
  const body = JSON.stringify({ query, variables })

  // Default options are marked with *
  const response = await fetch(url, {
    method: 'POST',
    cache: 'no-cache',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'X-Shopify-Storefront-Access-Token': shopifyToken
    },
    body
  })
  return response.json()
}

async function apiPost(endpoint, payload) {
  const body = payload && payload.data ? JSON.stringify(payload.data) : null
  return await fetch(endpoint, {
    method: 'POST',
    body
  }).then((res) => {
    const contentType = res.headers.get('content-type')

    if (contentType.startsWith('text/html')) {
      return res.text()
    }

    if (contentType.startsWith('application/json')) {
      return res.json()
    }
  })
}

export const state = () => ({
  loginStatus: 'loggedOut',
  customer: null,
  customerAccessToken: null,
  orders: [],
  fetchingSiteOptions: false,
  siteOptions: null,
  defaultAddress: null,
  addresses: [],
  userErrors: [],
  fetchingOrders: null,
  countries: [],
  provinces: null
})

export const mutations = {
  setSiteOptions(state, data) {
    state.siteOptions = data
  },
  setFetchingSiteOptions(state, bool) {
    state.fetchingSiteOptions = bool
  },
  setErrors(state, userErrors) {
    if (userErrors) {
      state.userErrors =
        userErrors.map((err) => {
          if (err.message === 'Unidentified customer') {
            err.message = 'Incorrect email/password'
          }
          return err
        }) || []
    }
  },
  setLoginStatus(state, loginState) {
    switch (loginState) {
      case 'loggedIn': {
        state.loginStatus = 'loggedIn'
        break
      }
      case 'loggedOut': {
        state.loginStatus = 'loggedOut'
        break
      }
      case 'loggingIn': {
        state.loginStatus = 'loggingIn'
        break
      }
    }
  },
  setCustomer(state, customer) {
    state.customer = customer
  },
  setCustomerAccessToken(state, customerAccessToken) {
    state.customerAccessToken = customerAccessToken
  },
  setOrders(state, orders) {
    state.orders = orders
  },
  setFetchingOrders(state, bool) {
    state.fetchingOrders = bool
  },
  setTransactions(state, { transactions, orderID }) {
    const orderIndex = state.orders.findIndex((order) => order.id === orderID)
    const order = state.orders[orderIndex]
    const orderWithTransactions = { ...order, transactions }
    const updatedOrders = [...state.orders]
    updatedOrders[orderIndex] = orderWithTransactions

    state.orders = updatedOrders
  },
  setDefaultAddress(state, defaultAddress) {
    state.defaultAddress = defaultAddress
  },
  setAddresses(state, addresses) {
    state.addresses = addresses
  },
  addAddress(state, address) {
    state.addresses = [address].concat(state.addresses)
  },
  removeAddress(state, addressId) {
    // addressId is already decoded from Shopify response
    const id = addressId.split('?')[0]
    state.addresses = state.addresses.filter(
      (item) => atob(item.id).split('?')[0] !== id
    )
  },
  setAddress(state, address) {
    const addressId = atob(address.id).split('?')[0]

    state.addresses = state.addresses.map((item) => {
      const itemId = atob(item.id).split('?')[0]
      if (itemId === addressId) {
        return (item = address)
      } else {
        return item
      }
    })
  },
  addCountries(state, countries) {
    state.countries = countries
  },
  setProvinces(state, provinces) {
    state.provinces = provinces
  }
}

export const actions = {
  updateCustomerAccessToken({ commit }, customerAccessToken) {
    const { accessToken, expiresAt } = customerAccessToken
    const expires = new Date(expiresAt)
    expires.setHours(expires.getHours())
    setCookie('customerAccessToken', accessToken, { expires, secure, sameSite })
    commit('setCustomerAccessToken', customerAccessToken)
  },

  removeCustomerAccessToken({ commit }) {
    removeCookie('customerAccessToken')
    removeCookie('ncl')
    commit('setCustomerAccessToken', null)
    commit('setCustomer', null)
  },

  async readCustomerAccessToken({ dispatch, commit }, { accessToken }) {
    if (accessToken) {
      commit('setCustomerAccessToken', { accessToken, expiresAt: null })
      await dispatch('renewCustomerAccessToken', accessToken)
    }
  },

  async renewCustomerAccessToken({ commit, dispatch }, payload) {
    try {
      const variables = { customerAccessToken: payload }
      const query = CUSTOMER_ACCESS_TOKEN_RENEW
      const { myshopifyDomain, shopifyToken } = this.$config
      const response = await accountClientPost({
        query,
        variables,
        myshopifyDomain,
        shopifyToken
      })
      const {
        customerAccessToken,
        userErrors
      } = response.data.customerAccessTokenRenew
      if (customerAccessToken && customerAccessToken.accessToken) {
        dispatch('updateCustomerAccessToken', customerAccessToken)
        dispatch('fetchCustomer')
      } else {
        // access token does not exist
        dispatch('removeCustomerAccessToken')
      }
      commit('setErrors', userErrors)
    } catch (error) {
      console.error(error)
      throw error
    }
  },

  async fetchCustomer({ state, commit }) {
    try {
      const variables = {
        customerAccessToken: state.customerAccessToken.accessToken
      }
      const query = GET_CUSTOMER
      const { myshopifyDomain, shopifyToken } = this.$config
      const response = await accountClientPost({
        query,
        variables,
        myshopifyDomain,
        shopifyToken
      })
      const { customer, userErrors } = response.data

      if (customer) {
        commit('setCustomer', customer)
      }
      commit('setErrors', userErrors)
    } catch (error) {
      console.error(error)
      throw error
    }
  },

  async updateCustomer({ state, dispatch, commit }, payload) {
    try {
      const {
        firstName,
        lastName,
        email,
        password,
        acceptsMarketing
      } = payload.customer

      const variables = {
        customerAccessToken: state.customerAccessToken.accessToken,
        customer: { firstName, lastName, email, password, acceptsMarketing }
      }
      const query = CUSTOMER_UPDATE
      const { myshopifyDomain, shopifyToken } = this.$config
      const response = await accountClientPost({
        query,
        variables,
        myshopifyDomain,
        shopifyToken
      })
      const { data, errors } = response
      if (errors && errors.length) {
        throw new Error(JSON.stringify(errors))
      }
      const {
        customer,
        customerAccessToken,
        customerUserErrors
      } = data.customerUpdate

      if (customer) {
        commit('setCustomer', customer)
      }

      if (customerAccessToken) {
        dispatch('updateCustomerAccessToken', customerAccessToken)
      }

      commit('setErrors', customerUserErrors)
    } catch (error) {
      console.error(error)
      throw error
    }
  },

  async multipassLogin({ state }, payload) {
    if (process.browser && state.customer && state.customer.email) {
      const { host, protocol } = window.location
      // multipass login
      const customerData = {
        ...state.customer,
        return_to: (payload && payload.returnTo) || `${protocol}//${host}`
      }
      try {
        const multipassUrl = await apiPost(
          this.$config.serverlessEndpoint + '/multipassify',
          {
            data: { customerData }
          }
        )

        return { multipassUrl }
      } catch (error) {
        console.warn(`Error while fetching Multipass URL:\n${error}`)
      }
    }
  },

  async login({ commit, dispatch }, { email, password }) {
    try {
      const variables = { input: { email, password } }
      const query = CUSTOMER_ACCESS_TOKEN_CREATE

      commit('setLoginStatus', 'loggingIn')
      const { myshopifyDomain, shopifyToken } = this.$config
      const response = await accountClientPost({
        query,
        variables,
        myshopifyDomain,
        shopifyToken
      })
      const {
        customerAccessToken,
        userErrors
      } = response.data.customerAccessTokenCreate

      if (customerAccessToken) {
        await dispatch('updateCustomerAccessToken', customerAccessToken)
        await dispatch('fetchCustomer')
        commit('setLoginStatus', 'loggedIn')
      } else {
        commit('setErrors', userErrors)
        commit('setLoginStatus', 'loggedOut')
      }
    } catch (error) {
      commit('setLoginStatus', 'loggedOut')

      throw error
    }
  },

  async logout({ state, dispatch, commit }) {
    const accessToken =
      (state.customerAccessToken && state.customerAccessToken.accessToken) ||
      getCookie('customerAccessToken')
    const variables = { customerAccessToken: accessToken }
    const query = CUSTOMER_ACCESS_TOKEN_DELETE
    const { myshopifyDomain, shopifyToken } = this.$config
    const response = await accountClientPost({
      query,
      variables,
      myshopifyDomain,
      shopifyToken
    })
    const {
      deletedAccessToken,
      userErrors
    } = response.data.customerAccessTokenDelete
    if (deletedAccessToken) {
      dispatch('removeCustomerAccessToken')
      commit('setLoginStatus', 'loggedOut')
    }
    commit('setErrors', userErrors)
  },

  async fetchOrders({ state, dispatch, commit }, payload) {
    try {
      commit('setFetchingOrders', true)

      if (!state.customer || !state.customer.id) {
        await dispatch('fetchCustomer')
      }

      const ordersResponse = await apiPost(
        this.$config.serverlessEndpoint + '/customer-orders',
        {
          data: { customerID: state.customer.id }
        }
      )

      commit('setOrders', ordersResponse)
      commit('setFetchingOrders', false)
    } catch (error) {
      console.error(error)
      throw error
    }
  },

  async fetchTransactions({ state, dispatch, commit }, { orderID }) {
    try {
      if (!state.orders.length) {
        await dispatch('fetchOrders')
      }

      commit('setFetchingOrders', true)

      const transactionsResponse = await apiPost(
        this.$config.serverlessEndpoint + '/customer-transactions',
        {
          data: { orderID }
        }
      )

      const transactionIDs = transactionsResponse.map(
        (transaction) => transaction.id
      )

      const transactions = Promise.all(
        transactionIDs.map((transactionID) =>
          apiPost(this.$config.serverlessEndpoint + '/customer-transaction', {
            data: { orderID, transactionID }
          })
        )
      )

      commit('setTransactions', { transactions, orderID })
      commit('setFetchingOrders', false)
    } catch (error) {
      console.error(error)
      throw error
    }
  },

  async fetchAddresses({ state, commit }) {
    try {
      const variables = {
        customerAccessToken: state.customerAccessToken.accessToken
      }
      const query = GET_CUSTOMER_ADDRESSES
      const { myshopifyDomain, shopifyToken } = this.$config
      const response = await accountClientPost({
        query,
        variables,
        myshopifyDomain,
        shopifyToken
      })
      const { customer, userErrors } = response.data
      if (customer) {
        commit('setAddresses', transformEdges(customer.addresses))
        commit('setDefaultAddress', customer.defaultAddress)
      }
      commit('setErrors', userErrors)
    } catch (error) {
      console.error(error)
      throw error
    }
  },

  async createAddress({ state, commit }, { address }) {
    try {
      const variables = {
        customerAccessToken: state.customerAccessToken.accessToken,
        address
      }
      const query = CUSTOMER_ADDRESS_CREATE
      const { myshopifyDomain, shopifyToken } = this.$config
      const response = await accountClientPost({
        query,
        variables,
        myshopifyDomain,
        shopifyToken
      })
      const { data, errors } = response
      if (errors && errors.length) {
        throw new Error(JSON.stringify(errors))
      }
      const { customerAddress, customerUserErrors } = data.customerAddressCreate
      if (customerAddress) {
        commit('addAddress', customerAddress)
      }
      commit('setErrors', customerUserErrors)
    } catch (error) {
      console.error(error)
      throw error
    }
  },

  async updateAddress({ state, dispatch, commit }, { address, id }) {
    try {
      const variables = {
        customerAccessToken: state.customerAccessToken.accessToken,
        address,
        id
      }
      const query = CUSTOMER_ADDRESS_UPDATE
      const { myshopifyDomain, shopifyToken } = this.$config
      const response = await accountClientPost({
        query,
        variables,
        myshopifyDomain,
        shopifyToken
      })
      const { data, errors } = response
      if (errors && errors.length) {
        throw new Error(JSON.stringify(errors))
      }
      const { customerAddress, customerUserErrors } = data.customerAddressUpdate
      if (customerAddress) {
        commit('setAddress', customerAddress)
      }
      commit('setErrors', customerUserErrors)

      await dispatch('fetchAddresses')
    } catch (error) {
      console.error(error)
      throw error
    }
  },

  async deleteAddress({ state, commit }, { id }) {
    try {
      const variables = {
        customerAccessToken: state.customerAccessToken.accessToken,
        id
      }
      const query = CUSTOMER_ADDRESS_DELETE
      const { myshopifyDomain, shopifyToken } = this.$config
      const response = await accountClientPost({
        query,
        variables,
        myshopifyDomain,
        shopifyToken
      })
      const { data, errors } = response
      if (errors && errors.length) {
        throw new Error(JSON.stringify(errors))
      }
      const {
        deletedCustomerAddressId,
        customerUserErrors
      } = data.customerAddressDelete
      if (deletedCustomerAddressId) {
        commit('removeAddress', deletedCustomerAddressId)
      }
      commit('setErrors', customerUserErrors)
    } catch (error) {
      console.error(error)
      throw error
    }
  },

  async updateDefaultAddress({ state, dispatch, commit }, { address }) {
    try {
      const variables = {
        customerAccessToken: state.customerAccessToken.accessToken,
        addressId: address.id
      }
      const query = CUSTOMER_DEFAULT_ADDRESS_UPDATE
      const { myshopifyDomain, shopifyToken } = this.$config
      const response = await accountClientPost({
        query,
        variables,
        myshopifyDomain,
        shopifyToken
      })
      const { data, errors } = response
      if (errors && errors.length) {
        throw new Error(JSON.stringify(errors))
      }
      const { userErrors } = data.customerDefaultAddressUpdate
      commit('setErrors', userErrors)

      await dispatch('fetchAddresses')
    } catch (error) {
      console.error(error)
      throw error
    }
  },

  async register({ commit }, { firstName, lastName, email, password }) {
    try {
      const variables = { input: { firstName, lastName, email, password } }
      const query = CUSTOMER_CREATE
      const { myshopifyDomain, shopifyToken } = this.$config
      const response = await accountClientPost({
        query,
        variables,
        myshopifyDomain,
        shopifyToken
      })
      const { data, errors } = response
      if (errors && errors.length) {
        throw new Error(JSON.stringify(errors))
      }
      const { customerUserErrors } = data.customerCreate
      commit('setErrors', customerUserErrors)
    } catch (error) {
      console.error(error)
      throw error
    }
  },

  // will need to adjust notifications:
  // https://community.shopify.com/c/Shopify-APIs-SDKs/Reset-Password-Token-in-Notification-Email/td-p/367455
  async recover({ commit }, { email }) {
    try {
      const variables = { email }
      const query = CUSTOMER_RECOVER
      const { myshopifyDomain, shopifyToken } = this.$config
      const response = await accountClientPost({
        query,
        variables,
        myshopifyDomain,
        shopifyToken
      })
      const { data, errors } = response
      if (errors && errors.length) {
        commit('setErrors', errors)
        throw new Error(JSON.stringify(errors))
      }
      const { customerUserErrors } = data.customerRecover
      commit('setErrors', customerUserErrors)
    } catch (error) {
      console.error(error)
      throw error
    }
  },

  async reset({ commit }, { password, resetToken, customerId }) {
    try {
      const id = Buffer.from(`gid://shopify/Customer/${customerId}`).toString(
        'base64'
      )
      const variables = { id, input: { password, resetToken } }
      const query = CUSTOMER_RESET
      const { myshopifyDomain, shopifyToken } = this.$config
      const response = await accountClientPost({
        query,
        variables,
        myshopifyDomain,
        shopifyToken
      })
      const { data, errors } = response
      if (errors && errors.length) {
        throw new Error(JSON.stringify(errors))
      }
      const { customerUserErrors } = data.customerReset

      commit('setErrors', customerUserErrors)
    } catch (error) {
      console.error(error)
      throw error
    }
  },

  async activate({ commit, dispatch }, { password, activationUrl }) {
    try {
      const variables = { password, activationUrl }
      const query = CUSTOMER_ACTIVATE
      const { myshopifyDomain, shopifyToken } = this.$config
      const response = await accountClientPost({
        query,
        variables,
        myshopifyDomain,
        shopifyToken
      })
      const { data, errors } = response
      if (errors && errors.length) {
        throw new Error(JSON.stringify(errors))
      }
      const {
        customerAccessToken,
        customerUserErrors
      } = data.customerActivateByUrl

      commit('setErrors', customerUserErrors)

      if (customerAccessToken) {
        await dispatch('updateCustomerAccessToken', customerAccessToken)
        await dispatch('fetchCustomer')

        return await dispatch('multipassLogin')
      }
    } catch (error) {
      console.error(error)
      throw error
    }
  },

  async fetchSiteOptions({ state, commit }) {
    if (state.siteOptions || state.fetchingSiteOptions) return
    commit('setFetchingSiteOptions', true)
    const siteOptions = await this.$nacelle.data
      .content({ handle: 'site-options', type: 'options' })
      .catch((e) => console.warn(e))
    if (siteOptions) {
      commit('setSiteOptions', siteOptions)
    }
    commit('setFetchingSiteOptions', false)
  },

  async fetchCountries({ state, commit }) {
    if (!state.countries.length) {
      try {
        const countryResponse = await apiPost(
          this.$config.serverlessEndpoint + '/countries'
        )

        if (countryResponse) {
          commit('addCountries', countryResponse)
        }
      } catch (error) {
        console.error(error)
        throw error
      }
    }
  },

  async fetchProvince({ commit }, { countryShortName }) {
    try {
      const provinceResponse = await apiPost(
        this.$config.serverlessEndpoint + '/provinces',
        {
          data: { countryShortName }
        }
      )
      if (provinceResponse) {
        commit('setProvinces', provinceResponse)
      }
    } catch (error) {
      console.error(error)
      throw error
    }
  }
}
