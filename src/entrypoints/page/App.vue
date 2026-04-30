<script setup lang="ts">
import { onMounted, watch, ref, computed } from "vue";
import { useBookmarkStore } from "./stores/bookmarkStore";
import { useUIStore, THEME_LIST } from "./stores/uiStore";
import type { ThemeName } from "./stores/uiStore";
import { useSearchStore } from "./stores/searchStore";
import { useTheme } from "vuetify";
import { useI18n } from "./composables/useI18n";
import db from "./utils/indexedDB";
import { dbNames } from "./config";
import ToastNotification from "./components/ToastNotification.vue";
import Sidebar from "./components/Sidebar.vue";
import SearchBar from "./components/SearchBar.vue";
import Breadcrumbs from "./components/Breadcrumbs.vue";
import BookmarkGrid from "./components/BookmarkGrid.vue";
import Footer from "./components/Footer.vue";
import SettingsDialog from "./components/SettingsDialog.vue";
import EditBookmarkDialog from "./components/EditBookmarkDialog.vue";
import NewFolderDialog from "./components/NewFolderDialog.vue";
import ContextMenu from "./components/ContextMenu.vue";

const { t } = useI18n();
const vuetifyTheme = useTheme();
const bookmarkStore = useBookmarkStore();
const uiStore = useUIStore();
const searchStore = useSearchStore();

const settingsDialog = ref(false);
const themeMenu = ref(false);

const currentThemeIcon = computed(() => {
    const found = THEME_LIST.find((th) => th.key === uiStore.theme);
    return found?.icon || "mdi-palette";
});

function selectTheme(name: ThemeName): void {
    uiStore.setTheme(name);
    themeMenu.value = false;
}

watch(
    () => uiStore.theme,
    (newTheme) => {
        vuetifyTheme.global.name.value = newTheme;
    },
    { immediate: true },
);

const prefersDark = window.matchMedia("(prefers-color-scheme: dark)");
prefersDark.addEventListener("change", (event) => {
    // Only auto-switch if user hasn't chosen a custom theme
    if (uiStore.theme === "light" || uiStore.theme === "dark") {
        uiStore.setTheme(event.matches ? "dark" : "light");
    }
});

onMounted(async () => {
    document.title = t("appName");
    uiStore.applySystemTheme();
    await uiStore.loadSettings();
    await searchStore.loadFromStorage();

    try {
        await db.openDB(dbNames);
    } catch (e) {
        console.error("Failed to open IndexedDB:", e);
    }

    try {
        await bookmarkStore.fetchBookmarks();
        bookmarkStore.delIconsCache();
    } catch (e) {
        console.error("Failed to load bookmarks:", e);
    } finally {
        uiStore.loading = false;
    }

    if (bookmarkStore.firstLayer.length > 0) {
        // Restore last active folder from IndexedDB
        try {
            const value = await db.getData<{ data: string }>(
                "SetUp",
                "ActiveId",
            );
            if (value?.data) {
                bookmarkStore.setActiveFolder(value.data);
                return;
            }
        } catch {}
        const firstFolder = bookmarkStore.firstLayer[0];
        if (firstFolder) {
            bookmarkStore.setActiveFolder(firstFolder.id);
        }
    }
});

function handleBookmarkClick(url: string) {
    if (uiStore.openInNewTab) {
        window.open(url, "_blank");
    } else {
        window.open(url, "_self");
    }
}
</script>

<template>
    <v-app>
        <ToastNotification />
        <v-layout>
            <Sidebar />

            <v-main class="overflow-auto">
                <div class="d-flex flex-column" style="min-height: 100vh">
                    <!-- Header Bar -->
                    <div
                        class="d-flex align-center sticky-top h-14 px-4 border-b flex-shrink-0"
                    >
                        <v-btn
                            icon="mdi-menu"
                            variant="text"
                            class="d-none d-lg-flex"
                            @click="uiStore.toggleSidebar()"
                        />
                        <img
                            alt="Pintree"
                            class="pl-2 d-lg-none"
                            height="32"
                            src="/images/logo.svg"
                        />
                        <span
                            class="d-lg-none font-weight-black text-h5 appName_i18n"
                            >{{ t("appName") }}</span
                        >
                        <v-spacer />

                        <!-- Theme Selector Dropdown -->
                        <v-menu
                            v-model="themeMenu"
                            :close-on-content-click="false"
                            location="bottom end"
                        >
                            <template #activator="{ props }">
                                <v-btn
                                    :icon="currentThemeIcon"
                                    variant="text"
                                    v-bind="props"
                                />
                            </template>
                            <v-card min-width="200" class="pa-2">
                                <v-list density="compact" class="pa-0">
                                    <v-list-item
                                        v-for="th in THEME_LIST"
                                        :key="th.key"
                                        :active="uiStore.theme === th.key"
                                        active-color="primary"
                                        rounded="lg"
                                        @click="selectTheme(th.key)"
                                    >
                                        <template #prepend>
                                            <div
                                                class="theme-dot mr-3"
                                                :style="{
                                                    background: th.color,
                                                    border: th.dark
                                                        ? 'none'
                                                        : '1px solid #ccc',
                                                }"
                                            />
                                        </template>
                                        <v-list-item-title class="text-body-2">
                                            {{ t("theme_" + th.key) }}
                                        </v-list-item-title>
                                        <template #append>
                                            <v-icon
                                                v-if="uiStore.theme === th.key"
                                                icon="mdi-check"
                                                size="18"
                                                color="primary"
                                            />
                                        </template>
                                    </v-list-item>
                                </v-list>
                            </v-card>
                        </v-menu>

                        <v-btn
                            icon="mdi-cog"
                            variant="text"
                            class="d-none d-md-inline-flex ml-2"
                            @click="settingsDialog = true"
                        />
                    </div>

                    <div
                        class="flex-grow-1 d-flex flex-column px-6 px-md-12"
                        id="main"
                        :class="{ 'mx-lg-20': !uiStore.sidebarVisible }"
                    >
                        <SearchBar />
                        <div
                            class="mt-4 flex-grow-1 d-flex flex-column"
                            id="main-content"
                        >
                            <div
                                v-if="uiStore.loading"
                                class="d-flex justify-center align-center h-100"
                            >
                                <v-progress-circular
                                    indeterminate
                                    color="primary"
                                />
                            </div>
                            <template v-else>
                                <Breadcrumbs />
                                <BookmarkGrid
                                    @bookmark-click="handleBookmarkClick"
                                />
                            </template>
                        </div>
                        <Footer class="px-0" />
                    </div>
                </div>
            </v-main>
        </v-layout>

        <SettingsDialog v-model="settingsDialog" />
        <EditBookmarkDialog />
        <NewFolderDialog />
        <ContextMenu />
    </v-app>
</template>

<style scoped>
.theme-dot {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    flex-shrink: 0;
}
</style>
