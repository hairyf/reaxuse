<script setup lang="ts">
import { registerSW } from 'virtual:pwa-register'
import { ref } from 'vue'

// Mirrors VueUse's ReloadPrompt.vue: prompts the user when the service
// worker has installed a new version of the site.
const needRefresh = ref(false)

const updateSW = registerSW({
  immediate: true,
  onNeedRefresh() {
    needRefresh.value = true
  },
  onOfflineReady() {},
})

function reload() {
  updateSW(true)
}
</script>

<template>
  <Transition name="fade">
    <div v-if="needRefresh" class="reload-prompt">
      <span>New version available</span>
      <button type="button" @click="reload">
        Reload
      </button>
    </div>
  </Transition>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
