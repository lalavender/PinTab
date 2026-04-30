<script setup lang="ts">
import { ref, watch } from 'vue'
import { useBookmarkStore } from '../stores/bookmarkStore'
import { useUIStore } from '../stores/uiStore'
import { useI18n } from '../composables/useI18n'
import { isValidUrl } from '../utils/faviconUtils'
import db from '../utils/indexedDB'
import { IconsStr } from '../config'

const { t } = useI18n()
const bookmarkStore = useBookmarkStore()
const uiStore = useUIStore()

const websiteLink = ref('')
const websiteName = ref('')
const linkError = ref(false)
const linkError2 = ref(false)
const nameError = ref(false)
const imageError = ref(false)
const selectedIconBorder = ref<'default' | 'official' | 'image'>('default')

const previewImage = ref('')
const localPreviewImage = ref('')
const defaultCachedImage = ref('')
const imageInput = ref<HTMLInputElement | null>(null)

let faviconTimer: ReturnType<typeof setTimeout> | null = null

async function fetchOfficialFavicon(url: string): Promise<void> {
  if (!url) {
    previewImage.value = ''
    return
  }
  try {
    const faviconUrl = new URL('/favicon.ico', url).href
    previewImage.value = faviconUrl
  } catch {
    previewImage.value = ''
  }
}

watch(websiteLink, (newUrl) => {
  if (faviconTimer) clearTimeout(faviconTimer)
  faviconTimer = setTimeout(() => {
    if (isValidUrl(newUrl)) {
      fetchOfficialFavicon(newUrl)
    } else {
      previewImage.value = ''
    }
  }, 500)
})

watch(() => uiStore.editBookmarkDialog, (open) => {
  if (open && uiStore.editBookmarkData) {
    const { id, url, title } = uiStore.editBookmarkData
    websiteLink.value = url
    websiteName.value = title
    linkError.value = false
    linkError2.value = false
    nameError.value = false
    imageError.value = false
    previewImage.value = ''
    localPreviewImage.value = ''

    if (id !== '0') {
      db.getData<{ id: string; base64: string }>(IconsStr, id).then((data) => {
        if (data) {
          defaultCachedImage.value = data.base64
          selectedIconBorder.value = 'default'
        } else {
          defaultCachedImage.value = ''
          selectedIconBorder.value = 'official'
        }
      })
    } else {
      defaultCachedImage.value = ''
      selectedIconBorder.value = 'official'
    }
  }
})

function onImageUpload(event: Event): void {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      localPreviewImage.value = e.target?.result as string
    }
    reader.readAsDataURL(file)
  }
  // re-trigger file input
  const input = event.target as HTMLInputElement
  input.value = ''
}

function normalizeUrl(raw: string): string {
  const trimmed = raw.trim()
  if (!trimmed) return ''
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  return 'https://' + trimmed
}

async function save(): Promise<void> {
  const normalizedUrl = normalizeUrl(websiteLink.value)
  websiteLink.value = normalizedUrl

  linkError.value = !websiteLink.value
  linkError2.value = !!websiteLink.value && !isValidUrl(websiteLink.value)
  nameError.value = !websiteName.value

  if (linkError.value || linkError2.value || nameError.value) return

  if (selectedIconBorder.value === 'image' && !localPreviewImage.value) {
    imageError.value = true
    return
  }

  const id = uiStore.editBookmarkData?.id

  if (id === '0') {
    if (!bookmarkStore.activeFolderId) {
      uiStore.showToast('Unable to find active folder')
      return
    }
    const node = await bookmarkStore.createBookmark(
      websiteName.value,
      websiteLink.value,
      bookmarkStore.activeFolderId
    )
    if (node) {
      try { await cacheIcon(node.id) } catch (_) { /* icon cache is non-critical */ }
      uiStore.closeEditBookmark()
    } else {
      uiStore.showToast('Failed to create bookmark')
    }
  } else if (id) {
    await bookmarkStore.updateBookmark(id, {
      title: websiteName.value,
      url: websiteLink.value,
    })
    try { await cacheIcon(id) } catch (_) { /* icon cache is non-critical */ }
    uiStore.closeEditBookmark()
  }
}

async function cacheIcon(bookmarkId: string): Promise<void> {
  let base64: string | null = null
  if (selectedIconBorder.value === 'image') {
    base64 = localPreviewImage.value
  } else if (selectedIconBorder.value === 'official' && previewImage.value) {
    base64 = previewImage.value
  }

  if (base64) {
    const cached = await db.getData<{ id: string; base64: string }>(IconsStr, bookmarkId)
    if (cached) {
      await db.updateData(IconsStr, { base64, id: bookmarkId })
    } else {
      await db.addData(IconsStr, { base64, id: bookmarkId })
    }
  } else if (selectedIconBorder.value === 'official' && !previewImage.value) {
    await db.deleteData(IconsStr, bookmarkId)
  }
}
</script>

<template>
  <v-dialog v-model="uiStore.editBookmarkDialog" max-width="800">
    <v-card>
      <v-card-text class="pa-5">
        <v-row>
          <v-col cols="12" md="6">
            <h2 class="text-h6 mb-4">{{ t('infoEdit') }}</h2>
            <p class="text-grey mb-2">{{ t('IconDescribe') }}</p>

            <label class="d-block mb-1">{{ t('websiteLink') }}</label>
            <v-text-field
              v-model="websiteLink"
              :placeholder="t('websiteLinkPlaceholder')"
              density="compact"
              variant="outlined"
              hide-details
              :error="linkError || linkError2"
            />
            <p v-if="linkError" class="text-red text-caption mt-1">{{ t('websiteLinkError') }}</p>
            <p v-else-if="linkError2" class="text-red text-caption mt-1">{{ t('websiteLinkError') }}</p>

            <label class="d-block mb-1 mt-4">{{ t('websiteName') }}</label>
            <v-text-field
              v-model="websiteName"
              :placeholder="t('websiteNamePlaceholder')"
              density="compact"
              variant="outlined"
              hide-details
              :error="nameError"
            />
            <p v-if="nameError" class="text-red text-caption mt-1">{{ t('websiteNameError') }}</p>
          </v-col>

          <v-col cols="12" md="6">
            <h2 class="text-h6 mb-4">{{ t('iconEdit') }}</h2>
            <label class="d-block mb-1">{{ t('iconChoose') }}</label>
            <div class="d-flex">
              <div class="d-flex flex-column align-center mr-2">
                <v-sheet
                  :class="['cursor-pointer', 'd-flex', 'justify-center', 'align-center', 'w-14', 'h-14', 'rounded-lg']"
                  :border="selectedIconBorder === 'default' ? 'md' : undefined"
                  :color="selectedIconBorder === 'default' ? 'blue-lighten-5' : undefined"
                  @click="selectedIconBorder = 'default'"
                >
                  <img v-if="defaultCachedImage" :src="defaultCachedImage" class="w-100 h-100 rounded-lg" style="object-fit: cover;">
                </v-sheet>
                <span class="text-caption mt-1">{{ t('default') }}</span>
              </div>

              <div class="d-flex flex-column align-center mr-2">
                <v-sheet
                  :class="['cursor-pointer', 'd-flex', 'justify-center', 'align-center', 'w-14', 'h-14', 'rounded-lg']"
                  :border="selectedIconBorder === 'official' ? 'md' : undefined"
                  :color="selectedIconBorder === 'official' ? 'blue-lighten-5' : undefined"
                  @click="selectedIconBorder = 'official'"
                >
                  <img v-if="previewImage" :src="previewImage" class="w-100 h-100 rounded-lg" style="object-fit: cover;">
                  <v-icon v-else icon="mdi-web" size="32" color="grey" />
                </v-sheet>
                <span class="text-caption mt-1">{{ t('official') }}</span>
              </div>

              <div class="d-flex flex-column align-center mr-2">
                <v-sheet
                  :class="['cursor-pointer', 'd-flex', 'justify-center', 'align-center', 'w-14', 'h-14', 'rounded-lg']"
                  :border="selectedIconBorder === 'image' ? 'md' : undefined"
                  :color="selectedIconBorder === 'image' ? 'blue-lighten-5' : undefined"
                  @click="selectedIconBorder = 'image'; imageInput?.click()"
                >
                  <img v-if="localPreviewImage" :src="localPreviewImage" class="w-100 h-100 rounded-lg" style="object-fit: cover;">
                  <v-icon v-else icon="mdi-image-plus" size="32" color="grey" />
                </v-sheet>
                <span class="text-caption mt-1">{{ t('upload') }}</span>
              </div>
            </div>
            <p v-if="imageError" class="text-red text-caption mt-2">{{ t('uploadImage') }}</p>
            <input
              ref="imageInput"
              type="file"
              accept="image/*"
              style="display: none;"
              @change="onImageUpload"
            >
          </v-col>
        </v-row>
      </v-card-text>

      <v-card-actions class="justify-center pb-4">
        <v-btn color="green" variant="tonal" @click="save">{{ t('save') }}</v-btn>
        <v-btn class="ml-3" @click="uiStore.closeEditBookmark()">{{ t('cancel') }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
