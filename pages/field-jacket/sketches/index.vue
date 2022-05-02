<template>
    <p v-if="$fetchState.pending">Fetching reports...</p>
    <div class="pa-6 sketches-wrapper" v-else>
        <button class="button--normal" type="button" @click="$fetch">Refresh</button>
        <LayoutReportsList :sketchlist="sketches" :reportslist="[]" page="sketches" />
    </div>
</template>
<script>
import { defineComponent, onMounted } from '@nuxtjs/composition-api'
import useSketches from '@/composable/sketches'

export default defineComponent({
    setup() {
        const { getSketches, sketches } = useSketches()

        getSketches()
        return {
            sketches,
        }
    },
})
</script>
