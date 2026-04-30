<script setup lang="ts">
import { computed } from "vue";
import type { BookmarkNode } from "../types";
import { useBookmarkStore } from "../stores/bookmarkStore";
import { findInTree } from "../utils/treeUtils";

const props = defineProps<{
    folder: BookmarkNode;
    depth: number;
}>();

const bookmarkStore = useBookmarkStore();

const isActive = computed(
    () => bookmarkStore.activeFolderId === props.folder.id,
);

const isDescendantActive = computed(() => {
    if (!bookmarkStore.activeFolderId) return false;
    return (
        findInTree(
            props.folder,
            (node) => node.id === bookmarkStore.activeFolderId,
        ) !== null
    );
});

// Only the active branch is open — the active folder itself shows children,
// its ancestors show the path to it. All other branches stay closed.
const isOpen = computed(() => isActive.value || isDescendantActive.value);

function handleClick(): void {
    bookmarkStore.setActiveFolder(props.folder.id);
}
</script>

<template>
    <div
        class="sidebar-folder"
        :style="{ paddingLeft: depth > 0 ? '12px' : '0' }"
    >
        <div
            :class="['sidebar-item', { 'sidebar-item--active': isActive }]"
            @click="handleClick"
        >
            <v-icon
                :icon="isActive ? 'mdi-folder' : 'mdi-folder-outline'"
                :color="isActive ? 'green' : undefined"
                size="18"
                class="sidebar-item__icon"
            />
            <span class="sidebar-item__title">{{ folder.title }}</span>
            <v-icon
                v-if="folder.children && folder.children.length > 0"
                :icon="isOpen ? 'mdi-chevron-down' : 'mdi-chevron-right'"
                size="16"
                class="sidebar-item__chevron"
            />
        </div>
        <div
            v-if="folder.children && folder.children.length > 0"
            v-show="isOpen"
            class="sidebar-children"
        >
            <SidebarItem
                v-for="child in folder.children.filter(
                    (c) => c.type === 'folder',
                )"
                :key="child.id"
                :folder="child"
                :depth="depth + 1"
            />
        </div>
    </div>
</template>

<style scoped>
.sidebar-folder {
    overflow: hidden;
}

.sidebar-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 7px 12px;
    margin-bottom: 2px;
    border-radius: 10px;
    cursor: pointer;
    transition: background-color 200ms ease;
    user-select: none;
}

.sidebar-item:hover {
    background-color: rgba(128, 128, 128, 0.08);
}

.sidebar-item:focus-visible {
    outline: 2px solid #0ba665;
    outline-offset: 0px;
}

.sidebar-item--active {
    background-color: rgba(11, 166, 101, 0.1);
}

.sidebar-item__icon {
    flex-shrink: 0;
}

.sidebar-item__title {
    flex: 1;
    font-size: 13px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    line-height: 1.5;
}

.sidebar-item--active .sidebar-item__title {
    font-weight: 600;
    color: #0ba665;
}

.sidebar-item__chevron {
    flex-shrink: 0;
    opacity: 0.4;
}

.sidebar-children {
    display: flex;
    flex-direction: column;
}
</style>
