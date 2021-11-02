<template>
  <account-layout>
    <h1>Reset Your Password</h1>
    <activate-form mode="reset" />
  </account-layout>
</template>

<script>
export default {
  middleware: 'notAuthenticated',
  asyncData({ store }) {
    store.commit('account/setErrors', [])
  },
  head: {
    script: [{ src: '/reset-head.js' }]
  }
}
</script>
