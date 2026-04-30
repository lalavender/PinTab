export interface BookmarkNode {
  type: 'folder' | 'link'
  id: string
  title: string
  parentId?: string
  index?: number
  addDate?: number
  children?: BookmarkNode[]
  url?: string
}

export type TabType = 'bookmarks' | 'web-search' | 'ai-search'

export interface SearchTabConfig {
  tab: TabType
  currentTab: string
}

export interface IconCacheEntry {
  id: string
  base64: string
}

export interface ChromeBookmarkNode {
  id: string
  title: string
  dateAdded?: number
  children?: ChromeBookmarkNode[]
  parentId?: string
  index?: number
  url?: string
}
