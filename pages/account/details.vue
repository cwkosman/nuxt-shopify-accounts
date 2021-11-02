<template>
  <div class="page account-index page-account">
    <div class="account-box-wide">
      <account-navigation active="info" />
      <div class="account-body">
        <div class="account-body-interior type-f">
          <nuxt-link :to="`/account/login`" class="back-link"> Back </nuxt-link>
          <section class="section section-details">
            <h1 class="form-title">Account Information</h1>
            <customer-form />
          </section>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  middleware: 'authenticated',
  asyncData({ store }) {
    store.commit('account/setErrors', [])
  }
}
</script>
