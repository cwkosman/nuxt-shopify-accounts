<template>
  <div>
    <global-header />
    <nuxt keep-alive :keep-alive-props="{ max: 2 }" />
  </div>
</template>

<script>
import { mapActions } from 'vuex'
export default {
  async mounted() {
    // Get, read, validate, and renew accessToken from cookies.
    const accessToken = this.$cookies.get('customerAccessToken')
    await this.readCustomerAccessToken({ accessToken })

    await this.initializeCheckout()
    await this.initializeCart()
    await this.clearProductIdb()
    this.readSession()
  },
  methods: {
    ...mapActions('account', ['readCustomerAccessToken']),
    ...mapActions(['clearProductIdb']),
    ...mapActions('cart', ['initializeCart']),
    ...mapActions('checkout', ['initializeCheckout']),
    ...mapActions('user', ['readSession'])
  }
}
</script>

<style lang="scss">
.cart {
  z-index: 9999;
  background: white;
}

html {
  font-family: 'Source Sans Pro', Arial, sans-serif;
  font-size: 16px;
  word-spacing: 1px;
  -ms-text-size-adjust: 100%;
  -webkit-text-size-adjust: 100%;
  -moz-osx-font-smoothing: grayscale;
  -webkit-font-smoothing: antialiased;
  box-sizing: border-box;
}

*,
*:before,
*:after {
  box-sizing: border-box;
  margin: 0;
}

.button--green {
  display: inline-block;
  border-radius: 4px;
  border: 1px solid #3b8070;
  color: #3b8070;
  text-decoration: none;
  padding: 10px 30px;
}

.button--green:hover {
  color: #fff;
  background-color: #3b8070;
}

.button--grey {
  display: inline-block;
  border-radius: 4px;
  border: 1px solid #35495e;
  color: #35495e;
  text-decoration: none;
  padding: 10px 30px;
  margin-left: 15px;
}

.button--grey:hover {
  color: #fff;
  background-color: #35495e;
}
</style>
