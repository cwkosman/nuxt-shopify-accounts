<template>
  <account-layout>
    <h1>Your Addresses</h1>
    <account-navigation />
    <div>
      <button
        :name="`${isEditing ? 'Cancel' : 'Add New Address'}`"
        class="button"
        @click.prevent="toggleEdit"
      >
        {{ isEditing ? 'Cancel' : 'Add New Address' }}
      </button>
    </div>

    <div>
      <template v-if="!addressesLoaded"> loading </template>
      <template v-else-if="addresses && Array.isArray(addresses)">
        <template v-if="isEditing">
          <address-form
            :is-editing.sync="isEditing"
            action="create"
            @submitted="toggleEdit"
          />
        </template>

        <template v-else>
          <form-errors v-if="userErrors.length" :errors="userErrors" />
          <div>
            <div v-if="addresses.length">
              <address-item
                v-for="(address, index) in addresses"
                :key="index"
                :address="address"
                :show-delete="addresses.length > 1"
                :is-default="isDefaultAddress(address)"
              />
            </div>
          </div>
        </template>
      </template>
      <section v-else>
        <address-form action="create" @submitted="toggleEdit" />
      </section>
    </div>
  </account-layout>
</template>

<script>
import { mapState, mapActions } from 'vuex'

export default {
  middleware: 'authenticated',
  asyncData({ store }) {
    store.commit('account/setErrors', [])
  },
  data() {
    return {
      isEditing: false,
      addressesLoaded: false
    }
  },
  head: {
    script: [{ src: '/account-head.js' }]
  },
  computed: {
    ...mapState('account', [
      'customerAccessToken',
      'userErrors',
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
    this.addressesLoaded = false
    const accessToken = this.$cookies.get('customerAccessToken')
    await this.readCustomerAccessToken({ accessToken })
    if (this.customerAccessToken) {
      await this.$store.dispatch('account/fetchAddresses')
    }
    this.addressesLoaded = true
  },
  methods: {
    ...mapActions('account', ['readCustomerAccessToken']),
    toggleEdit() {
      this.isEditing = !this.isEditing
    },
    isDefaultAddress(address) {
      return address && address.id === this.defaultAddress.id
    }
  }
}
</script>
