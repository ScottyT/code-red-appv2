<template>
    <div class="pdf-content" slot="pdf-content">
        <h1 class="text-center">Psychrometric Chart for {{report.JobId}}</h1>
        <!-- <LazyLayoutPsychrometricChart :width="700" :jobid="report.JobId" multipleCharts :dataLoaded="chartLoaded" :existingChart="sameTypes['Affected']" :height="500" 
            :buttonDisabled="true" class="chart__psychrometric" :report="report" pdf /> -->
        <section class="pdf-item" v-for="(chart, key) in groupByKey(newchartdata, 'readingsType')" :key="key">            
            <h3>{{key}}</h3>
            <LazyLayoutPsychrometricChart :width="700" :jobid="report.JobId" multipleCharts :dataLoaded="chartLoaded" :existingChart="chart" :height="500" 
                :buttonDisabled="true" class="chart__psychrometric" :report="report" pdf  />
            <div class="pdf-item__calculations">
                <div class="chart-inputs__calculations" v-for="(data, i) in chart" :key="`data-${i}`">
                    <h4 class="pl-2 pt-1">{{data.label}}</h4>
                    <div class="chart-inputs__calculations-row">
                        <div class="chart-inputs__calculations-col">Temperature</div>
                        <div class="chart-inputs__temp">{{data && data.info ? data.info.dryBulbTemp : null}}&deg;F</div>
                    </div>
                    <div class="chart-inputs__calculations-row">
                        <div class="chart-inputs__calculations-col">Humidity Ratio</div>
                        <div class="chart-inputs__temp">{{data && data.info ? data.info.humidityRatio : null}}</div>
                    </div>
                    <div class="chart-inputs__calculations-row">
                        <div class="chart-inputs__calculations-col">Relative humidity</div>
                        <div class="chart-inputs__calculations-col">{{data && data.info ? data.info.relativeHumidity : null}}</div>
                    </div>
                    <div class="chart-inputs__calculations-row">
                        <div class="chart-inputs__calculations-col">Dew Point</div>
                        <div class="chart-inputs__calculations-col">{{data && data.info ? data.info.dewPoint : null}}&deg;F</div>
                    </div>
                </div>
            </div>
        </section>
    </div>
</template>
<script>
import { defineComponent, toRefs, ref, computed, provide, onMounted, inject, watch } from '@nuxtjs/composition-api'
import genericFuncs from '@/composable/utilityFunctions'
import useReports from '@/composable/reports'
export default defineComponent({
    props: {
        report: Object,
        chartLoaded: Boolean,
        pdf: Boolean,
        height: Number
    },
    setup(props) {
        const { chartLoaded, report, pdf } = toRefs(props)
        const newchartdata = ref([])
        const loaded = ref(false)
        const existingdata = ref({})
        const { getReportPromise } = useReports()
        const { groupByKey } = genericFuncs()
        const sameTypes = ref({})
        const getSubmittedReport = async (data) => {
            await getReportPromise(`psychrometric-chart/${data.JobId}`).then((result) => {
                existingdata.value = result
                refactorChartData(result)
            })
        }
        const refactorChartData = (r) => {
            sameTypes.value = {}
            console.log(r)
            var progressArr = []
            for (const key in r) {
                r[key].forEach((item, i) => {
                    var data = {
                        x: item.info.dryBulbTemp,
                        y: item.info.humidityRatio
                    }
                    var dataset = {
                        readingsType: item.readingsType,
                        pointRadius: 5,
                        data: [data],
                        label: item.date,
                        backgroundColor: item.color,
                        info: item.info
                    }
                    newchartdata.value.push(dataset)
                    
                })
            }
            
            
            /* r.jobProgress.forEach((item, i) => {
                var data = {
                    x: item.info.dryBulbTemp,
                    y: item.info.humidityRatio
                }
                var dataset = {
                    readingsType: item.readingsType,
                    pointRadius: 5,
                    data: [data],
                    label: item.date,
                    backgroundColor: item.color,
                    info: item.info
                }
                
                if (!Array.isArray(report.value.jobProgress) && Object.keys(existingdata.value).length > 0) {
                    data = {
                        x: report.value.jobProgress.info.dryBulbTemp,
                        y: report.value.jobProgress.info.humidityRatio
                    }
                    dataset = {
                        readingsType: report.value.jobProgress.readingsType,
                        pointRadius: 5,
                        data: [data],
                        label: report.value.jobProgress.date,
                        backgroundColor: report.value.jobProgress.color,
                        info: report.value.jobProgress.info
                    }
                }
                progressArr.push(dataset)
                newchartdata.value.push(dataset)
            }) */
            
           // sameTypes.value = test
            loaded.value = true
        }
        watch(() => chartLoaded.value, (val) => {
            //getSubmittedReport(report.value)
        })
        watch(() => report.value, (val) => {
            
            console.log("report changed on Chart.vue")
            
        })
        onMounted(() => {
            console.log("mounted")
            console.log(report.value)
            var groupedReports = groupByKey(report.value.jobProgress, 'readingsType')
            refactorChartData(groupedReports)
            if (pdf.value) {
                /* var test = groupByKey(report.value.jobProgress, 'readingsType')
                refactorChartData(test) */
                //getSubmittedReport(report.value)
            }
        })
        return {
            loaded,
            newchartdata,
            sameTypes,
            existingdata,
            groupByKey
        }
    },
})
</script>
<style lang="scss">

.chart-inputs {
    display:flex;
    justify-content: space-between;
    flex-wrap:wrap;
    @include respond(tabletLargeMax) {
        flex-direction:column;
    }

    &__input {
        input[type=number] {
            padding:3px;
            text-align:right;
            box-shadow:0px 0px 3px 2px rgba(0, 0, 0, .25);
        }
    }

    &__col {
        display:flex;
    }

    &__temp {
        font-size:1em;
        &--number {
            font-size:1.3em;
            font-weight:bold;
            width:40px;
            text-align:right;
            padding-right:4px;
        }
        &--humidity {
            font-size:1.3em;
            font-weight:bold;
            width:54px;
            text-align:right;
            padding-right:4px;
        }
    }
}
.pdf-item {
    width:750px;
    .chart-inputs__calculations {
        display:grid;
        grid-template-rows:1fr 1fr 1fr 1fr;
        margin:5px 0;
        max-width:330px;
        width:100%;
        border-radius:4px;
        box-shadow:2px 4px 36px 3px rgba(0, 0, 0, 20%);
    }
    .chart-inputs__calculations-row {
        display:flex;
        flex-direction:row;
        padding:7px 18px;
        justify-content:space-between;
        align-items:center;
        &:not(:last-child) {
            border-bottom:1px solid $color-black;
        }
    }
    &__calculations {
        display:flex;
        flex-wrap:wrap;
        justify-content:space-around;
    }
}
</style>