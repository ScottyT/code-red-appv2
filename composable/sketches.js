import { ref, useContext, useFetch } from "@nuxtjs/composition-api";

export default function useSketches() {
    let sketches = ref()
    let sketch = ref({})
    let error = ref(false)
    let errorMessage = ref("")
    let loading = ref(false)
    const { $api, $gcs } = useContext()

    function getSketches() {
        loading.value = true
        const { fetch: fetchSketches, fetchState } = useFetch(async () => {
            await $api.$get("/api/sketch").then((res) => {
                loading.value = false
                error.value = false
                sketches.value = res
            }).catch(err => {
                error.value = err
                errorMessage.value = err.response.data
            })
        })

        return { fetchSketches, fetchState }
    }

    function getSketchesByJobId(reportType) {
        loading.value = true
        const { fetch: fetchSketchesByJobId, fetchState } = useFetch(async () => {
            await $api.$get(`/api/sketch/${reportType}`).then((res) => {
                sketches.value = res
            }).catch(err => {
                error.value = err
                errorMessage.value = err.response.data
            })
        })
        return { fetchSketchesByJobId, fetchState }
    }

    return {
        getSketches, sketches, fetch, getSketchesByJobId, loading
    }
}