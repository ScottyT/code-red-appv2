<template>
  <div class="storage-page">
    <LayoutReportsList :reportslist="storage" :sketchlist="[]" page="storagePage" :darkMode="true" />
  </div>
</template>
<script>
import { defineComponent, onMounted, ref, useContext } from '@nuxtjs/composition-api'
import useReports from '~/composable/reports'

export default defineComponent({
  middlware: ['auth'],
  setup() {
    const { $gcs } = useContext()
    const storage = ref([])

    onMounted(() => {
      $gcs.$get("/list", {
        params: {folder: "", subfolder: "", delimiter: "/"}
      }).then((res) => {
        res.folders.forEach((folder) => {
          storage.value.push({"JobId": folder.name})
        })
      })
    })
    
    return {
      storage
    }
  },
})
</script>
<style lang="scss">
  .storage-page {
    padding: 45px 4vw;
  }
</style>