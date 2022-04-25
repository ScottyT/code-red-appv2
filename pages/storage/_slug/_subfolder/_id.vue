<template>
    <div class="folder-contents-wrapper">
        <h1>{{currentFolder}}</h1>
        <UiBreadcrumbs page="storage" />
        <FolderContents :jobid="repId" :path="subfolder" :subPath="currentFolder" delimiter="" />
    </div>
</template>
<script>

export default {
    setup() {
        const route = useRoute()
        const repId = computed(() => route.params.slug)
        const currentFolder = computed(() => route.params.id)
        const subfolder = computed(() => route.params.subfolder)

        return {
            repId, subfolder, currentFolder
        }
    },
}
</script>
