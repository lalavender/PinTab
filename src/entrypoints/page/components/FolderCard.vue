<script setup lang="ts">
import { ref } from 'vue'
import type { BookmarkNode } from '../types'
import { useBookmarkStore } from '../stores/bookmarkStore'
import { draggedItemId, isDroppedOntoFolder } from '../composables/useBookmarkDrag'

const props = defineProps<{
  folder: BookmarkNode
}>()

const bookmarkStore = useBookmarkStore()
const isDragOver = ref(false)

function handleClick(id: string): void {
  bookmarkStore.setActiveFolder(id)
}

function onDragOver(evt: DragEvent) {
  if (draggedItemId.value && draggedItemId.value !== props.folder.id) {
    isDragOver.value = true
  }
}

function onDragLeave() {
  isDragOver.value = false
}

async function onDrop() {
  isDragOver.value = false
  if (draggedItemId.value && draggedItemId.value !== props.folder.id) {
    isDroppedOntoFolder.value = true
    await bookmarkStore.moveBookmark(draggedItemId.value, { parentId: props.folder.id })
    draggedItemId.value = null
  }
}
</script>

<template>
  <div
    class="folder-card-wrap"
    :class="{ 'drag-over': isDragOver }"
    :data-id="folder.id"
    :data-parent-id="folder.parentId"
    data-type="folder"
    tabindex="0"
    @click="handleClick(folder.id)"
    @keydown.enter="handleClick(folder.id)"
    @dragover.prevent="onDragOver"
    @dragleave="onDragLeave"
    @drop.prevent.stop="onDrop"
  >
    <v-card
      variant="outlined"
      class="bento-card pa-3 d-flex align-center h-100"
    >
      <v-avatar size="36" class="mr-3 flex-shrink-0" color="#0BA6651A" rounded="lg">
        <v-icon icon="mdi-folder" color="#0BA665" size="20" />
      </v-avatar>
      <div class="d-flex flex-column overflow-hidden">
        <h2 class="text-body-2 font-weight-medium text-truncate">{{ folder.title }}</h2>
        <p class="text-caption text-grey text-truncate">
          {{ folder.children?.length || 0 }} {{ folder.children?.length === 1 ? 'item' : 'items' }}
        </p>
      </div>
    </v-card>
  </div>
</template>

<style scoped>
.folder-card-wrap {
  cursor: pointer;
  display: block;
  height: 100%;
  border-radius: 16px;
  transition: all 0.2s ease;
}
.folder-card-wrap.drag-over .bento-card {
  background-color: rgba(11, 166, 101, 0.1);
  border-color: #0BA665;
  transform: scale(1.02);
}
.folder-card-wrap:focus-visible {
  outline: none;
}
.folder-card-wrap:focus-visible .bento-card {
  outline: 2px solid #0BA665;
  outline-offset: 2px;
}
</style>
