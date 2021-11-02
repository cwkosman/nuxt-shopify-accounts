<template>
  <div>
    <account-layout>
      <h1>Order Detail</h1>
      <account-navigation />
    </account-layout>
    <div>
      <order-detail v-if="order" :order="order" />
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'

export default {
  middleware: 'authenticated',
  data() {
    return {
      orderToken: this.$route.params.handle
    }
  },
  head: {
    script: [{ src: '/account-head.js' }]
  },
  computed: {
    ...mapState('account', ['customerAccessToken', 'orders']),

    order() {
      return this.orders.length
        ? this.orders.find(
            (order) => order.token.toString() === this.orderToken
          )
        : null
    }
  },
  watch: {
    customerAccessToken(val) {
      if (val === null) {
        this.$router.push('/')
      }
    }
  },
  async created() {
    if (this.customerAccessToken && !this.orders.length) {
      await this.fetchOrders()
    }
  },
  methods: {
    ...mapActions('account', ['fetchOrders'])
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
  min-height: 4rem;
}
</style>
