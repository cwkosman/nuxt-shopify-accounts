<template>
  <section class="section has-text-centered">
    <div class="container">
      <slot />
    </div>
  </section>
</template>

<script></script>

<style lang="scss" scoped>
$containerMaxWidth: 560px;

.section {
  min-height: 50vh;
}
.container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  max-width: $containerMaxWidth;
}
</style>
