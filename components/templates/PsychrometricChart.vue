<template>
    <div class="chart__container">
        <scatter-chart class="chart__scatter" v-if="!loading" :chartdata="chartData" :options="options" :width="width" :height="height" />
        <div class="d-flex chart__bottom" v-if="!pdf && dataLoaded">
            <button class="button--normal" v-show="dayOfJob !== undefined" @click="addData(dayOfJob)">Create Chart</button>
            <ValidationProvider v-show="!multipleCharts" vid="Chart type" name="Chart type" rules="required" class="form__input-group form__input-group--normal">
                <input type="hidden" v-model="readingsType" />
                <label class="form__label">Readings type: </label>
                <i class="form__select--icon icon--angle-down mdi" aria-label="icon"></i>
                <select class="form__input" v-model="readingsType">
                    <option disabled value="">Please select an area </option>
                    <option>Affected</option>
                    <option>Unaffected</option>
                    <option>Exterior</option>
                </select>
            </ValidationProvider>
        </div>
        
    </div>
</template>
<script>
import { computed, defineComponent, inject, onMounted, ref, toRefs, watch } from "@nuxtjs/composition-api";
import genericFuncs from '@/composable/utilityFunctions'
import useReports from '@/composable/reports'
export default defineComponent({
    props: {
        xaxes: String,
        yaxes: String,
        existingChart: Array,
        dayOfJob: String,
        jobid: String,
        width: Number,
        height: Number,
        dataLoaded: Boolean,
        multipleCharts: Boolean,
        report: Object,
        pdf: Boolean
    },
    setup(props, {root, emit}) {
        const { xaxes, yaxes, existingChart, multipleCharts, jobid, dayOfJob, dataLoaded, report, height, pdf } = toRefs(props)
        let jobId = root.$route.params.slug
        const buttonDisabled = ref(false)
        const { getRandomUnique, groupByKey } = genericFuncs()
        const chartData = ref([])
        const colors = ref(['#157f27', '#900C3F', '#0A9C8F', '#FF5733', '#EB1F28', '#343434', '#C70039'])
        const loaded = ref(false)
        const loading = ref(false)
        const chartHeight = ref(0)
        const tempData = ref({})
        const readingsType = ref("")
        const readingsGroup = ref({})
        const options = ref({
            title: {
                display: true,
                text: "",
                fontSize: 30
            },
            scales: {
                xAxes: [{
                    display:true,
                    scaleLabel: {
                        display: true,
                        labelString: 'Dry Bulb Temperature in Fahrenheit',
                        fontColor: '#181818',
                        fontSize: 14,
                        fontFamily: "'Roboto', sans-serif"
                    },
                    suggestedMin: 20,
                    suggestedMax: 120,
                    ticks: {
                        min:20,
                        max: 120,
                        stepSize: 5
                    },
                    gridLines: {
                        color: 'rgba(0, 0, 0, 1)'
                    }
                }],
                yAxes: [{
                    display:true,
                    id: 'humidityRatio',
                    scaleLabel: {
                        display:true,
                        labelString: 'Humidity Ratio - Grains of Moisture Per Pound of Dry Air (GGP)',
                        fontColor: '#181818',
                        fontSize: 14,
                        fontFamily: "'Roboto', sans-serif"
                    },
                    
                    type: 'linear',
                    ticks: {
                        suggestedMin: 0,
                        suggestedMax: 210,
                        stepSize: 10
                    },
                    gridLines: {
                        color: 'rgba(0, 0, 0, 1)'
                    },
                    position: 'right'
                }, {
                    display:true,
                    id: 'vaporPressure',
                    type: 'linear',
                    position:'left',
                    scaleLabel: {
                        display: true,
                        labelString: 'Vapor Pressure - Inches of Mercury',
                        fontColor: '#181818',
                        fontSize: 14,
                        fontFamily: "'Roboto', sans-serif"
                    },
                    ticks: {
                        suggestedMin: 0,
                        suggestedMax: 1.4,
                        stepSize: .1
                    },
                    
                }]
            },
            responsive: true,
            maintainAspectRatio: false
        })
        const { getReportPromise } = useReports()
        const getExistingChart = async (jobid) => {
            
            await getReportPromise(`psychrometric-chart/${jobid}`).then((result) => {
                if (result.error) {
                    return
                }
                loading.value = true
                setTimeout(() => {
                    loading.value = false
                }, 10)
                var tempArr = []
                for (var i = 0; i < result.jobProgress.length; i++) {
                    var data = {
                        x: result.jobProgress[i].info.dryBulbTemp,
                        y: result.jobProgress[i].info.humidityRatio
                    }
                    var dataset = {
                        readingsType: result.jobProgress[i].readingsType,
                        pointRadius: 5,
                        data: [data],
                        label: result.jobProgress[i].date,
                        backgroundColor: result.jobProgress[i].color
                    }
                    tempArr.push(dataset)
                    chartData.value.push(dataset)
                }
                readingsGroup.value = groupByKey(tempArr, 'readingsType')
                emit('existingChart', chartData.value)
            })
        }
        function populateData(v) {
            loading.value = true
            setTimeout(() => {
                loading.value = false
            }, 10)
            var tempArr = []
            chartData.value = []
            for (var i = 0; i < v.jobProgress.length; i++) {
                var data = {
                    x: v.jobProgress[i].info.dryBulbTemp,
                    y: v.jobProgress[i].info.humidityRatio
                }
                var dataset = {
                    readingsType: v.jobProgress[i].readingsType,
                    pointRadius: 5,
                    data: [data],
                    label: v.jobProgress[i].date,
                    backgroundColor: v.jobProgress[i].color
                }
                tempArr.push(dataset)
                chartData.value.push(dataset)
            }
        }
        function addData(label) {
            loading.value = true
            setTimeout(() => {
                loading.value = false
            }, 10)
            var newData = {
                x: parseInt(xaxes.value),
                y: parseFloat(yaxes.value)
            }
            var existingDotColor = existingChart.value.map((e) => { return e.backgroundColor })
            var dotColor = getRandomUnique(existingChart.value, existingDotColor, colors.value)
            var dataset = { pointRadius: 5, data: [newData], readingsType: readingsType.value, label: label, backgroundColor: dotColor };
            if (chartData.value !== undefined) {
                chartData.value.forEach((item, i) => {
                    var dataIndex = chartData.value.findIndex(el => el.label === dayOfJob.value)
                    if (dataIndex > -1) {
                        chartData.value[dataIndex] = dataset
                    } else {
                        chartData.value.push(dataset)
                    }
                })
            } else {
                chartData.value = []
                chartData.value.push(dataset)
            }
            
            /* if (chartData.value.length === 1) {  // Object.keys(tempData.value).length === 0            
                chartData.value[0] = dataset
            } else {
                chartData.value.pop()
                chartData.value.push(dataset)
            } */
            emit('addData', {data: newData, date: label, title: readingsType.value, color: dataset.backgroundColor})
            buttonDisabled.value = true
            tempData.value = dataset
            /* if (chartData.value.length === 0) {
                chartData.value.push(dataset)
            } */
        }

        watch(() => jobid.value, (val) => {
            if (!pdf.value) {
                getExistingChart(val)
            }
        })
        watch(readingsType, (val) => {
            loading.value = true
            setTimeout(() => {
                loading.value = false
            }, 10)
            options.value.title.text = val
            emit("sendChartType", val)
            chartData.value = readingsGroup.value[val]
        })
        
        if (multipleCharts.value) {
            chartData.value = existingChart.value
        }

        return { 
            chartData, options, loaded, loading, addData, tempData, buttonDisabled, readingsType, readingsGroup, chartHeight
        }
    }
})
</script>
<style lang="scss" scoped>
.chart {
    position:relative;
    background-color:$color-white;
    padding:35px;

    &__image {
        max-width:860px;
        width:100%;
        position:absolute;
        left:50%;
        transform:translateX(-50%);
        height:600px;
    }

    &__scatter {
        max-width:860px;
        @include respond(mobileLargeMax) {
            height: 450px;
        }
        &--thin {
            width:100px;
            max-height:636px;
            top:23px;
        }
    }

    &__label {
        position:absolute;
        top:-5px;
        left:50%;
        transform:translateX(-50%);
        color:$color-black;
        font-size:14px;
    }
    
    &__bottom {
        position:relative;
        button {
            height:50px;
        }
    }

    &__calculations {
        display:flex;
        flex-wrap:wrap;
        justify-content:space-around;
    }
}

.pdf-item {
    .chart__scatter {
        max-width:700px;
    }
}
</style>