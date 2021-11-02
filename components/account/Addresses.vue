<template>
  <div>
    <ul v-if="addresses.length">
      <address-item
        v-for="(address, index) in addresses"
        :key="index"
        :address="address"
        :show-delete="addresses.length > 1"
      />
    </ul>
    <div v-else><h5>You don't have any addresses yet.</h5></div>
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  computed: {
    ...mapState('account', ['addresses'])
  }
}
</script>
