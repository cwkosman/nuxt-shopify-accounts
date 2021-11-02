<template>
  <article>
    <div class="mb-3">
      <p>
        Placed on
        <time :datetime="order.processed_at">{{ order.processed_at }}</time>
      </p>
    </div>

    <div class="order-items">
      <template v-if="variants.length || order.line_items.length">
        <table class="table is-fullwidth">
          <thead>
            <tr class="font-condensed is-uppercase">
              <th>Product</th>
              <th>SKU</th>
              <th class="has-text-right">Price</th>
              <th class="has-text-right">Quantity</th>
              <th class="has-text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            <order-detail-item
              v-for="item in items"
              :key="item.id"
              :variant="item"
            />
          </tbody>
          <tbody class="no-border-rows">
            <tr>
              <td class="font-condensed" colspan="4">Subtotal</td>
              <td class="has-text-right">
                <formatted-price
                  :price-set="order.subtotal_price_set.presentment_money"
                />
              </td>
            </tr>
            <tr v-for="(discount, index) in discountsAcross" :key="index">
              <td colspan="4">
                <div class="font-condensed">Discount</div>
                <div class="product-sale font-condensed">
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
                    {{ discount.code }}
                  </div>
                </div>
              </td>
              <td class="has-text-right text-blue-green">
                <template v-if="discount.value_type == 'fixed_amount'">
                  -<formatted-price
                    :price="discount.value"
                    :currency-code="order.currency"
                  />
                </template>
                <template v-else-if="discount.value_type == 'percentage'">
                  -{{ discount.value }}%
                </template>
                <div v-else>{{ discount.value }}</div>
              </td>
            </tr>
            <tr v-for="(taxLine, index) in order.tax_lines" :key="index">
              <td class="font-condensed" colspan="4">
                Tax ({{ taxLine.title }} {{ taxLine.rate * 100 }}%)
              </td>
              <td class="has-text-right">
                <formatted-price
                  :price-set="taxLine.price_set.presentment_money"
                />
              </td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <td class="font-condensed is-uppercase" colspan="4">TOTAL</td>
              <td class="has-text-weight-bold has-text-right">
                <formatted-price
                  :price-set="order.total_price_set.presentment_money"
                />
                <br />
                {{ order.total_price_set.presentment_money.currency_code }}
              </td>
            </tr>
          </tfoot>
        </table>
      </template>
      <div v-else-if="loadingStatus === 'loading'">
        <p>Loading Order Items...</p>
      </div>
      <div v-else-if="loadingStatus === 'not-loading'">
        <p>Product Details Not Found</p>
      </div>
    </div>
  </article>
</template>

<script>
export default {
  computed: {
    items() {
      let items = []
      if (this.variants.length) {
        items = this.variants
      }
      if (this.order.line_items.length) {
        items = this.order.line_items
      }

      return items.map((i) => {
        // eslint-disable-next-line camelcase
        const discount_allocations = i.discount_allocations
          .filter((d) => !!this.discountsEach[d.discount_application_index])
          .map((d) => {
            return {
              ...d,
              discount_code: this.discountsEach[d.discount_application_index]
                .code
            }
          })
        return {
          ...i,
          discount_allocations
        }
      })
    },
    discountsAcross() {
      return this.order.discount_applications.filter(
        (d) => d.allocation_method === 'across'
      )
    },
    discountsEach() {
      return this.order.discount_applications.filter(
        (d) => d.allocation_method === 'each'
      )
    }
  }
}
</script>

<style lang="scss" scoped>
.table {
  border: 1px solid lightgray;

  thead,
  tbody {
    border-bottom: 1px solid #69727b;
  }
  th {
    border: none;
  }
  tbody.no-border-rows tr {
    td {
      border: none;
      padding-top: 0.75rem;
      padding-bottom: 0.75rem;
    }

    & + tr td {
      padding-top: 0.5rem;
    }
  }
}
.product-sale {
  display: flex;
  align-items: center;
}
.icon-saletag {
  height: 0.75rem;

  path {
    fill: darkcyan;
  }
}
.text-blue-green {
  color: darkcyan;
}
</style>
