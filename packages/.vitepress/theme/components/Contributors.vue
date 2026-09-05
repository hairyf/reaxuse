<script setup lang="ts">
import type { ContributorInfo } from '../../plugins/contributors'
import contributorsData from '/virtual-contributors'

// Mirrors VueUse's Contributors.vue: renders the contributor avatars for a
// function, fed by the /virtual-contributors module (git-history derived).
const props = defineProps<{ name: string }>()

const list: ContributorInfo[] = contributorsData[props.name] || []
</script>

<template>
  <div v-if="list.length" class="contributors">
    <a
      v-for="c in list"
      :key="c.name"
      :href="c.url || undefined"
      :title="`${c.name} · ${c.commits} commits`"
    >
      <img
        :src="c.avatar"
        :alt="c.name"
        width="32"
        height="32"
        loading="lazy"
      >
    </a>
  </div>
</template>
