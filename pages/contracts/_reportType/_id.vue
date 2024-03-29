<template>
    <div class="report-details-wrapper pt-5">
        
        <div><UiBreadcrumbs page="contract-page" :displayStrip="false" /></div>
        
        <span><div v-uppercase>{{reportType}}</div>Job ID: {{jobid}}</span>
        
        <LazyHydrate v-if="reportType.includes('aob')">
            <client-only>
                <vue-html2pdf :pdf-quality="2" pdf-content-width="100%" :html-to-pdf-options="htmlToPdfOptions"
                    @beforeDownload="beforeDownload($event)" @hasDownloaded="hasDownloaded($event)" :manual-pagination="true"
                    :show-layout="false" :enable-download="false" :preview-modal="true" :paginate-elements-by-height="10500" :ref="`html2Pdf0`">
                    <PdfAobContract slot="pdf-content" :jobid="jobid" :reportType="reportType" :contracts="report" 
                        :company="report.contractingCompany" :abbreviation="report.companyAbbreviation" :images="cardsImages" />
                </vue-html2pdf>
            </client-only>
        </LazyHydrate>
        <LazyHydrate v-if="reportType.includes('coc')">
            <client-only>
                <vue-html2pdf :pdf-quality="2" pdf-content-width="100%" :html-to-pdf-options="htmlToPdfOptions"
                              :paginate-elements-by-height="900" :manual-pagination="false" :show-layout="false"
                              :enable-download="false" @beforeDownload="beforeDownload($event)"
                              @hasDownloaded="hasDownloaded($event)" :preview-modal="true"
                              :ref="`html2Pdf0`">
                    <PdfCertificateContent :jobid="jobid" :company="report.contractingCompany" :abbreviation="report.companyAbbreviation" :reportType="reportType" 
                        slot="pdf-content" :certificate="report" :cardsImages="cardsImages" />
                </vue-html2pdf>
            </client-only>
        </LazyHydrate>
        <LazyHydrate v-if="reportType.includes('contracting-agreement')">
            <client-only>
                <vue-html2pdf :pdf-quality="2" pdf-content-width="100%" :html-to-pdf-options="htmlToPdfOptions"
                    @beforeDownload="beforeDownload($event)" @hasDownloaded="hasDownloaded($event)" :manual-pagination="false"
                    :show-layout="false" :enable-download="false" :preview-modal="true" :paginate-elements-by-height="900" :ref="`html2Pdf0`">
                    <PdfContractService :jobid="jobid" :reportType="reportType" slot="pdf-content" :company="report.contractingCompany" 
                        :abbreviation="report.companyAbbreviation" :report="report" />
                </vue-html2pdf>
            </client-only>
        </LazyHydrate>
        <LazyHydrate v-if="reportType.includes('scope-of-work')">
            <client-only>
                <vue-html2pdf :pdf-quality="2" pdf-content-width="100%" :html-to-pdf-options="htmlToPdfOptions"
                    @beforeDownload="beforeDownload($event)" @hasDownloaded="hasDownloaded($event)" :manual-pagination="false"
                    :show-layout="false" :enable-download="false" :preview-modal="true" :paginate-elements-by-height="700" :ref="`html2Pdf0`">
                    <PdfScopeOfWork :jobid="jobid" :reportType="reportType" :report="report" slot="pdf-content" />
                </vue-html2pdf>
            </client-only>
        </LazyHydrate>
        <v-btn :loading="clickedOn === 0" @click="generateReport(0)">Download PDF</v-btn>
        <!-- <span v-if="report.formType === 'coc'">
            <h2>{{report.contractingCompany}}</h2>
            <span>Certificate of Completion Job ID: {{report.JobId}}</span>
            <client-only>
                <vue-html2pdf :pdf-quality="2" pdf-content-width="100%" :html-to-pdf-options="htmlToPdfOptions" :paginate-elements-by-height="1100" :manual-pagination="false"
                     :show-layout="false" :enable-download="false" @beforeDownload="beforeDownload($event)" @hasDownloaded="hasDownloaded($event)" :preview-modal="true" 
                     :ref="`${reportType}-${jobid}-html2pdf`">
                    <PdfCertificateContent :certificate="report" :company="report.contractingCompany" :abbreviation="report.ReportType === 'wesi-coc'?'WESI':'GUARD'"  
                        slot="pdf-content" />
                </vue-html2pdf>
            </client-only>
            <v-btn :loading="clickedOn === jobid" @click="generateReport">Download PDF</v-btn>
        </span> -->
    </div>
</template>
<script>
import LazyHydrate from 'vue-lazy-hydration'
import { defineComponent, ref, computed, onMounted, useContext, watch } from '@nuxtjs/composition-api'
import useReports from '@/composable/reports';

export default defineComponent({
    components: {
        LazyHydrate
    },
    setup(props, { root, refs }) {
        const { signature, beforeDownload, getReport, report } = useReports()
        const { $gcs } = useContext()
        const reportType = root.$route.params.reportType
        const jobid = root.$route.params.id
        const clickedOn = ref(null)
        const cardsImages = ref([])

        const htmlToPdfOptions = computed(() => {
            return {
                margin:[20, 10, 20, 10],
                filename: `${reportType}-${jobid}`,
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
        function generateReport(key) {
            clickedOn.value = key
            refs["html2Pdf"+key].generatePdf()
        }
        function hasDownloaded() {
            clickedOn.value = null
        }
        
        watch(report, (val) => {
            if (val.cardNumber !== "N/A" && val.cardNumber !== "") {
                $gcs.$get(`/list/creditCard`, {
                    params: { folder: "creditCard", subfolder: val.cardNumber, delimiter: "", bucket: "default" }
                }).then((res) => {
                    cardsImages.value = res.images
                }).catch(err => {
                    if (err.response) {
                        console.log(err.response.data)
                    }
                })
            }
        })

        getReport(`${reportType}/${jobid}`).fetchReport()
        
        return {
            reportType,
            jobid,
            clickedOn,
            hasDownloaded,
            htmlToPdfOptions,
            generateReport,
            beforeDownload,
            signature,
            report,
            cardsImages
        }
    }
})
</script>
