<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useBookmarkStore } from '../stores/bookmarkStore'
import { useUIStore } from '../stores/uiStore'
import { useI18n } from '../composables/useI18n'
import { findInTree } from '../utils/treeUtils'
import type { BookmarkNode } from '../types'

const { t } = useI18n()
const bookmarkStore = useBookmarkStore()
const uiStore = useUIStore()

const showBookmark = ref(false)
const showFolder = ref(false)
const showBlank = ref(false)
const posX = ref(0)
const posY = ref(0)
const selectedBookmark = ref<BookmarkNode | null>(null)
const selectedFolder = ref<BookmarkNode | null>(null)

function handleContextMenu(event: MouseEvent): void {
  const target = event.target as HTMLElement
  const bookmarkEl = target.closest('.bookmark-link') as HTMLElement | null
  const folderEl = target.closest('.folder-card-wrap') as HTMLElement | null

  if (bookmarkEl) {
    if (uiStore.contextMenuDisabled) return
    event.preventDefault()
    const id = bookmarkEl.dataset.id
    if (!id) return
    const node = findInTree(bookmarkStore.firstLayer, (n) => n.id === id)
    if (node) {
      selectedBookmark.value = node
      setPos(event)
      showBookmark.value = true
      showFolder.value = false
      showBlank.value = false
    }
  } else if (folderEl) {
    if (uiStore.contextMenuDisabled) return
    event.preventDefault()
    const id = folderEl.dataset.id
    if (!id) return
    const node = findInTree(bookmarkStore.firstLayer, (n) => n.id === id)
    if (node) {
      selectedFolder.value = node
      setPos(event)
      showFolder.value = true
      showBookmark.value = false
      showBlank.value = false
    }
  } else if (target.closest('#main') && !target.closest('.bookmark-link') && !target.closest('.folder-card-wrap')) {
    if (!bookmarkStore.activeFolderId) return
    event.preventDefault()
    setPos(event)
    showBookmark.value = false
    showBlank.value = true
  } else {
    closeAll()
  }
}

function setPos(event: MouseEvent): void {
  const menuWidth = 224
  const menuHeight = 120
  let x = event.clientX
  let y = event.clientY

  const isScrollY = window.innerHeight < document.documentElement.scrollHeight
  const isScrollX = window.innerWidth < document.documentElement.scrollWidth

  if (x + menuWidth > window.innerWidth - (isScrollY ? 25 : 0)) {
    x = window.innerWidth - menuWidth - (isScrollY ? 25 : 10)
  }
  if (y + menuHeight > window.innerHeight - (isScrollX ? 25 : 0)) {
    y = window.innerHeight - menuHeight - (isScrollX ? 25 : 10)
  }

  posX.value = x
  posY.value = y
}

function closeAll(): void {
  showBookmark.value = false
  showFolder.value = false
  showBlank.value = false
}

function onGlobalClick(): void {
  closeAll()
}

async function handleDelete(): Promise<void> {
  if (!selectedBookmark.value) return
  await bookmarkStore.deleteBookmark(selectedBookmark.value.id)
  closeAll()
}

async function handleCopyUrl(): Promise<void> {
  if (!selectedBookmark.value?.url) return
  try {
    await navigator.clipboard.writeText(selectedBookmark.value.url)
  } catch {
    console.error('Failed to copy URL')
  }
  closeAll()
}

function handleEdit(): void {
  if (!selectedBookmark.value) return
  const bm = selectedBookmark.value
  uiStore.openEditBookmark(bm.id, bm.url || '', bm.title)
  closeAll()
}

function handleRenameFolder(): void {
  if (!selectedFolder.value) return
  uiStore.openRenameFolder(selectedFolder.value.id, selectedFolder.value.title)
  closeAll()
}

async function handleDeleteFolder(): Promise<void> {
  if (!selectedFolder.value) return
  await bookmarkStore.deleteFolder(selectedFolder.value.id)
  closeAll()
}

function handleAddBookmark(): void {
  uiStore.openEditBookmark('0', '', '')
  closeAll()
}

function handleAddFolder(): void {
  uiStore.openNewFolder()
  closeAll()
}

onMounted(() => {
  document.addEventListener('contextmenu', handleContextMenu)
  document.addEventListener('click', onGlobalClick)
  document.addEventListener('keydown', () => closeAll())
  window.addEventListener('scroll', () => closeAll())
  window.addEventListener('resize', () => closeAll())
})

onUnmounted(() => {
  document.removeEventListener('contextmenu', handleContextMenu)
  document.removeEventListener('click', onGlobalClick)
  document.removeEventListener('keydown', () => closeAll())
  window.removeEventListener('scroll', () => closeAll())
  window.removeEventListener('resize', () => closeAll())
})
</script>

<template>
  <Teleport to="body">
    <div
      v-if="showBookmark"
      class="context-menu"
      :style="{ top: posY + 'px', left: posX + 'px' }"
    >
      <v-list density="compact" class="pa-0" width="224">
        <v-list-item :title="t('copyUrl')" @click="handleCopyUrl">
          <template #prepend>
            <v-icon icon="mdi-content-copy" size="small" />
          </template>
        </v-list-item>
        <v-list-item :title="t('editBookmark')" @click="handleEdit">
          <template #prepend>
            <v-icon icon="mdi-file-edit" size="small" />
          </template>
        </v-list-item>
        <v-list-item :title="t('del')" @click="handleDelete">
          <template #prepend>
            <v-icon icon="mdi-delete" size="small" />
          </template>
        </v-list-item>
      </v-list>
    </div>

    <div
      v-if="showFolder"
      class="context-menu"
      :style="{ top: posY + 'px', left: posX + 'px' }"
    >
      <v-list density="compact" class="pa-0" width="224">
        <v-list-item :title="t('renameFolder')" @click="handleRenameFolder">
          <template #prepend>
            <v-icon icon="mdi-pencil" size="small" />
          </template>
        </v-list-item>
        <v-list-item :title="t('delFolder')" @click="handleDeleteFolder">
          <template #prepend>
            <v-icon icon="mdi-delete" size="small" />
          </template>
        </v-list-item>
      </v-list>
    </div>

    <div
      v-if="showBlank"
      class="context-menu"
      :style="{ top: posY + 'px', left: posX + 'px' }"
    >
      <v-list density="compact" class="pa-0" width="224">
        <v-list-item :title="t('bookmarkAdd')" @click="handleAddBookmark">
          <template #prepend>
            <v-icon icon="mdi-plus" size="small" />
          </template>
        </v-list-item>
        <v-list-item :title="t('newFolder')" @click="handleAddFolder">
          <template #prepend>
            <v-icon icon="mdi-folder-plus" size="small" />
          </template>
        </v-list-item>
      </v-list>
    </div>
  </Teleport>
</template>

<style scoped>
.context-menu {
  position: fixed;
  z-index: 9999;
  background: rgb(var(--v-theme-surface));
  border-radius: 4px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
}
</style>
