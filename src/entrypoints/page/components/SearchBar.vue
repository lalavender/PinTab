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
  'ai-search': ['DeepSeek', 'ChatGPT', 'Secret_Tower'],
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
      case 'DeepSeek': url = `https://chat.deepseek.com/chat?q=${encoded}`; break
      case 'ChatGPT': url = `https://chatgpt.com/?q=${encoded}`; break
      case 'Secret_Tower': url = `https://metaso.cn?q=${encoded}`; break
    }
  }

  if (url) window.open(url, '_blank')
}
</script>

<template>
  <div class="search-wrapper">
    <!-- Tab Segment Control -->
    <div class="d-flex justify-center mb-5">
      <div class="tab-segment">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          :class="['tab-btn', { 'tab-btn--active': searchStore.activeTab === tab.key }]"
          @click="selectTab(tab.key)"
        >
          <v-icon :icon="tab.icon" size="18" class="tab-btn__icon" />
          <span>{{ t(tab.label) }}</span>
        </button>
      </div>
    </div>

    <!-- Search Input -->
    <div class="search-input-wrap mx-auto">
      <div class="search-field-container">
        <v-icon icon="mdi-magnify" size="22" class="search-icon" color="grey" />
        <input
          v-model="searchQuery"
          :placeholder="t('search')"
          class="search-input"
          @keydown.enter="handleSearch"
        />
        <button class="search-submit-btn" @click="handleSearch">
          <v-icon icon="mdi-arrow-right" size="20" />
        </button>
      </div>
    </div>

    <!-- Collection Chips -->
    <div class="d-flex justify-center mt-4">
      <div class="chip-segment">
        <button
          v-for="name in currentCollections"
          :key="name"
          :class="['chip-btn', { 'chip-btn--active': searchStore.currentCollection === name }]"
          @click="selectCollection(name)"
        >
          {{ t(name.toLowerCase()) || name }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.search-wrapper {
  padding: 40px 24px 0;
}

.search-input-wrap {
  max-width: 640px;
}

/* ========== Tab Segment ========== */

.tab-segment {
  display: inline-flex;
  gap: 2px;
  padding: 3px;
  border-radius: 12px;
  background: rgba(128, 128, 128, 0.07);
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 16px;
  border: none;
  border-radius: 10px;
  background: transparent;
  color: rgba(128, 128, 128, 0.7);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 250ms ease;
  white-space: nowrap;
}

.tab-btn:hover {
  color: rgba(128, 128, 128, 0.9);
  background: rgba(128, 128, 128, 0.05);
}

.tab-btn--active {
  background: #0BA665;
  color: #fff;
  box-shadow: 0 2px 8px rgba(11, 166, 101, 0.3);
}

.tab-btn--active:hover {
  background: #0a935a;
  color: #fff;
}

.tab-btn__icon {
  transition: transform 200ms ease;
}

.tab-btn--active .tab-btn__icon {
  transform: scale(1.05);
}

/* ========== Search Field ========== */

.search-field-container {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 6px 0 18px;
  border-radius: 16px;
  border: 1.5px solid rgba(128, 128, 128, 0.15);
  background: var(--v-theme-surface);
  transition: all 250ms ease;
}

.search-field-container:focus-within {
  border-color: #0BA665;
  box-shadow: 0 0 0 3px rgba(11, 166, 101, 0.12);
}

.search-icon {
  flex-shrink: 0;
  opacity: 0.5;
}

.search-input {
  flex: 1;
  height: 52px;
  border: none;
  outline: none;
  background: transparent;
  font-size: 15px;
  color: inherit;
  min-width: 0;
}

.search-input::placeholder {
  color: rgba(128, 128, 128, 0.4);
}

.search-submit-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border: none;
  border-radius: 11px;
  background: #0BA665;
  color: #fff;
  cursor: pointer;
  transition: all 200ms ease;
  flex-shrink: 0;
}

.search-submit-btn:hover {
  background: #0a935a;
  transform: scale(1.05);
}

.search-submit-btn:active {
  transform: scale(0.95);
}

/* ========== Chip Segment ========== */

.chip-segment {
  display: inline-flex;
  gap: 3px;
  padding: 3px;
  border-radius: 10px;
  background: rgba(128, 128, 128, 0.05);
}

.chip-btn {
  padding: 4px 14px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: rgba(128, 128, 128, 0.65);
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 200ms ease;
  white-space: nowrap;
}

.chip-btn:hover {
  color: rgba(128, 128, 128, 0.9);
  background: rgba(128, 128, 128, 0.06);
}

.chip-btn--active {
  background: #0BA665;
  color: #fff;
  box-shadow: 0 1px 4px rgba(11, 166, 101, 0.25);
}

.chip-btn--active:hover {
  background: #0a935a;
  color: #fff;
}
</style>
