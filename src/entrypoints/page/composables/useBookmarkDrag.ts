import { ref, nextTick, onUnmounted } from 'vue'
import Sortable from 'sortablejs'
import { useBookmarkStore } from '../stores/bookmarkStore'
import { useUIStore } from '../stores/uiStore'

export const draggedItemId = ref<string | null>(null)
export const isDroppedOntoFolder = ref(false)

export function useBookmarkDrag() {
  const bookmarkStore = useBookmarkStore()
  const uiStore = useUIStore()
  let sortableInstances: Sortable[] = []

  function handleDragEnd(evt: Sortable.SortableEvent): void {
    if (isDroppedOntoFolder.value) {
      isDroppedOntoFolder.value = false
      draggedItemId.value = null
      return
    }

    draggedItemId.value = null
    const itemId = evt.item.dataset.id
    if (!itemId || !bookmarkStore.activeFolderId) return

    const toGrid = (evt.to as HTMLElement).dataset.gridType
    const fromGrid = (evt.from as HTMLElement).dataset.gridType

    let newIndex: number

    if (toGrid === 'bookmarks') {
      const folderCount = bookmarkStore.displayItems.folders.length
      const offset = fromGrid === 'folders' ? folderCount - 1 : folderCount
      newIndex = evt.newIndex! + offset
    } else {
      newIndex = evt.newIndex!
    }

    const currentChildren = bookmarkStore.currentFolder?.children || []
    const currentIndex = currentChildren.findIndex(c => c.id === itemId)
    if (currentIndex !== -1 && currentIndex < newIndex) {
      newIndex += 1
    }

    bookmarkStore.moveBookmark(itemId, {
      parentId: bookmarkStore.activeFolderId,
      index: newIndex,
    }).catch(() => {
      uiStore.showToast('Failed to move bookmark')
    })
  }

  function init(): void {
    cleanup()

    nextTick(() => {
      const grids = document.querySelectorAll('.bookmark-grid')
      grids.forEach((grid) => {
        if (grid.children.length > 0) {
          sortableInstances.push(new Sortable(grid as HTMLElement, {
            group: { name: 'pintree-bookmarks', pull: true, put: true },
            animation: 150,
            ghostClass: 'sortable-ghost',
            dragClass: 'sortable-drag',
            onStart: (evt) => {
              draggedItemId.value = evt.item.dataset.id || null
            },
            onEnd: handleDragEnd,
            onMove: (evt) => {
              const draggedType = evt.dragged.dataset.type
              const toGrid = evt.to.dataset.gridType
              // Prevent dropping a link as a sibling into the folders grid
              if (draggedType === 'link' && toGrid === 'folders') {
                return false
              }
              // Prevent dropping a folder as a sibling into the links grid
              if (draggedType === 'folder' && toGrid === 'bookmarks') {
                return false
              }
              return true
            },
          }))
        }
      })
    })
  }

  function cleanup(): void {
    sortableInstances.forEach(s => {
      try { s.destroy() } catch (e) { /* ignore */ }
    })
    sortableInstances = []
  }

  onUnmounted(cleanup)

  return { init, cleanup }
}
