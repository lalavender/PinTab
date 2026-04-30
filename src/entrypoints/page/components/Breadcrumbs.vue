<script setup lang="ts">
import { useBookmarkStore } from '../stores/bookmarkStore'
import type { BookmarkNode } from '../types'

const bookmarkStore = useBookmarkStore()

function handleClick(item: BookmarkNode, index: number): void {
  if (index !== bookmarkStore.breadcrumbs.length - 1) {
    bookmarkStore.setActiveFolder(item.id)
  }
}
</script>

<template>
  <div v-if="bookmarkStore.breadcrumbs.length > 0" class="breadcrumbs-container mb-4 mt-2">
    <div class="breadcrumbs-path">
      <template v-for="(item, index) in bookmarkStore.breadcrumbs" :key="item.id">
        <div 
          class="breadcrumb-item"
          :class="{ 'breadcrumb-item--active': index === bookmarkStore.breadcrumbs.length - 1 }"
          @click="handleClick(item, index)"
        >
          <v-icon v-if="index === 0" icon="mdi-folder-outline" size="small" class="mr-1" />
          <span class="text-truncate" style="max-width: 150px;">{{ item.title }}</span>
        </div>
        
        <v-icon 
          v-if="index < bookmarkStore.breadcrumbs.length - 1" 
          icon="mdi-chevron-right" 
          size="small" 
          class="breadcrumb-separator" 
        />
      </template>
    </div>
  </div>
</template>

<style scoped>
.breadcrumbs-container {
  display: flex;
  align-items: center;
  overflow-x: auto;
}
.breadcrumbs-container::-webkit-scrollbar {
  display: none;
}

.breadcrumbs-path {
  display: inline-flex;
  align-items: center;
  background-color: rgba(var(--v-theme-on-surface), 0.04);
  padding: 4px 6px;
  border-radius: 12px;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
}

.breadcrumb-item {
  display: flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 500;
  color: rgba(var(--v-theme-on-surface), 0.7);
  cursor: pointer;
  transition: all 0.2s ease;
  user-select: none;
}

.breadcrumb-item:hover:not(.breadcrumb-item--active) {
  background-color: rgba(var(--v-theme-on-surface), 0.08);
  color: rgba(var(--v-theme-on-surface), 0.9);
}

.breadcrumb-item--active {
  color: rgb(var(--v-theme-primary));
  font-weight: 600;
  cursor: default;
}

.breadcrumb-separator {
  color: rgba(var(--v-theme-on-surface), 0.3);
  margin: 0 2px;
}
</style>
