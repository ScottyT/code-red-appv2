<template>
  <div class="folder-contents-wrapper">
    <h1 v-uppercase>{{currentFolder}}</h1>
    <UiBreadcrumbs page="storage" :darkMode="false" />
    <LazyFolderContents :jobid="repId" :folder="currentFolder" :subPath="this.$route.fullPath" delimiter="/" />
  </div>
</template>
<script>
export default {
  data: () => ({
    files: []
  }),
  async middleware({
    store,
    redirect,
    route
  }) {
    if (store.state.users.user.role !== "admin") {    
      return redirect("/")
    }
  },
  async asyncData({
    params, $axios
  }) {
    const repId = params.slug
    const currentFolder = params.id
    return {
      repId,
      currentFolder
    }
  },
  head() {
    return {
      title: `Report Folder - ${this.repId} Date - ${this.subfolder}`
    }
  }
}
</script>