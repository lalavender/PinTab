<script setup lang="ts">
import { ref, onMounted } from "vue";

const currentYear = ref(new Date().getFullYear());
</script>

<template>
    <v-footer class="mt-auto py-6 px-0" style="background: transparent">
        <v-row justify="space-between" align="center" no-gutters>
            <v-col class="d-flex align-center text-xs text-grey">
                &copy; {{ currentYear }}&nbsp;Built with
                <a
                    class="text-green ml-1 d-flex align-center text-decoration-none"
                    href="https://github.com/tangxiaoqi-tangxiao/PintreeNewTab"
                    target="_blank"
                >
                    <svg
                        class="mr-1"
                        fill="none"
                        height="12"
                        width="10"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <g clip-path="url(#clip0_421_47774)">
                            <path
                                d="M4.27777 9.11133H6.6111V12.0002L5.44444 10.8783L4.27777 12.0002V9.11133Z"
                                fill="#FCB11E"
                            />
                            <path
                                d="M9.05557 5.72222L5.22223 0L1.3889 5.72222H2.68634L0.444458 9.11111H10L7.75813 5.72222H9.05557Z"
                                fill="#2D9C6C"
                            />
                        </g>
                        <defs>
                            <clipPath id="clip0_421_47774">
                                <rect
                                    fill="white"
                                    height="12"
                                    transform="translate(0.444458)"
                                    width="9.55556"
                                />
                            </clipPath>
                        </defs>
                    </svg>
                    <span class="appName_i18n">PintreeNewTab</span>
                </a>
            </v-col>
            <v-col class="d-flex justify-end">
                <a
                    class="text-grey"
                    href="https://github.com/lalavender/PinTab.git"
                    target="_blank"
                >
                    <v-icon icon="mdi-github" size="24" />
                </a>
            </v-col>
        </v-row>
    </v-footer>
</template>
