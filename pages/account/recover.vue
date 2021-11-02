<template>
  <account-layout>
    <recover-form />
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
