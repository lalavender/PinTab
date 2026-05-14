<script setup lang="ts">
import { computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useBookmarkStore } from '../stores/bookmarkStore'
import { useI18n } from '../composables/useI18n'
import { useBookmarkDrag } from '../composables/useBookmarkDrag'
import BookmarkCard from './BookmarkCard.vue'
import FolderCard from './FolderCard.vue'

const emit = defineEmits<{
  bookmarkClick: [url: string]
}>()

const { t } = useI18n()
const bookmarkStore = useBookmarkStore()
const { init: initDrag, cleanup: cleanupDrag } = useBookmarkDrag()

const contents = computed(() => bookmarkStore.displayItems)

function handleBookmarkClick(url: string): void {
  emit('bookmarkClick', url)
}

watch(contents, () => {
  nextTick(() => initDrag())
})

onMounted(() => {
  nextTick(() => initDrag())
})

onUnmounted(() => {
  cleanupDrag()
})
</script>

<template>
  <div v-if="contents.folders.length === 0 && contents.links.length === 0" class="d-flex flex-column justify-center align-center h-100 text-grey">
    <v-icon icon="mdi-inbox-outline" size="80" class="mb-4" color="rgba(128,128,128,0.3)" />
    <h1 class="text-xl font-weight-semibold text-grey mt-6">{{ t('nope') }}</h1>
    <p class="text-grey mt-2">{{ t('searchTips') }}</p>
  </div>

  <template v-else>
    <div
      v-if="contents.folders.length > 0"
      class="bookmark-grid"
      data-grid-type="folders"
      :data-folder-id="bookmarkStore.activeFolderId || ''"
    >
      <div
        v-for="folder in contents.folders"
        :key="folder.id"
        class="grid-card"
        :data-id="folder.id"
        :data-parent-id="folder.parentId"
        data-type="folder"
      >
        <FolderCard :folder="folder" />
      </div>
    </div>

    <v-divider
      v-if="contents.folders.length > 0 && contents.links.length > 0"
      class="my-4"
    />

    <div
      v-if="contents.links.length > 0"
      class="bookmark-grid"
      data-grid-type="bookmarks"
      :data-folder-id="bookmarkStore.activeFolderId || ''"
    >
      <div
        v-for="link in contents.links"
        :key="link.id"
        class="grid-card"
        :data-id="link.id"
        :data-parent-id="link.parentId"
        data-type="link"
      >
        <BookmarkCard
          :bookmark="link"
          @click="handleBookmarkClick"
        />
      </div>
    </div>
  </template>
</template>
