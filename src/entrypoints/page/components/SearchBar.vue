<script setup lang="ts">
import { ref, computed } from 'vue'
import { useSearchStore } from '../stores/searchStore'
import { useBookmarkStore } from '../stores/bookmarkStore'
import { useI18n } from '../composables/useI18n'
import type { TabType, BookmarkNode } from '../types'

const { t } = useI18n()
const searchStore = useSearchStore()
const bookmarkStore = useBookmarkStore()

const searchQuery = ref('')

const tabs: { key: TabType; label: string; icon: string }[] = [
  { key: 'bookmarks', label: 'bookmark', icon: 'mdi-bookmark-outline' },
  { key: 'web-search', label: 'web_search', icon: 'mdi-web' },
  { key: 'ai-search', label: 'ai_search', icon: 'mdi-robot-outline' },
]

const collections: Record<string, string[]> = {
  bookmarks: ['All_bookmarks', 'Current_bookmark'],
  'web-search': ['Google', 'Baidu', 'Bing'],
  'ai-search': ['ChatGPT', 'Perplexity', 'Secret_Tower'],
}

const currentCollections = computed(() => collections[searchStore.activeTab] || [])

function selectTab(tab: TabType): void {
  searchStore.setTab(tab)
  if (collections[tab].length > 0) {
    searchStore.setCollection(collections[tab][0])
  }
  searchStore.saveToStorage()
}

function selectCollection(name: string): void {
  searchStore.setCollection(name)
  searchStore.saveToStorage()
}

function handleSearch(): void {
  const query = searchQuery.value.trim()
  const tab = searchStore.activeTab
  const collection = searchStore.currentCollection

  if (!query) {
    if (tab === 'bookmarks') {
      bookmarkStore.clearSearch()
    }
    return
  }

  if (tab === 'bookmarks') {
    executeBookmarkSearch(query, collection)
  } else {
    executeWebSearch(query, tab, collection)
  }
}

function executeBookmarkSearch(query: string, currentTab: string): void {
  if (currentTab === 'All_bookmarks') {
    bookmarkStore.searchOldFolderId = bookmarkStore.activeFolderId
    const results = searchInTree(bookmarkStore.firstLayer, query.toLowerCase())
    bookmarkStore.activeFolderId = null
    bookmarkStore.breadcrumbs = [{ id: '0', title: t('searchResults'), type: 'folder', children: results }]
  } else if (bookmarkStore.activeFolderId) {
    const folder = bookmarkStore.currentFolder
    if (folder?.children) {
      const results = folder.children.filter(
        c => c.title.toLowerCase().includes(query.toLowerCase())
      )
      bookmarkStore.searchOldFolderId = bookmarkStore.activeFolderId
      bookmarkStore.activeFolderId = null
      bookmarkStore.breadcrumbs = [{ id: '0', title: t('searchResults'), type: 'folder', children: results }]
    }
  }
}

function searchInTree(data: BookmarkNode[], query: string): BookmarkNode[] {
  const results: BookmarkNode[] = []
  data.forEach(item => {
    if (item.title.toLowerCase().includes(query)) {
      results.push(item)
    }
    if (item.children) {
      results.push(...searchInTree(item.children, query))
    }
  })
  return results
}

function executeWebSearch(query: string, tab: TabType, currentTab: string): void {
  const encoded = encodeURIComponent(query)
  let url = ''

  if (tab === 'web-search') {
    switch (currentTab) {
      case 'Google': url = `https://www.google.com/search?q=${encoded}`; break
      case 'Baidu': url = `https://www.baidu.com/s?wd=${encoded}&ie=utf-8`; break
      case 'Bing': url = `https://cn.bing.com/search?q=${encoded}`; break
    }
  } else if (tab === 'ai-search') {
    switch (currentTab) {
      case 'ChatGPT': url = `https://chatgpt.com/?q=${encoded}`; break
      case 'Perplexity': url = `https://www.perplexity.ai/search/new?q=${encoded}&ie=utf-8`; break
      case 'Secret_Tower': url = `https://metaso.cn?q=${encoded}`; break
    }
  }

  if (url) window.open(url, '_blank')
}
</script>

<template>
  <div class="search-wrapper">
    <!-- Tab Segment Control -->
    <div class="d-flex justify-center mb-6">
      <div class="tab-segment">
        <v-btn
          v-for="tab in tabs"
          :key="tab.key"
          :color="searchStore.activeTab === tab.key ? '#0BA665' : undefined"
          :variant="searchStore.activeTab === tab.key ? 'flat' : 'text'"
          :prepend-icon="searchStore.activeTab === tab.key ? tab.icon : undefined"
          rounded="pill"
          size="default"
          class="text-none tab-btn"
          @click="selectTab(tab.key)"
        >
          {{ t(tab.label) }}
        </v-btn>
      </div>
    </div>

    <!-- Search Input -->
    <div class="search-input-wrap mx-auto">
      <v-text-field
        v-model="searchQuery"
        :placeholder="t('search')"
        variant="outlined"
        density="comfortable"
        hide-details
        rounded="pill"
        bg-color="surface"
        class="search-field"
        @keydown.enter="handleSearch"
      >
        <template #prepend-inner>
          <v-icon icon="mdi-magnify" color="grey" class="ml-1" />
        </template>
        <template #append-inner>
          <v-btn
            icon="mdi-arrow-right"
            color="#0BA665"
            size="36"
            variant="flat"
            rounded="circle"
            class="mr-1"
            @click="handleSearch"
          />
        </template>
      </v-text-field>
    </div>

    <!-- Collection Chips -->
    <div class="d-flex justify-center mt-4">
      <div class="chip-segment">
        <v-chip
          v-for="name in currentCollections"
          :key="name"
          :color="searchStore.currentCollection === name ? '#0BA665' : undefined"
          :variant="searchStore.currentCollection === name ? 'flat' : 'text'"
          size="small"
          rounded="pill"
          class="collection-chip"
          @click="selectCollection(name)"
        >
          {{ t(name.toLowerCase()) || name }}
        </v-chip>
      </div>
    </div>
  </div>
</template>

<style scoped>
.search-wrapper {
  padding: 40px 24px 0;
}

.search-input-wrap {
  max-width: 680px;
}

.search-field :deep(.v-field__outline) {
  --v-field-border-opacity: 0.12;
}

/* Tab segment control */
.tab-segment {
  display: inline-flex;
  gap: 4px;
  padding: 4px;
  border-radius: 100px;
  background: rgba(128, 128, 128, 0.06);
}

.tab-btn {
  min-width: 100px;
  font-weight: 500;
  letter-spacing: 0;
  border-radius: 100px;
  transition: all 200ms ease;
}

.tab-btn:hover:not(.v-btn--variant-flat) {
  background: rgba(128, 128, 128, 0.08);
}

/* Chip segment control */
.chip-segment {
  display: inline-flex;
  gap: 4px;
  padding: 4px;
  border-radius: 100px;
  background: rgba(128, 128, 128, 0.06);
}

/* Collection chips */
.collection-chip {
  font-weight: 500;
  letter-spacing: 0;
  cursor: pointer;
  min-width: 80px;
  transition: all 200ms ease;
}

.collection-chip:hover:not(.v-chip--variant-flat) {
  background: rgba(128, 128, 128, 0.08);
}
</style>
