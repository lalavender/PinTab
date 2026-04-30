import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { TabType, SearchTabConfig } from '../types'

export const useSearchStore = defineStore('search', () => {
  const query = ref('')
  const activeTab = ref<TabType>('bookmarks')
  const currentCollection = ref('All_bookmarks')

  function setTab(tab: TabType): void {
    activeTab.value = tab
  }

  function setCollection(name: string): void {
    currentCollection.value = name
  }

  function saveToStorage(): void {
    const data: SearchTabConfig = {
      tab: activeTab.value,
      currentTab: currentCollection.value,
    }
    browser.storage.sync.set({ SearchTab: data })
  }

  async function loadFromStorage(): Promise<void> {
    return new Promise((resolve) => {
      browser.storage.sync.get('SearchTab', (data: any) => {
        if (data.SearchTab) {
          activeTab.value = data.SearchTab.tab
          currentCollection.value = data.SearchTab.currentTab
        }
        resolve()
      })
    })
  }

  return {
    query,
    activeTab,
    currentCollection,
    setTab,
    setCollection,
    saveToStorage,
    loadFromStorage,
  }
})
