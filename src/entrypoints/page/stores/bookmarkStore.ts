import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { BookmarkNode } from '../types'
import * as bookmarkAPI from '../utils/bookmarkAPI'
import { findInTree, deleteFromTree, addToTree, findParentFolders } from '../utils/treeUtils'
import db from '../utils/indexedDB'
import { IconsStr, SetUpStr } from '../config'

export const useBookmarkStore = defineStore('bookmarks', () => {
  const firstLayer = ref<BookmarkNode[]>([])
  const activeFolderId = ref<string | null>(null)
  const searchOldFolderId = ref<string | null>(null)
  const breadcrumbs = ref<BookmarkNode[]>([])

  const currentFolder = computed(() => {
    if (!activeFolderId.value) return null
    return findInTree(firstLayer.value, (node) => node.id === activeFolderId.value)
  })

  const currentFolderContents = computed(() => {
    const folder = currentFolder.value
    if (!folder || !folder.children) return { folders: [] as BookmarkNode[], links: [] as BookmarkNode[] }
    return {
      folders: folder.children.filter(c => c.type === 'folder'),
      links: folder.children.filter(c => c.type === 'link'),
    }
  })

  const isSearching = computed(() => activeFolderId.value === null && searchOldFolderId.value !== null)

  const displayItems = computed(() => {
    if (activeFolderId.value === null && searchOldFolderId.value !== null && breadcrumbs.value.length > 0) {
      const results = breadcrumbs.value[breadcrumbs.value.length - 1]?.children || []
      return {
        folders: results.filter((c: BookmarkNode) => c.type === 'folder'),
        links: results.filter((c: BookmarkNode) => c.type === 'link'),
      }
    }
    return currentFolderContents.value
  })

  async function fetchBookmarks(): Promise<void> {
    const data = await bookmarkAPI.getTree()
    firstLayer.value = data
  }

  function setActiveFolder(id: string): void {
    activeFolderId.value = id
    const path = findParentFolders(firstLayer.value, id)
    const folder = findInTree(firstLayer.value, (node) => node.id === id)
    breadcrumbs.value = path.slice(0, -1).concat(folder ? [folder] : [])
    db.updateData(SetUpStr, { id: 'ActiveId', data: id }).catch(() => {
      db.addData(SetUpStr, { id: 'ActiveId', data: id }).catch(() => {})
    })
  }

  async function moveBookmark(itemId: string, params: { parentId?: string; index?: number }): Promise<void> {
    try {
      await bookmarkAPI.move(itemId, params)
      await fetchBookmarks()
    } catch (e) {
      console.error('Failed to move bookmark:', e)
    }
  }

  async function createBookmark(
    title: string,
    url: string,
    parentId: string
  ): Promise<BookmarkNode | null> {
    try {
      const result = await bookmarkAPI.create({ parentId, title, url })
      const newNode: BookmarkNode = {
        type: 'link',
        id: result.id,
        url: result.url,
        title: result.title,
        parentId: result.parentId,
        addDate: result.dateAdded,
        children: [],
      }
      addToTree(firstLayer.value, (node) => node.id === parentId, newNode)
      return newNode
    } catch (e) {
      console.error('Failed to create bookmark:', e)
      return null
    }
  }

  async function updateBookmark(id: string, changes: { title: string; url: string }): Promise<void> {
    try {
      await bookmarkAPI.update(id, changes)
      findInTree(firstLayer.value, (node) => {
        if (node.id === id) {
          node.title = changes.title
          node.url = changes.url
          return true
        }
        return false
      })
    } catch (e) {
      console.error('Failed to update bookmark:', e)
    }
  }

  async function deleteBookmark(id: string): Promise<void> {
    try {
      await bookmarkAPI.remove(id)
      deleteFromTree(firstLayer.value, (node) => node.id === id)
    } catch (e) {
      console.error('Failed to delete bookmark:', e)
    }
  }

  async function deleteFolder(id: string): Promise<void> {
    try {
      await bookmarkAPI.removeTree(id)
      const deletedFolder = findInTree(firstLayer.value, (node) => node.id === id)
      const parentId = deletedFolder?.parentId
      deleteFromTree(firstLayer.value, (node) => node.id === id)
      if (activeFolderId.value === id) {
        if (parentId) {
          setActiveFolder(parentId)
        } else if (firstLayer.value.length > 0) {
          setActiveFolder(firstLayer.value[0].id)
        } else {
          activeFolderId.value = null
        }
      }
    } catch (e) {
      console.error('Failed to delete folder:', e)
    }
  }

  async function renameFolder(id: string, title: string): Promise<void> {
    try {
      await bookmarkAPI.update(id, { title })
      findInTree(firstLayer.value, (node) => {
        if (node.id === id) {
          node.title = title
          return true
        }
        return false
      })
    } catch (e) {
      console.error('Failed to rename folder:', e)
    }
  }

  async function createFolderItem(title: string, parentId: string): Promise<BookmarkNode | null> {
    try {
      const result = await bookmarkAPI.create({ parentId, title })
      const newNode: BookmarkNode = {
        type: 'folder',
        id: result.id,
        title: result.title,
        parentId: result.parentId,
        addDate: result.dateAdded,
        children: [],
      }
      addToTree(firstLayer.value, (node) => node.id === parentId, newNode)
      return newNode
    } catch (e) {
      console.error('Failed to create folder:', e)
      return null
    }
  }

  function clearSearch(): void {
    if (searchOldFolderId.value) {
      activeFolderId.value = searchOldFolderId.value
      setActiveFolder(searchOldFolderId.value)
      searchOldFolderId.value = null
    }
  }

  async function delIconsCache(): Promise<void> {
    const datas = await bookmarkAPI.getTree()
    const arrId: string[] = []
    const getArrId = (node: any) => {
      if (Array.isArray(node)) {
        for (const item of node) getArrId(item)
      } else {
        arrId.push(node.id)
        if (node.children?.length > 0) {
          for (const child of node.children) getArrId(child)
        }
      }
    }
    getArrId(datas)

    return new Promise((resolve) => {
      db.getCursor(IconsStr, (data: any) => {
        if (!arrId.includes(data.id)) {
          db.deleteData(IconsStr, data.id)
        }
      }, () => {
        resolve()
      })
    })
  }

  return {
    firstLayer,
    activeFolderId,
    searchOldFolderId,
    breadcrumbs,
    currentFolder,
    currentFolderContents,
    displayItems,
    isSearching,
    fetchBookmarks,
    setActiveFolder,
    moveBookmark,
    createBookmark,
    updateBookmark,
    deleteBookmark,
    deleteFolder,
    createFolderItem,
    renameFolder,
    clearSearch,
    delIconsCache,
  }
})
