<template>
  <div>
    <button class="button" @click="callLogout">Log Out</button>
    <nuxt-link to="/account" class="button">Account Details</nuxt-link>
    <nuxt-link to="/account/orders" class="button">Orders</nuxt-link>
    <nuxt-link to="/account/addresses" class="button">Addresses</nuxt-link>
  </div>
</template>

<script>
import { mapActions } from 'vuex'

export default {
  methods: {
    ...mapActions('account', ['logout']),
    async callLogout() {
      await this.logout()

      this.$router.push('/')
    }
  }
}
</script>
