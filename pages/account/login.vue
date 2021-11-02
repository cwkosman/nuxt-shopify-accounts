<template>
  <account-layout>
    <h1>Login</h1>
    <login-form />
    <!-- Social Login -->
    <!-- <nacelle-passport
      :myshopify-domain="$nacelle.myshopifyDomain"
      title="or Log in via"
    /> -->

    <div class="my-4">
      <nuxt-link :to="`/account/register#form`"> Create account </nuxt-link>
    </div>
  </account-layout>
</template>

<script>
export default {
  middleware: 'notAuthenticated',
  asyncData({ store }) {
    store.commit('account/setErrors', [])
  }
}
</script>
