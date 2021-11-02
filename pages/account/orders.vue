<template>
  <account-layout>
    <div>
      <h1>Order Details</h1>
      <account-navigation />
      <orders />
    </div>
  </account-layout>
</template>

<script>
import { mapState } from 'vuex'

export default {
  middleware: 'authenticated',
  asyncData({ store }) {
    store.commit('account/setErrors', [])
  },
  head: {
    script: [{ src: '/account-head.js' }]
  },
  computed: {
    ...mapState('account', ['customerAccessToken'])
  },
  watch: {
    customerAccessToken(val) {
      if (val === null) {
        this.$router.push('/')
      }
    }
  },
  created() {
    if (this.customerAccessToken) {
      this.$store.dispatch('account/fetchOrders')
    }
  }
}
</script>
