<template>
    <div class="report-details-wrapper pa-6" slot="pdf-content">
      <section class="pdf-item">
        <div class="pdf-item__company-logo">
          <img src="https://images.prismic.io/water-emergency-services/31b3f2ab-d44e-4f77-8072-faef63fcceb5_WESI+new+Shield+Graphic_800x800.png?auto=compress,format" />
        </div>
        <h1 class="text-center">{{company}}</h1>
        <h2 class="text-center" v-uppercase>{{reportName}}</h2>
        <div class="pdf-item report-details__section">
            <div class="report-details__data">
                Job ID: {{report.JobId}}
            </div>
            <div class="report-details__data report-details__data--row">
                Title of sketch: <p>{{type}} {{title}}</p>
            </div>
        </div>
        
        <div class="pdf-item__sketch-area" :style="'background-image:url('+report.sketch+')'"></div>
        <div class="pdf-item report-details__section">
            <label class="form__label">Notes:</label>
            <p>{{report.notes}}</p>
        </div>
      </section>
    </div>
</template>
<script>
export default {
    props: ['reportName', 'reportType', 'report', 'company'],
    data() {
        return {
            charting: null,
            title: "",
            type: ""
        }
    },
    watch: {
        report(val) {
            var title = val.Title.charAt(0).toUpperCase() + val.Title.slice(1)
            var type = this.reportType.split('-')
            for (var i = 0; i < type.length; i++) {
                type[i] = type[i].charAt(0).toUpperCase() + type[i].substring(1)
            }
            this.title = title
            this.type = type.join(' ')
        }
    },
    methods: {
        decodeBuffer(buf) {
            var buffer = Buffer.from(buf.data)
            var base64string = buffer.toString('base64')
            return base64string
        },
        generateReport(key) {
            this.$refs["html2Pdf-" + key].generatePdf()
        },
    }
}
</script>
<style lang="scss" scoped>
.pdf-item {
    position:relative;
    .text-center {
        text-align:center;
    }
    &__company-logo {
        width:100px;
        
        margin:0 auto;
    }
    &__inline {
        display:inline-block;
    }
    &__sketch-area {
        width:800px;
        height:500px;
        background-size:contain;
    }
}
.pdf-sig {
    
}
.chart-wrapper {
    position:relative;
    width:100%;
    height:490px;
    max-width:719px;
    @include respond(tabletLarge) {
        max-width:943px;
        height:642px;
    }
    &__bg {
        position:absolute;
        top:0;
        left:0;
        object-fit:contain;
    }
}
</style>