import { defineStore } from 'pinia'
import { ref } from 'vue'

export type ThemeName = 'light' | 'dark' | 'sakura' | 'midnight' | 'amber' | 'nebula'

export const THEME_LIST: { key: ThemeName; icon: string; color: string; dark: boolean }[] = [
  { key: 'light', icon: 'mdi-white-balance-sunny', color: '#FFFFFF', dark: false },
  { key: 'dark', icon: 'mdi-weather-night', color: '#121212', dark: true },
  { key: 'sakura', icon: 'mdi-flower-poppy', color: '#FFF0F5', dark: false },
  { key: 'midnight', icon: 'mdi-weather-night', color: '#0D0D2B', dark: true },
  { key: 'amber', icon: 'mdi-fire', color: '#FFF8E7', dark: false },
  { key: 'nebula', icon: 'mdi-star-four-points', color: '#0B0B1A', dark: true },
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
  const renameFolderDialog = ref(false)
  const renameFolderData = ref<{ id: string; title: string } | null>(null)

  let toastTimer: ReturnType<typeof setTimeout> | null = null

  function applySystemTheme(): void {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    theme.value = prefersDark ? 'dark' : 'light'
  }

  function toggleTheme(): void {
    const isDark = ['dark', 'midnight', 'nebula'].includes(theme.value)
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
        if (data.ThemeName && THEME_LIST.some(t => t.key === data.ThemeName)) {
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

  function openRenameFolder(id: string, title: string): void {
    renameFolderData.value = { id, title }
    renameFolderDialog.value = true
  }

  function closeRenameFolder(): void {
    renameFolderDialog.value = false
    renameFolderData.value = null
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
    renameFolderDialog,
    renameFolderData,
    openRenameFolder,
    closeRenameFolder,
  }
})
