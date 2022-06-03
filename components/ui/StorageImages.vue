<template>
<!-- Mainly used for PDF -->
    <section>
        <h3>{{subPath}}</h3>
        <div class="report-details__image" v-for="(image, i) in imageArr" :key="`image-${i}`"><img :src="image.imageUrl" /></div>
    </section>
</template>
<script>
import { defineComponent, onMounted, watch, ref, toRefs, useContext } from '@nuxtjs/composition-api'
export default defineComponent({
    props: {
        subPath: String,
        path: String,
        jobid: String,
        imageArr: Array
    },
    setup(props, { refs }) {
        const { jobid, subPath, path } = toRefs(props)
        const folders = ref({})
        
        return {
            
        }
    },
})
</script>
