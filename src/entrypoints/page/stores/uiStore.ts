import { defineStore } from 'pinia'
import { ref } from 'vue'

export type ThemeName = 'light' | 'dark' | 'ocean' | 'forest' | 'sunset' | 'lavender'

export const THEME_LIST: { key: ThemeName; icon: string; color: string; dark: boolean }[] = [
  { key: 'light', icon: 'mdi-white-balance-sunny', color: '#FFFFFF', dark: false },
  { key: 'dark', icon: 'mdi-weather-night', color: '#121212', dark: true },
  { key: 'ocean', icon: 'mdi-waves', color: '#0A1929', dark: true },
  { key: 'forest', icon: 'mdi-pine-tree', color: '#0B1A0B', dark: true },
  { key: 'sunset', icon: 'mdi-weather-sunset', color: '#FFF8F0', dark: false },
  { key: 'lavender', icon: 'mdi-flower-tulip', color: '#F5F0FF', dark: false },
]

export const useUIStore = defineStore('ui', () => {
  const theme = ref<ThemeName>('light')
  const sidebarVisible = ref(true)
  const loading = ref(true)
  const toastMessage = ref('')
  const toastVisible = ref(false)
  const contextMenuDisabled = ref(false)
  const openInNewTab = ref(false)
  const editBookmarkDialog = ref(false)
  const editBookmarkData = ref<{ id: string; url: string; title: string } | null>(null)
  const newFolderDialog = ref(false)

  let toastTimer: ReturnType<typeof setTimeout> | null = null

  function applySystemTheme(): void {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    theme.value = prefersDark ? 'dark' : 'light'
  }

  function toggleTheme(): void {
    const isDark = ['dark', 'ocean', 'forest'].includes(theme.value)
    theme.value = isDark ? 'light' : 'dark'
    browser.storage.sync.set({ ThemeName: theme.value })
  }

  function setTheme(name: ThemeName): void {
    theme.value = name
    browser.storage.sync.set({ ThemeName: name })
  }

  function showToast(msg: string, duration = 5000): void {
    toastMessage.value = msg
    toastVisible.value = true
    if (toastTimer) clearTimeout(toastTimer)
    toastTimer = setTimeout(() => {
      toastVisible.value = false
    }, duration)
  }

  function hideToast(): void {
    toastVisible.value = false
  }

  function toggleSidebar(): void {
    sidebarVisible.value = !sidebarVisible.value
    browser.storage.sync.set({ SideNavigationToggle: !sidebarVisible.value })
  }

  async function loadSettings(): Promise<void> {
    return new Promise((resolve) => {
      browser.storage.sync.get(['ContextMenu', 'BookmarkNewTab', 'SideNavigationToggle', 'ThemeName'], (data: any) => {
        contextMenuDisabled.value = data.ContextMenu ?? false
        openInNewTab.value = data.BookmarkNewTab ?? false
        sidebarVisible.value = !(data.SideNavigationToggle ?? false)
        if (data.ThemeName) {
          theme.value = data.ThemeName as ThemeName
        }
        resolve()
      })
    })
  }

  function setContextMenuDisabled(value: boolean): void {
    contextMenuDisabled.value = value
    browser.storage.sync.set({ ContextMenu: value })
  }

  function setOpenInNewTab(value: boolean): void {
    openInNewTab.value = value
    browser.storage.sync.set({ BookmarkNewTab: value })
  }

  function openEditBookmark(id: string, url: string, title: string): void {
    editBookmarkData.value = { id, url, title }
    editBookmarkDialog.value = true
  }

  function closeEditBookmark(): void {
    editBookmarkDialog.value = false
    editBookmarkData.value = null
  }

  function openNewFolder(): void {
    newFolderDialog.value = true
  }

  function closeNewFolder(): void {
    newFolderDialog.value = false
  }

  return {
    theme,
    sidebarVisible,
    loading,
    toastMessage,
    toastVisible,
    contextMenuDisabled,
    openInNewTab,
    editBookmarkDialog,
    editBookmarkData,
    newFolderDialog,
    applySystemTheme,
    toggleTheme,
    setTheme,
    showToast,
    hideToast,
    toggleSidebar,
    loadSettings,
    setContextMenuDisabled,
    setOpenInNewTab,
    openEditBookmark,
    closeEditBookmark,
    openNewFolder,
    closeNewFolder,
  }
})
