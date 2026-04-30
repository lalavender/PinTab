<script setup lang="ts">
import { useUIStore, THEME_LIST } from '../stores/uiStore'
import type { ThemeName } from '../stores/uiStore'
import { useI18n } from '../composables/useI18n'

const { t } = useI18n()
const uiStore = useUIStore()

const model = defineModel<boolean>({ default: false })

function selectTheme(name: ThemeName): void {
  uiStore.setTheme(name)
}
</script>

<template>
  <v-dialog v-model="model" max-width="500">
    <v-card :title="t('set')">
      <v-card-text>
        <!-- Theme Selection -->
        <p class="text-body-2 font-weight-medium mb-3">{{ t('theme') }}</p>
        <div class="d-flex flex-wrap gap-2 mb-6">
          <div
            v-for="th in THEME_LIST"
            :key="th.key"
            class="theme-option"
            :class="{ 'theme-option--active': uiStore.theme === th.key }"
            @click="selectTheme(th.key)"
          >
            <div
              class="theme-option__dot"
              :style="{
                background: th.color,
                border: th.dark ? 'none' : '1px solid #ccc'
              }"
            />
            <span class="text-caption">{{ t('theme_' + th.key) }}</span>
          </div>
        </div>

        <v-divider class="mb-4" />

        <v-switch
          v-model="uiStore.contextMenuDisabled"
          :label="t('setContextMenu')"
          color="primary"
          hide-details
          @update:model-value="uiStore.setContextMenuDisabled(uiStore.contextMenuDisabled)"
        />
        <v-switch
          v-model="uiStore.openInNewTab"
          :label="t('setOpenNewTab')"
          color="primary"
          hide-details
          class="mt-4"
          @update:model-value="uiStore.setOpenInNewTab(uiStore.openInNewTab)"
        />
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn :text="t('cancel')" @click="model = false" />
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.theme-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px 12px;
  border-radius: 12px;
  cursor: pointer;
  transition: background-color 200ms ease;
  min-width: 64px;
}

.theme-option:hover {
  background-color: rgba(128, 128, 128, 0.08);
}

.theme-option--active {
  background-color: rgba(var(--v-theme-primary), 0.12);
}

.theme-option__dot {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  flex-shrink: 0;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.15);
}

.theme-option--active .theme-option__dot {
  outline: 2px solid rgb(var(--v-theme-primary));
  outline-offset: 2px;
}
</style>
