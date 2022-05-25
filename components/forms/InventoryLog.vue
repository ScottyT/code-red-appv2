<template>
    <div class="form-wrapper">
        <h1 class="text-center">{{company}}</h1>
        <h3 class="text-center">UNIT QUANTITY AND EQUIPMENT INVENTORY</h3>
        <ValidationObserver ref="form" v-slot="{handleSubmit}">
            <p class="font-weight-bold">{{submittedMessage}}</p>
            <form ref="form" class="form" @submit.prevent="handleSubmit(submitForm)" v-if="!submitted">
                <div class="form__form-group">
                    <ValidationProvider vid="JobId" rules="required" v-slot="{errors, ariaMsg}" name="Job ID" class="form__input-group form__input-group--normal">
                        <input type="hidden" v-model="selectedJobId" />
                        <label class="form__label">Job ID:</label>
                        <i class="form__select--icon icon--angle-down mdi" aria-label="icon"></i>
                        <select class="form__input" v-model="selectedJobId">
                            <option disabled value="">Please select a Job ID</option>
                            <option v-for="(item, i) in $store.state.reports.jobids" :key="`jobids-${i}`">{{item}}</option>
                        </select>
                        <span class="form__input--error" v-bind="ariaMsg">{{ errors[0] }}</span>
                    </ValidationProvider>
                    <ValidationProvider vid="startDate" rules="required" v-slot="{errors, ariaMsg}" name="Initial Starting Date" class="form__input-group form__input-group--short">
                        <label for="initDate" class="form__label">Initial Starting Date:</label>
                        <input type="hidden" v-model="initDate" />
                        <v-dialog ref="initDateDialog" v-model="initDateModal" :return-value.sync="initDate" persistent width="400px">
                            <template v-slot:activator="{on, attrs}">
                                <input id="initDate" v-model="initDateFormatted" readonly v-bind="attrs" class="form__input" v-on="on" @blur="initDate = parseDate(initDateFormatted)" />
                            </template>
                            <v-date-picker v-model="initDate" scrollable>
                                <v-spacer></v-spacer>
                                <v-btn text color="#fff" @click="initDateModal = false">Cancel</v-btn>
                                <v-btn text color="#fff" @click="$refs.initDateDialog.save(initDate)">OK</v-btn>
                            </v-date-picker>
                        </v-dialog>
                        <span class="form__input--error" v-bind="ariaMsg">{{ errors[0] }}</span>
                    </ValidationProvider>
                    <ValidationProvider vid="endDate" rules="required" v-slot="{errors, ariaMsg}" name="End Date" class="form__input-group form__input-group--short">
                        <label for="enddate" class="form__label">End Date:</label>
                        <input type="hidden" v-model="endDate" />
                        <v-dialog ref="endDateDialog" v-model="endDateModal" :return-value.sync="endDate" persistent width="400px">
                            <template v-slot:activator="{on, attrs}">
                                <input id="enddate" v-model="endDateFormatted" readonly v-bind="attrs" class="form__input" v-on="on"  />
                            </template>
                            <v-date-picker v-model="endDate" scrollable :min="initDate">
                                <v-spacer></v-spacer>
                                <v-btn text color="#fff" @click="endDateModal = false">Cancel</v-btn>
                                <v-btn text color="#fff" @click="$refs.endDateDialog.save(endDate)">OK</v-btn>
                            </v-date-picker>
                        </v-dialog>
                        <span class="form__input--error" v-bind="ariaMsg">{{ errors[0] }}</span>
                    </ValidationProvider>
                </div>
                <div class="form__table inventory-logs">
                    <div class="form__table--rows">
                        <div class="form__table--cols">
                            
                        </div>
                        <div class="form__table--cols" v-for="n in 7" :key="n">
                            <div class="font-weight-bold">Day {{n}}</div>
                        </div>
                    </div>
                    <div class="form__table--rows">
                        <div class="form__table--cols">
                            <div class="form__label">Tech ID #</div>
                        </div>
                        <div class="form__table--cols" v-for="(item, i) in techIdArr[0].day" :key="`techid-${i}`">
                            <input class="form__input" type="text" readonly v-model="getUser.id" />
                        </div>
                    </div>
                    <div class="form__table--rows" v-for="(row, i) in unitQuantityArr" :key="`unit-${i}`">
                        <div class="form__table--cols">
                            <label class="form__label">{{row.text}}</label>
                        </div>
                        <div class="form__table--cols" v-for="(col, j) in row.day" :key="`unit-col-${j}`">
                            <input type="number" :tabindex="j" class="form__input" v-model="col.value" />
                        </div>
                    </div>
                    <div class="form__table--rows" v-for="(row, i) in checkBoxArr" :key="`checkbox-row-${i}`">
                        <div class="form__table--cols">
                            <label class="form__label">{{row.text}}</label>
                        </div>
                        <div class="form__table--cols" v-for="(col, j) in row.day" @click="parentClick" :key="`check-col-${j}`">
                            <input type="checkbox" :checked="false" v-model="col.value" />
                        </div>
                    </div>
                    <div class="form__table--rows" v-for="(row, i) in serviceArr" :key="`service-${i}`">
                        <div class="form__table--cols">
                            <label class="form__label">{{row.text}}</label>
                        </div>
                        <div class="form__table--cols" v-for="(col, j) in row.day" @click="parentClick" :key="`service-col-${j}`">
                            <input type="checkbox" v-model="col.value" />
                        </div>
                    </div>
                    <!-- <div class="form__table form__table--rows" v-for="(row, i) in onSiteArr" :key="`on-site-${i}`">
                        <div class="form__table--cols">
                            <label class="form__label">{{row.text}}</label>
                        </div>
                        <div class="form__table--cols" v-for="(col, j) in row.day" :key="`col-on-site-${j}`">
                            <input type="number" :tabindex="j" class="form__input" v-model="col.value" />
                        </div>
                    </div> -->
                </div>
                <div class="form__button-wrapper"><button class="button form__button-wrapper--submit" type="submit">{{ submitting ? 'Submitting' : 'Submit' }}</button></div>
            </form>
        </ValidationObserver>
        <vue-html2pdf :pdf-quality="2" pdf-content-width="100%" :html-to-pdf-options="htmlToPdfOptions('quantity-inventory-logs', selectedJobId)"
                      :paginate-elements-by-height="1000" :manual-pagination="false" :show-layout="false"
                      :enable-download="false" @hasDownloaded="uploadPdf($event, `quantity-inventory-logs-${selectedJobId}`, selectedJobId)"
                      @beforeDownload="beforeDownloadNoSave($event, `quantity-inventory-logs-${selectedJobId}`, selectedJobId)" :preview-modal="true" ref="html2Pdf0">
            <PdfLogs :reportName="postedData.ReportType" :reportType="postedData.ReportType" :report="postedData" company="Water Emergency Services Incorporated" slot="pdf-content" />
        </vue-html2pdf>
    </div>
</template>
<script>
import genericFuncs from '@/composable/utilityFunctions'
import useReports from '@/composable/reports'
import { defineComponent, ref, watch, useStore, useContext, computed } from '@nuxtjs/composition-api';

export default defineComponent({
    props: {
        company: String,
        abbreviation: String
    },
    setup(props) {
        const store = useStore()
        const { $api } = useContext()
        const { formatDate, parseDate, genRandHex } = genericFuncs()
        const { htmlToPdfOptions, beforeDownloadNoSave, uploadPdf } = useReports()
        const fetchReports = () => { store.dispatch("reports/fetchReports") }
        const errorDialog = ref(false)
        const submittedMessage = ref("")
        const submitting = ref(false)
        const submitted = ref(false)
        const errorMessage = ref("")
        const selectedJobId = ref("")
        const initDate = ref(new Date().toISOString().substring(0, 10))
        const initDateFormatted = ref(formatDate(new Date().toISOString().substr(0, 10)))
        const endDate = ref(addDays(new Date(), 6).toISOString().substr(0, 10))
        const endDateFormatted = ref(formatDate(addDays(new Date(), 6).toISOString().substr(0, 10)))
        const initDateModal = ref(false)
        const endDateModal = ref(false)
        const authUser = ref(false)
        const techIdArr = ref([
            {text: "Tech ID #",
            day: [
                {text: "day1", value: ""},
                {text: "day2",value: ""},
                {text: "day3",value: ""},
                {text: "day4",value: ""},
                {text: "day5",value: ""},
                {text: "day6",value: ""},
                {text: "day7",value: ""}
            ]}
        ])
        const unitQuantityArr = ref([
            {text: "Air Mover", day: [
                {text: "day1", value: ""},
                {text: "day2",value: ""},
                {text: "day3",value: ""},
                {text: "day4",value: ""},
                {text: "day5",value: ""},
                {text: "day6",value: ""},
                {text: "day7",value: ""}
            ]},
            {text: "Mini Air Mover", day: [
                {text: "day1", value: ""},
                {text: "day2",value: ""},
                {text: "day3",value: ""},
                {text: "day4",value: ""},
                {text: "day5",value: ""},
                {text: "day6",value: ""},
                {text: "day7",value: ""}
            ]},
            {text: "Thermal Air Mover", day: [
                {text: "day1", value: ""},
                {text: "day2",value: ""},
                {text: "day3",value: ""},
                {text: "day4",value: ""},
                {text: "day5",value: ""},
                {text: "day6",value: ""},
                {text: "day7",value: ""}
            ]},
            {text: "Dehumidifier LGR+", day: [
                {text: "day1", value: ""},
                {text: "day2",value: ""},
                {text: "day3",value: ""},
                {text: "day4",value: ""},
                {text: "day5",value: ""},
                {text: "day6",value: ""},
                {text: "day7",value: ""}
            ]},
            {text: "Air Scrubber", day: [
                {text: "day1", value: ""},
                {text: "day2",value: ""},
                {text: "day3",value: ""},
                {text: "day4",value: ""},
                {text: "day5",value: ""},
                {text: "day6",value: ""},
                {text: "day7",value: ""}
            ]},
            {text: "Negative Air Machine", day: [
                {text: "day1", value: ""},
                {text: "day2",value: ""},
                {text: "day3",value: ""},
                {text: "day4",value: ""},
                {text: "day5",value: ""},
                {text: "day6",value: ""},
                {text: "day7",value: ""}
            ]},
            {text: "HEPA VAC", day: [
                {text: "day1", value: ""},
                {text: "day2",value: ""},
                {text: "day3",value: ""},
                {text: "day4",value: ""},
                {text: "day5",value: ""},
                {text: "day6",value: ""},
                {text: "day7",value: ""}
            ]},
            {text: "Containment Posts", day: [
                {text: "day1", value: ""},
                {text: "day2",value: ""},
                {text: "day3",value: ""},
                {text: "day4",value: ""},
                {text: "day5",value: ""},
                {text: "day6",value: ""},
                {text: "day7",value: ""}
            ]},
            {text: "Generator", day: [
                {text: "day1", value: ""},
                {text: "day2",value: ""},
                {text: "day3",value: ""},
                {text: "day4",value: ""},
                {text: "day5",value: ""},
                {text: "day6",value: ""},
                {text: "day7",value: ""}
            ]},
            {text: "2'' Water Pump", day: [
                {text: "day1", value: ""},
                {text: "day2",value: ""},
                {text: "day3",value: ""},
                {text: "day4",value: ""},
                {text: "day5",value: ""},
                {text: "day6",value: ""},
                {text: "day7",value: ""}
            ]},
            {text: "Water Extractor", day: [
                {text: "day1", value: ""},
                {text: "day2",value: ""},
                {text: "day3",value: ""},
                {text: "day4",value: ""},
                {text: "day5",value: ""},
                {text: "day6",value: ""},
                {text: "day7",value: ""}
            ]},
            {text: "Truck Mount Extractor", day: [
                {text: "day1", value: ""},
                {text: "day2",value: ""},
                {text: "day3",value: ""},
                {text: "day4",value: ""},
                {text: "day5",value: ""},
                {text: "day6",value: ""},
                {text: "day7",value: ""}
            ]},
            {text: "Containment Bags", day: [
                {text: "day1", value: ""},
                {text: "day2",value: ""},
                {text: "day3",value: ""},
                {text: "day4",value: ""},
                {text: "day5",value: ""},
                {text: "day6",value: ""},
                {text: "day7",value: ""}
            ]},
            {text: "Truck load of debris", day: [
                {text: "day1", value: ""},
                {text: "day2",value: ""},
                {text: "day3",value: ""},
                {text: "day4",value: ""},
                {text: "day5",value: ""},
                {text: "day6",value: ""},
                {text: "day7",value: ""}
            ]},
            {text: "Dumpster", day: [
                {text: "day1", value: ""},
                {text: "day2",value: ""},
                {text: "day3",value: ""},
                {text: "day4",value: ""},
                {text: "day5",value: ""},
                {text: "day6",value: ""},
                {text: "day7",value: ""}
            ]},
            {text: "(On-Site) Textile Bag #", day: [
                {text: "day1", value: ""},
                {text: "day2",value: ""},
                {text: "day3",value: ""},
                {text: "day4",value: ""},
                {text: "day5",value: ""},
                {text: "day6",value: ""},
                {text: "day7",value: ""}
            ]},
            {text: "(On-Site) Furniture #", day: [
                {text: "day1", value: ""},
                {text: "day2",value: ""},
                {text: "day3",value: ""},
                {text: "day4",value: ""},
                {text: "day5",value: ""},
                {text: "day6",value: ""},
                {text: "day7",value: ""}
            ]},
            {text: "(On-Site) Item Box #", day: [
                {text: "day1", value: ""},
                {text: "day2",value: ""},
                {text: "day3",value: ""},
                {text: "day4",value: ""},
                {text: "day5",value: ""},
                {text: "day6",value: ""},
                {text: "day7",value: ""}
            ]},
            {text: "(On-Site) Storage Unit #", day: [
                {text: "day1", value: ""},
                {text: "day2",value: ""},
                {text: "day3",value: ""},
                {text: "day4",value: ""},
                {text: "day5",value: ""},
                {text: "day6",value: ""},
                {text: "day7",value: ""}
            ]},
            {text: "(On-Site) Debris Bag #", day: [
                {text: "day1", value: ""},
                {text: "day2",value: ""},
                {text: "day3",value: ""},
                {text: "day4",value: ""},
                {text: "day5",value: ""},
                {text: "day6",value: ""},
                {text: "day7",value: ""}
            ]},
            {text: "(On-Site) Disposal Unit #", day: [
                {text: "day1", value: ""},
                {text: "day2",value: ""},
                {text: "day3",value: ""},
                {text: "day4",value: ""},
                {text: "day5",value: ""},
                {text: "day6",value: ""},
                {text: "day7",value: ""}
            ]},
            {text: "(On-Site) Moving Van #", day: [
                {text: "day1", value: ""},
                {text: "day2",value: ""},
                {text: "day3",value: ""},
                {text: "day4",value: ""},
                {text: "day5",value: ""},
                {text: "day6",value: ""},
                {text: "day7",value: ""}
            ]}
        ])
        const checkBoxArr = ref([
            {text: "Evaluation", day: [
                {text: "day1", value: false},
                {text: "day2",value: false},
                {text: "day3",value: false},
                {text: "day4",value: false},
                {text: "day5",value: false},
                {text: "day6",value: false},
                {text: "day7",value: false}
            ]},
            {text: "Containment", day: [
                {text: "day1", value: ""},
                {text: "day2",value: ""},
                {text: "day3",value: ""},
                {text: "day4",value: ""},
                {text: "day5",value: ""},
                {text: "day6",value: ""},
                {text: "day7",value: ""}
            ]},
            {text: "Structural Drying", day: [
                {text: "day1", value: ""},
                {text: "day2",value: ""},
                {text: "day3",value: ""},
                {text: "day4",value: ""},
                {text: "day5",value: ""},
                {text: "day6",value: ""},
                {text: "day7",value: ""}
            ]},
            {text: "Anti-Microbials", day: [
                {text: "day1", value: ""},
                {text: "day2",value: ""},
                {text: "day3",value: ""},
                {text: "day4",value: ""},
                {text: "day5",value: ""},
                {text: "day6",value: ""},
                {text: "day7",value: ""}
            ]},
            {text: "Microbial - Sealants", day: [
                {text: "day1", value: ""},
                {text: "day2",value: ""},
                {text: "day3",value: ""},
                {text: "day4",value: ""},
                {text: "day5",value: ""},
                {text: "day6",value: ""},
                {text: "day7",value: ""}
            ]},
            {text: "Structural Cleaning", day: [
                {text: "day1", value: ""},
                {text: "day2",value: ""},
                {text: "day3",value: ""},
                {text: "day4",value: ""},
                {text: "day5",value: ""},
                {text: "day6",value: ""},
                {text: "day7",value: ""}
            ]},
            {text: "Quality Control", day: [
                {text: "day1", value: ""},
                {text: "day2",value: ""},
                {text: "day3",value: ""},
                {text: "day4",value: ""},
                {text: "day5",value: ""},
                {text: "day6",value: ""},
                {text: "day7",value: ""}
            ]},
            {text: "Debris Removed", day: [
                {text: "day1", value: ""},
                {text: "day2",value: ""},
                {text: "day3",value: ""},
                {text: "day4",value: ""},
                {text: "day5",value: ""},
                {text: "day6",value: ""},
                {text: "day7",value: ""}
            ]},
            {text: "Content Handling", day: [
                {text: "day1", value: ""},
                {text: "day2",value: ""},
                {text: "day3",value: ""},
                {text: "day4",value: ""},
                {text: "day5",value: ""},
                {text: "day6",value: ""},
                {text: "day7",value: ""}
            ]}
        ])
        const serviceArr = ref([
            {text: "Plumber", day: [
                {text: "day1", value: ""},
                {text: "day2",value: ""},
                {text: "day3",value: ""},
                {text: "day4",value: ""},
                {text: "day5",value: ""},
                {text: "day6",value: ""},
                {text: "day7",value: ""}
            ]},
            {text: "Electrician", day: [
                {text: "day1", value: ""},
                {text: "day2",value: ""},
                {text: "day3",value: ""},
                {text: "day4",value: ""},
                {text: "day5",value: ""},
                {text: "day6",value: ""},
                {text: "day7",value: ""}
            ]},
            {text: "HVAC Company", day: [
                {text: "day1", value: ""},
                {text: "day2",value: ""},
                {text: "day3",value: ""},
                {text: "day4",value: ""},
                {text: "day5",value: ""},
                {text: "day6",value: ""},
                {text: "day7",value: ""}
            ]}
        ])
        const onSiteArr = ref([
            {text: "(On-Site) Textile Bag #", day: [
                {text: "day1", value: ""},
                {text: "day2",value: ""},
                {text: "day3",value: ""},
                {text: "day4",value: ""},
                {text: "day5",value: ""},
                {text: "day6",value: ""},
                {text: "day7",value: ""}
            ]},
            {text: "(On-Site) Furniture #", day: [
                {text: "day1", value: ""},
                {text: "day2",value: ""},
                {text: "day3",value: ""},
                {text: "day4",value: ""},
                {text: "day5",value: ""},
                {text: "day6",value: ""},
                {text: "day7",value: ""}
            ]},
            {text: "(On-Site) Item Box #", day: [
                {text: "day1", value: ""},
                {text: "day2",value: ""},
                {text: "day3",value: ""},
                {text: "day4",value: ""},
                {text: "day5",value: ""},
                {text: "day6",value: ""},
                {text: "day7",value: ""}
            ]},
            {text: "(On-Site) Storage Unit #", day: [
                {text: "day1", value: ""},
                {text: "day2",value: ""},
                {text: "day3",value: ""},
                {text: "day4",value: ""},
                {text: "day5",value: ""},
                {text: "day6",value: ""},
                {text: "day7",value: ""}
            ]},
            {text: "(On-Site) Debris Bag #", day: [
                {text: "day1", value: ""},
                {text: "day2",value: ""},
                {text: "day3",value: ""},
                {text: "day4",value: ""},
                {text: "day5",value: ""},
                {text: "day6",value: ""},
                {text: "day7",value: ""}
            ]},
            {text: "(On-Site) Disposal Unit #", day: [
                {text: "day1", value: ""},
                {text: "day2",value: ""},
                {text: "day3",value: ""},
                {text: "day4",value: ""},
                {text: "day5",value: ""},
                {text: "day6",value: ""},
                {text: "day7",value: ""}
            ]},
            {text: "(On-Site) Moving Van #", day: [
                {text: "day1", value: ""},
                {text: "day2",value: ""},
                {text: "day3",value: ""},
                {text: "day4",value: ""},
                {text: "day5",value: ""},
                {text: "day6",value: ""},
                {text: "day7",value: ""}
            ]}
        ])
        const reportId = ref("")
        const postedData = ref({})
        const html2Pdf0 = ref(null)

        const getUser = computed(() => store.getters["users/getUser"])
        const getReports = computed(() => store.getters["reports/getReports"])

        function addDays(d, days) {
            const date = new Date(d);
            date.setDate(date.getDate() + days);
            return date;
        }
        function parentClick(event) {
            var childArr = event.target.childNodes;
            childArr.forEach(child => {
                if (child.type === 'checkbox') {
                    child.checked = !child.checked
                }
            })
        }
        async function submitForm() {
            await Promise.all([onSubmit()]).then((result) => {
                submittedMessage.value = result[0]
                submitting.value = false
                submitted.value = true
                html2Pdf0.value.generatePdf()
            }).catch(error => console.log(`Error in promises ${error}`))
        }
        function onSubmit() {
            submitting.value = true
            if (reportId.value === "") reportId.value = genRandHex(24)
            const post = {
                JobId: selectedJobId.value,
                ReportType: "quantity-inventory-logs",
                startDate: initDateFormatted.value,
                endDate: endDateFormatted.value,
                formType: "logs-report",
                quantityData: unitQuantityArr.value,
                checkData: checkBoxArr.value,
                serviceArr: serviceArr.value,
                teamMember: getUser.value
            }
            postedData.value = post
            return new Promise((resolve, reject) => {
                $api.$put(`/api/reports/quantity-inventory-logs/${selectedJobId.value}/update`, post).then((res) => {
                    fetchReports()
                    resolve(res)
                }).catch((err) => {
                    submitting.value = false
                    if (err.response) {
                        reject(err)
                        console.error(err.response.data)
                    }
                })
            })
        }

        watch(() => initDate.value, (val) => {
            initDateFormatted.value = formatDate(val)
            endDateFormatted.value = formatDate(addDays(val, 6).toISOString().substring(0, 10))
        })
        watch(() => endDate.value, (val) => {
            endDateFormatted.value = formatDate(val)
        })
        watch(() => selectedJobId.value, (val) => {
            $api.$get(`/api/reports/details/quantity-inventory-logs/${val}`).then((res) => {
                initDateFormatted.value = res.startDate
                endDateFormatted.value = res.endDate
                checkBoxArr.value = res.checkData
                serviceArr.value = res.serviceArr
                unitQuantityArr.value = res.quantityData
                reportId.value = res.Id
            }).catch((err) => {
                if (err.response) {
                    initDateFormatted.value = formatDate(new Date().toISOString().substring(0, 10))
                    endDateFormatted.value = formatDate(addDays(new Date(), 7).toISOString().substring(0, 10))
                    checkBoxArr.value.forEach((item) => {
                        item.day.forEach((d) => {
                            d.value = false
                        })
                    })
                    serviceArr.value.forEach((item) => {
                        item.day.forEach((d) => {
                            d.value = ""
                        })
                    })
                    unitQuantityArr.value.forEach((item) => {
                        item.day.forEach((d) => {
                            d.value = ""
                        })
                    })
                    reportId.value = ""
                }
            })
        })

        return {
            errorDialog, submittedMessage, submitting, submitted, errorMessage,
            selectedJobId, initDate, initDateFormatted, endDate, endDateFormatted, initDateModal, endDateModal, techIdArr, unitQuantityArr, checkBoxArr, serviceArr, onSiteArr,
            beforeDownloadNoSave,
            uploadPdf,
            getUser,
            htmlToPdfOptions,
            submitForm,
            parseDate,
            html2Pdf0,
            postedData,
            parentClick
        }
    }
})
</script>
<style lang="scss">
.inventory-logs {
    grid-template-rows:50px repeat(35, 1fr);
}
</style>