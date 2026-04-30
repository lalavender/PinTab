<script setup lang="ts">
import { onMounted } from "vue";
import type { BookmarkNode } from "../types";
import { useFavicon } from "../composables/useFavicon";

const props = defineProps<{
    bookmark: BookmarkNode;
}>();

const emit = defineEmits<{
    click: [url: string];
}>();

const { iconSrc, loadIcon, onIconError } = useFavicon();

onMounted(() => {
    if (props.bookmark.url) {
        loadIcon(props.bookmark.id, props.bookmark.url);
    }
});
</script>

<template>
    <a
        class="bookmark-link text-decoration-none"
        :href="bookmark.url"
        :data-id="bookmark.id"
        :data-parent-id="bookmark.parentId"
        data-type="link"
        tabindex="0"
        @click.prevent="emit('click', bookmark.url!)"
    >
        <v-card
            variant="outlined"
            class="bento-card pa-3 d-flex align-center h-100"
        >
            <v-avatar size="36" class="mr-3 flex-shrink-0" rounded="lg">
                <v-img
                    :src="iconSrc"
                    :alt="bookmark.title"
                    width="36"
                    height="36"
                    cover
                >
                    <template #error>
                        <v-icon icon="mdi-earth" size="20" />
                    </template>
                </v-img>
            </v-avatar>
            <div class="d-flex flex-column overflow-hidden">
                <h2 class="text-body-2 font-weight-medium text-truncate">
                    {{ bookmark.title }}
                </h2>
                <p class="text-caption text-grey text-truncate">
                    {{ bookmark.url }}
                </p>
            </div>
        </v-card>
    </a>
</template>

<style scoped>
.bookmark-link {
    color: inherit;
    display: block;
    height: 100%;
}
</style>
