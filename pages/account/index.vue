<template>
  <div>
    <account-layout>
      <h1>My Account</h1>
      <account-navigation />
    </account-layout>
    <div class="container">
      <client-only>
        <div class="columns">
          <section class="column is-two-thirds has-text-left">
            <h2>Order History</h2>
            <orders />
          </section>
          <section class="column is-one-third has-text-left">
            <div class="px-4">
              <h2>Account Details</h2>
              <form-errors v-if="userErrors.length" :errors="userErrors" />

              <template v-if="addresses && addresses[0]">
                <address-item :address="addresses[0]" />
              </template>
              <div class="mt-4">
                <nuxt-link to="/account/addresses" class="button is-tertiary">
                  View Addresses ({{ addresses ? addresses.length : 0 }})
                </nuxt-link>
              </div>
            </div>
          </section>
        </div>
      </client-only>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'

export default {
  middleware: 'authenticated',
  fetchOnServer: false,
  asyncData({ store }) {
    store.commit('account/setErrors', [])
  },
  head: {
    script: [{ src: '/account-head.js' }]
  },
  computed: {
    ...mapState('account', [
      'customerAccessToken',
      'userErrors',
      'orders',
      'defaultAddress',
      'addresses'
    ])
  },
  watch: {
    customerAccessToken(val) {
      if (val === null) {
        this.$router.push('/')
      }
    }
  },
  async mounted() {
    const accessToken =
      this.$cookies.get('customerAccessToken') || this.customerAccessToken

    await this.readCustomerAccessToken({ accessToken })

    if (accessToken) {
      await Promise.all([
        this.fetchCustomer(),
        this.fetchOrders(),
        this.fetchAddresses()
      ])
    }
  },
  methods: {
    ...mapActions('account', [
      'fetchCustomer',
      'fetchOrders',
      'fetchAddresses',
      'readCustomerAccessToken'
    ])
  }
}
</script>

<style lang="scss" scoped>
$containerMaxWidth: 1200px;

.container {
  max-width: $containerMaxWidth;
  min-height: 20vh;
}
.authenticated-layout.section {
  min-height: 10vh;
}
</style>
