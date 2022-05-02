<template>
    <p v-if="$fetchState.pending">Fetching reports...</p>
    <div class="pa-6 sketches-wrapper" v-else>
        <UiBreadcrumbs page="sketches" />
        <button class="button--normal" type="button" @click="$fetch">Refresh</button>
        <h2>{{$route.params.jobid}} job</h2>
        <p>Touch or click on a pdf to download it</p>
        <div class="grid grid--default">
            <div class="sketches-wrapper__sketch" v-for="(item, i) in sketches" :key="`sketch-${i}`" @click="pdfClicked(item)">
                <img class="pdf" src="/pdf-icon.png" alt="pdf-icon" />
                <p>{{item.ReportType}}-{{item.Title}}</p>
            </div>
        </div>
        
        <client-only>
            <vue-html2pdf :pdf-quality="2" pdf-content-width="100%" :html-to-pdf-options="htmlToPdfOptions" :enable-download="false"
                          :paginate-elements-by-height="900" :manual-pagination="false" :show-layout="false"
                          @beforeDownload="beforeDownload($event)" :preview-modal="true" ref="html2Pdf0">
                <PdfSketch :reportName="sketch.ReportType" :reportType="sketch.ReportType" :report="sketch"
                           company="Water Emergency Services Incorporated" slot="pdf-content" />
            </vue-html2pdf>
        </client-only>
    </div>
</template>
<script>
import { defineComponent, useContext, computed, ref } from '@nuxtjs/composition-api'
import useSketches from '@/composable/sketches'
import useReports from '@/composable/reports' //Using this just to import beforeDownload for pdf

export default defineComponent({
    setup(props, {refs, root}) {
        const { getSketchesByJobId, sketches } = useSketches()
        const sketch = ref({})
        const { beforeDownload } = useReports()

        const htmlToPdfOptions = computed(() => {
            return {
                margin:[20, 10, 20, 10],
                filename: `${sketch.value.ReportType}-${sketch.value.JobId}`,
                image: {
                    type: "jpeg",
                    quality: 0.95
                },
                html2canvas: {
                    scale: 2,
                    useCORS: true,
                    logging: true,
                    removeContainer: true
                },
                jsPDF: {
                    unit: 'px',
                    format: 'a4',
                    orientation: 'portrait',
                    hotfixes: ['px_scaling']
                }
            }
        })

        function getSketchData(item) {
            return new Promise((resolve, reject) => {
                sketch.value = item
                resolve("got item")
            })
        }
        function pdfClicked(item) {
            getSketchData(item).then(() => {
                refs.html2Pdf0.generatePdf()
            })
        }

        getSketchesByJobId(root.$route.params.jobid)
        return {
            sketches,
            sketch,
            htmlToPdfOptions,
            beforeDownload,
            pdfClicked
        }
    },
})
</script>
<style lang="scss">
.sketches-wrapper {
    &__sketch {
        width:145px;
        cursor:pointer;
        .pdf {
            height:200px;
            object-fit:contain;
        }
    }
}
</style>