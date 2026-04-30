<script setup lang="ts">
import { useUIStore } from '../stores/uiStore'

const uiStore = useUIStore()
</script>

<template>
  <Teleport to="body">
    <div v-if="uiStore.toastVisible" class="toast-wrapper">
      <v-alert
        v-model="uiStore.toastVisible"
        type="error"
        closable
        max-width="600"
      >
        {{ uiStore.toastMessage }}
      </v-alert>
    </div>
  </Teleport>
</template>

<style scoped>
.toast-wrapper {
  position: fixed;
  top: 1rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 9999;
  width: auto;
}
</style>
