<script setup lang="ts">
// Mirrors VueUse's Note.vue: a simple callout box for doc prose.
defineProps<{ type?: 'info' | 'tip' | 'warning' | 'danger' }>()
</script>

<template>
  <div class="note" :class="type ? `note-${type}` : ''">
    <slot />
  </div>
</template>
