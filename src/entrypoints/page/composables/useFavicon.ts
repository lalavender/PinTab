import { ref } from 'vue'
import db from '../utils/indexedDB'
import { IconsStr } from '../config'
import { getFaviconURL } from '../utils/faviconUtils'

const empty_svg = '/empty.svg'
const default_svg = '/default-icon.svg'

export function useFavicon() {
  const iconSrc = ref(empty_svg)

  async function loadIcon(bookmarkId: string, url: string): Promise<void> {
    try {
      const cached = await db.getData<{ id: string; base64: string }>(IconsStr, bookmarkId)
      if (cached) {
        iconSrc.value = cached.base64
        return
      }
    } catch {}

    const faviconUrl = getFaviconURL(url)
    iconSrc.value = faviconUrl || default_svg
  }

  function onIconError(): void {
    iconSrc.value = default_svg
  }

  return { iconSrc, loadIcon, onIconError }
}
