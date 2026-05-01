<script setup lang="ts">
import { useBookmarkStore } from "../stores/bookmarkStore";
import { useUIStore } from "../stores/uiStore";
import SidebarItem from "./SidebarItem.vue";

const bookmarkStore = useBookmarkStore();
const uiStore = useUIStore();
</script>

<template>
    <v-navigation-drawer
        v-model="uiStore.sidebarVisible"
        class="d-none d-lg-flex"
        width="256"
    >
        <div class="d-flex align-center pa-4 h-16">
            <img alt="PinTab" class="pl-2" height="32" src="/icon.svg" />
            <span class="ml-4 font-weight-black text-lg appName_i18n"
                >PinTab</span
            >
        </div>
        <v-divider />
        <div class="flex-1-1 overflow-y-auto pa-2 no-scrollbar">
            <div id="navigation" class="sidebar-tree">
                <SidebarItem
                    v-for="folder in bookmarkStore.firstLayer"
                    :key="folder.id"
                    :folder="folder"
                    :depth="0"
                />
            </div>
        </div>
    </v-navigation-drawer>
</template>
