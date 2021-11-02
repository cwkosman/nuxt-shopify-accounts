<template>
  <tr v-if="variant">
    <td>
      <div class="product-link font-condensed">
        {{ variant.name || variant.productTitle }}
      </div>
      <div
        v-for="(discount, index) in variant.discount_allocations"
        :key="index"
        class="product-sale font-condensed mt-2"
      >
        <svg
          aria-hidden="true"
          focusable="false"
          role="presentation"
          class="icon icon-saletag"
        >
          <path
            d="M10 3a1 1 0 1 1 0-2 1 1 0 0 1 0 2zm0-3H7a1 1 0 0 0-.71.29l-6 6a1 1 0 0 0 0 1.42l4 4a1 1 0 0 0 1.42 0c.19-.2 5.8-5.81 6-6A1 1 0 0 0 12 5V2a2 2 0 0 0-2-2z"
            fill="#231F20"
          ></path>
        </svg>
        <div class="text-blue-green">
          {{ discount.discount_code }}
          (-<product-price :price="discount.amount_set.presentment_money" />)
        </div>
      </div>
    </td>
    <td class="">
      {{ variant.sku }}
    </td>
    <td class="has-text-right">
      <template v-if="showComparePrice">
        <product-price
          :price="variant.price_set.presentment_money"
          class="is-strikethrough"
        />
        <product-price
          :price="variant.pre_tax_price_set.presentment_money"
          class="text-blue-green"
        />
      </template>
      <product-price v-else :price="variant.price_set.presentment_money" />
    </td>
    <td class="has-text-right">
      {{ variant.quantity }}
    </td>
    <td class="has-text-right">
      <template v-if="showComparePrice">
        <product-price
          :price="variant.price_set.presentment_money"
          class="is-strikethrough"
        />
        <product-price
          :price="variant.pre_tax_price_set.presentment_money"
          class="text-blue-green"
        />
      </template>
      <product-price v-else :price="variant.price_set.presentment_money" />
    </td>
  </tr>
</template>

<script>
export default {
  props: {
    variant: {
      type: Object,
      default: () => ({})
    }
  },
  computed: {
    showComparePrice() {
      return this.variant && this.variant.pre_tax_price !== this.variant.price
    }
  }
}
</script>

<style lang="scss" scoped>
.product-sale {
  display: flex;
  align-items: center;
}
.icon-saletag {
  height: 0.75rem;

  path {
    fill: green;
  }
}
.text-blue-green {
  color: darkcyan;
}
</style>
