<template>
    <div class="pdf-content" slot="pdf-content">
        <h1 class="text-center">{{company}}</h1>
        <h2 class="text-center" v-uppercase>{{reportName}}</h2>
        <div class="report-details__section">
            <div class="report-details__data">
                <label>Job ID:</label>
                <span>{{report.JobId}}</span>
            </div>
            <div class="report-details__data">
                <label>Initial Eval Date: </label>
                <span>{{report.initialEvalDate}}</span>
            </div>
            <div class="report-details__data">
                <label>Notes: </label>
                <div class="pdf-item__textbox">{{report.notes}}</div>
            </div>
        </div>
        <div class="moisture-data__sub-area" v-for="(subarea, i) in report.readingsRow" :key="`sub-${i}`">
            <div class="moisture-data__heading">
                <h4>Sub Area-{{i + 1}}</h4>
                <p>{{subarea.areaName}}</p>
            </div>
            <div class="moisture-data__sub-area--rows">
                <div class="moisture-data__sub-area--cols">
                    <div>Date</div>
                </div>
                <div class="moisture-data__sub-area--cols" v-for="(item, j) in subarea.areaCols" :key="j">
                    <label class="form__label">Area {{item}}</label>
                </div>
            </div>
            <div class="moisture-data__sub-area--rows" v-for="(row, j) in subarea.areas" :key="`row-${j}`">
                <div class="moisture-data__sub-area--cols">
                    <div>{{row.date}}</div>
                </div>
                <div class="moisture-data__sub-area--cols" v-for="(col, c) in row.area" :key="`col-${c}`">
                    <span class="number-input">{{col.val}}%</span>
                </div>
            </div>
        </div>
        <LazyLayoutMoistureCompare :width="700" :height="500" :chartLoaded="loaded" onPdf :jobid="report.JobId" :existingChart="baseline" class="chart__moisture-map" />
        <div class="report-details__section--pictures">
            <div class="report-details__image" v-for="(image, i) in images" :key="`image-${i}`">
                <img :src="image.url" />
            </div>
        </div>
    </div>
</template>
<script>
import { defineComponent, onMounted, toRefs, ref, watch, useContext } from '@nuxtjs/composition-api'

export default defineComponent({
    props: {
        company: String,
        reportName: String,
        report: Object,
        pdf: {
            type: Boolean
        },
        loaded: Boolean
    },
    setup(props, { root }) {
        const { report, pdf } = toRefs(props)
        const { $gcs } = useContext()
        const baseline = ref([])
        const images = ref([])

        function loadedReport() {
            baseline.value = []
            report.value.baselineReadings.forEach((item) => {
                baseline.value.push(item)
            })
        }
        function loadImages(jobid, folder, subfolder, delimiter) {
            return new Promise((resolve, reject) => {
                $gcs.$get(`/list/${jobid}`, {
                    params: {
                        folder: folder,
                        subfolder: folder + "/" + subfolder,
                        delimiter: delimiter,
                        bucket: "default"
                    }
                }).then((res) => {
                    resolve(res)
                }).catch(err => {
                    reject(err)
                })
            })
        }
        watch(() => report.value, (val) => {
            loadedReport()
            loadImages(val.JobId, "moisture-images", "", "/").then((result) => {
                images.value = result.images
            }).catch(err => {
                images.value = []
            })
        })
        onMounted(() => {
            if (pdf.value) {
                loadedReport()
            }
        })
        
        return {
            images, baseline
        }
    },
})
</script>
<style lang="scss" scoped>
.chart {
    &__moisture-map {
        width:700px;
        height:500px;
    }
}
.moisture-data {
    &__heading {
        display:flex;
        flex-direction:column;
        padding-bottom:10px;
    }
    &__sub-area {
        display:flex;
        padding:10px 0 25px;
        flex-direction:column;
        &--rows {
            display:inline-flex;
        }
        &--cols {
            width:60px;
            &:first-child {
                width:100px;
            }
        }
    }
    &__image {
        width:400px;
        height:300px;
        display:block;
        position:relative;
        img {
            object-fit:contain;
        }
    }
}

</style>