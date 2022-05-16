import { Scatter, mixins } from 'vue-chartjs'

export default {
    extends: Scatter,
    mounted() {
        this.renderScatterChart()
    },
    computed: {
        chartData() {
            return this.chartdata
        }
    },
}