<template>
  <div>
    <client-only>
      <div v-if="order.name">
        <h2 class="no-border has-text-left mb-3">Order {{ order.name }}</h2>

        <section class="columns">
          <div class="column is-two-thirds">
            <order-fulfillment
              :order="order"
              :fulfillment="order.fulfillments[0]"
            />
          </div>

          <div class="column is-one-third">
            <div v-if="order.shipping_address" class="px-4">
              <h3>Billing Address</h3>
              <p class="is-capitalized mb-3">
                <b>Payment Status:</b> {{ order.financial_status }}
              </p>
              <p>{{ billingAddress }}</p>
            </div>
            <div v-if="order.shipping_address" class="mt-4 px-4">
              <h3>Shipping Address</h3>
              <p class="is-capitalized mb-3">
                <b>Fulfillment Status:</b> {{ fulfillmentStatus }}
              </p>
              <p>{{ shippingAddress }}</p>
            </div>
          </div>
        </section>
      </div>

      <div v-else>
        <h5>Could not find the specified order</h5>
      </div>
    </client-only>
  </div>
</template>

<script>
import { mapActions } from 'vuex'

export default {
  props: {
    order: {
      type: Object,
      default: () => {}
    }
  },

  async fetch() {
    if (this.order.id) {
      await this.fetchTransactions({ orderID: this.order.id })
    }
  },
  fetchOnServer: false,

  computed: {
    shippingPrice() {
      if (this.order.total_shipping_price_set) {
        return this.order.total_shipping_price_set.presentment_money.amount
      }

      return ''
    },
    shippingAddress() {
      if (this.order.shipping_address) {
        const address = this.order.shipping_address
        const {
          name,
          address1,
          address2,
          city,
          province_code: provinceCode,
          zip,
          country
        } = address
        return {
          name,
          formatted: [
            address1,
            address2,
            `${city}, ${provinceCode}, ${zip}`,
            country
          ]
        }
      }

      return ['']
    },
    billingAddress() {
      if (this.order.billing_address) {
        const address = this.order.billing_address
        const {
          name,
          address1,
          address2,
          city,
          province_code: provinceCode,
          zip,
          country
        } = address
        return {
          name,
          formatted: [
            address1,
            address2,
            `${city}, ${provinceCode}, ${zip}`,
            country
          ]
        }
      }

      return ['']
    },
    fulfillmentStatus() {
      return (
        this.order.fulfillments[0] ||
        this.order.fulfillment_status ||
        'Unfulfilled'
      )
    }
  },

  methods: {
    ...mapActions('account', ['fetchTransactions']),

    priceStringToCurrency(price) {
      return Number(price).toLocaleString(undefined, {
        style: 'currency',
        currency: this.order.presentment_currency
      })
    },
    formatPrice(value, valueIfZero) {
      if (value && value === '0.00') {
        return valueIfZero || this.priceStringToCurrency(value)
      }
      return this.priceStringToCurrency(value)
    }
  }
}
</script>
