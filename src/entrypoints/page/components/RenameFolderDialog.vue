<script setup lang="ts">
import { ref, watch } from 'vue'
import { useBookmarkStore } from '../stores/bookmarkStore'
import { useUIStore } from '../stores/uiStore'
import { useI18n } from '../composables/useI18n'

const { t } = useI18n()
const bookmarkStore = useBookmarkStore()
const uiStore = useUIStore()

const folderName = ref('')
const nameError = ref(false)

watch(() => uiStore.renameFolderDialog, (open) => {
  if (open && uiStore.renameFolderData) {
    folderName.value = uiStore.renameFolderData.title
    nameError.value = false
  }
})

async function save(): Promise<void> {
  if (!folderName.value.trim()) {
    nameError.value = true
    return
  }

  if (!uiStore.renameFolderData) return

  await bookmarkStore.renameFolder(
    uiStore.renameFolderData.id,
    folderName.value.trim()
  )
  uiStore.closeRenameFolder()
}
</script>

<template>
  <v-dialog v-model="uiStore.renameFolderDialog" max-width="400">
    <v-card>
      <v-card-text class="pa-8">
        <v-text-field
          v-model="folderName"
          :placeholder="t('newFolderName')"
          variant="outlined"
          hide-details
          :error="nameError"
          @keydown.enter="save"
        />
        <p v-if="nameError" class="text-red text-caption mt-2">{{ t('folderNameNotEmpty') }}</p>
      </v-card-text>
      <v-card-actions class="justify-center pb-4">
        <v-btn color="green" variant="tonal" @click="save">{{ t('save') }}</v-btn>
        <v-btn class="ml-3" @click="uiStore.closeRenameFolder()">{{ t('cancel') }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
