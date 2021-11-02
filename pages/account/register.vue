<template>
  <account-layout>
    <h1>Create Account</h1>
    <register-form />
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

<style scoped></style>
