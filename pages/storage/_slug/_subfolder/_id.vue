<template>
    <div class="folder-contents-wrapper">
        <h1>{{currentFolder}}</h1>
        <UiBreadcrumbs page="storage" :darkMode="false" />
        <FolderContents :jobid="repId" :folder="currentFolder" :subPath="$route.fullPath" delimiter="" />
    </div>
</template>
<script>
import { defineComponent, useRoute, computed } from '@nuxtjs/composition-api'

export default defineComponent({
    setup() {
        const route = useRoute()
        const repId = computed(() => route.value.params.slug)
        const currentFolder = computed(() => route.value.params.id)
        const subfolder = computed(() => route.value.params.subfolder)

        return {
            repId, subfolder, currentFolder
        }
    },
})
</script>
