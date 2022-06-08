<template>
    <div class="form-wrapper">
        <h1 class="text-center">{{company}}</h1>
        <h3 class="text-center">ATMOSPHERIC READINGS</h3>
        <ValidationObserver ref="form" v-slot="{errors}">
            <v-dialog width="400px" v-model="errorDialog">
                <div class="modal__error">
                    <div v-for="(error, i) in errors" :key="`error-${i}`">
                        <h3 class="form__input--error">{{ error[0] }}</h3>
                    </div>
                </div>
            </v-dialog>
            <p class="font-weight-bold">{{submittedMessage}}</p>
            <h3 class="alert alert--error">{{errorMessage}}</h3>
            <form ref="form" class="form" @submit.prevent="submitForm" v-if="!submitted">
                <div class="form__form-group">
                    <ValidationProvider vid="selectedJobId" rules="required" v-slot="{errors, ariaMsg}" name="Job ID" class="form__input-group form__input-group--normal">
                        <input type="hidden" v-model="selectedJobId" />
                        <label class="form__label">Job ID:</label>
                        <v-overlay :value="isLoading" v-show="isLoading" light>
                            <v-progress-circular
                                indeterminate
                                size="64"
                                ></v-progress-circular>
                        </v-overlay>
                        <i class="form__select--icon icon--angle-down mdi" aria-label="icon"></i>
                        <select class="form__input" v-model="selectedJobId">
                            <option disabled value="">Please select a Job ID</option>
                            <option v-for="(item, i) in $store.state.reports.jobids" :key="`jobids-${i}`">{{item}}</option>
                        </select>
                        <span class="form__input--error" v-bind="ariaMsg">{{ errors[0] }}</span>
                    </ValidationProvider>
                    <ValidationProvider vid="startDate" name="Initial Starting Date" class="form__input-group form__input-group--short">
                        <label for="initDate" class="form__label">Initial Starting Date:</label>
                        <input type="hidden" v-model="initDate" />
                        <v-dialog ref="initDateDialog" v-model="initDateModal" :return-value.sync="initDate" persistent width="400px">
                            <template v-slot:activator="{on, attrs}">
                                <input id="initDate" v-model="initDateFormatted" v-bind="attrs" class="form__input" v-on="on" @blur="initDate = parseDate(initDateFormatted)"
                                   readonly />
                            </template>
                            <v-date-picker v-model="initDate" scrollable>
                                <v-spacer></v-spacer>
                                <v-btn text color="#fff" @click="initDateModal = false">Cancel</v-btn>
                                <v-btn text color="#fff" @click="$refs.initDateDialog.save(initDate)">OK</v-btn>
                            </v-date-picker>
                        </v-dialog>
                    </ValidationProvider>
                    <ValidationProvider vid="endDate" rules="required" v-slot="{errors, ariaMsg}" name="End Date" class="form__input-group form__input-group--short">
                        <label for="enddate" class="form__label">End Date:</label>
                        <input type="hidden" v-model="endDate" />
                        <v-dialog ref="endDateDialog" v-model="endDateModal" :return-value.sync="endDate" persistent width="400px">
                            <template v-slot:activator="{on, attrs}">
                                <input id="enddate" v-model="endDateFormatted" v-bind="attrs" class="form__input" v-on="on" readonly />
                            </template>
                            <v-date-picker v-model="endDate" scrollable :min="initDate">
                                <v-spacer></v-spacer>
                                <v-btn text color="#fff" @click="endDateModal = false">Cancel</v-btn>
                                <v-btn text color="#fff" @click="$refs.endDateDialog.save(endDate)">OK</v-btn>
                            </v-date-picker>
                        </v-dialog>
                        <span class="form__input--error" v-bind="ariaMsg">{{ errors[0] }}</span>
                    </ValidationProvider>
                    <ValidationProvider vid="curDate" rules="required" v-slot="{errors, ariaMsg}" name="This field" class="form__input-group form__input-group--short">
                        <input type="hidden" v-model="currentDate" />
                        <label class="form__label">Selected date for editing</label>
                        <UiDatePicker :d="initDateFormatted" :minDate="initDateFormatted" :maxDate="endDateFormatted" dateId="curDate" dialogId="curDateDialog" @date="currentDate = $event" />
                        <span class="form__input--error" v-bind="ariaMsg">{{ errors[0] }}</span>
                    </ValidationProvider>
                </div>
                <div class="form__table reading-logs">
                    <div class="form__table--rows">
                        <div class="form__table--cols">
                            <div class="form__label">Description</div>
                        </div>
                        <div class="form__table--cols" v-for="n in dateRanges" :key="n">
                            <div>{{n}}</div>
                        </div>
                    </div>
                    <div class="form__table--rows">
                        <div class="form__table--cols">
                            <div class="form__label">Tech ID #</div>
                        </div>
                        <div class="form__table--cols" v-for="n in 7" :key="n">
                            <input type="text" class="form__input" readonly v-model="getUser.id" />
                        </div>
                    </div>
                    <div class="form__table--rows" v-for="(row, i) in readingsArr" :key="`row-${i}`">
                        <div class="form__table--cols">
                            <div class="form__label">{{row.text}}</div>
                        </div>
                        <div class="form__table--cols" v-for="(item, j) in row.day" :key="`col-${j}`">
                            <input :tabindex="j" v-on="(row.identifier === 'dryBulbTemp' || row.identifier === 'humidityRatio' || row.identifier === 'dewPoint') ? {
                                    input: ($event) => calculationsDp($event, row.identifier, row.label, item.date)
                                }:{}" v-model="item.value" class="form__input" 
                                type="text" />
                        </div>
                    </div>
                    <div class="form__table--rows row-heading">
                        <div class="form__table--cols">
                            <h3>Water Loss Classification</h3>
                        </div>
                    </div>
                    <div class="form__table--rows" v-for="(row, i) in lossArr" :key="`classrow-${i}`">
                        <div class="form__table--cols">
                            <div class="form__label">{{row.text}}</div>
                        </div>
                        <div class="form__table--cols" v-for="(item, j) in row.day" :key="`col-${j}`">
                            <input type="number" :tabindex="j" v-model="item.value" class="form__input" />
                        </div>
                    </div>
                    <div class="form__table--rows row-heading">
                        <div class="form__table--cols">
                            <h3>Water Category</h3>
                        </div>                       
                    </div>
                    <div class="form__table--rows" v-for="(row, i) in catArr" :key="`catrow-${i}`">
                        <div class="form__table--cols">
                            <div class="form__label">{{row.text}}</div>
                        </div>
                        <div class="form__table--cols" v-for="(item, j) in row.day" :key="`col-${j}`">
                            <input type="number" :tabindex="j" v-model="item.value" class="form__input" />
                        </div>
                    </div>
                </div>
                <div class="form__form-group">
                    <ValidationProvider vid="notes" name="Notes" v-slot="{errors, ariaMsg}" class="form__input-text-area">
                        <label class="form__label" for="notes">Notes:</label>
                        <textarea id="notes" v-model="notes" class="form__input form__input--textarea"></textarea>
                        <span class="form__input--error" v-bind="ariaMsg">{{ errors[0] }}</span>
                    </ValidationProvider>
                </div>
                <div class="form__button-wrapper">
                    <button class="button button--normal" type="submit">{{ submitting ? 'Submitting' : 'Submit' }}</button>
                    <!-- <v-dialog width="400px" v-model="warningDialog">
                        <template v-slot:activator="{on, attrs}">
                            <button v-show="reportFetched" type="button" v-bind="attrs" class="button button--normal" v-on="on">Update</button>
                        </template>
                        <div class="modal__content">
                            <p>You are about to overwrite this report. This is irreversable. Are you sure you want to submit?</p>                       
                        </div>
                        <div class="modal__footer">
                            <button class="button--normal" type="submit">Yes</button>
                            <button class="button--normal" type="button" @click="warningDialog = false">Cancel</button>
                        </div>
                    </v-dialog> -->
                </div>
            </form>
        </ValidationObserver>
        <div>
            <vue-html2pdf :pdf-quality="2" pdf-content-width="100%" :html-to-pdf-options="htmlToPdfOptions('atmospheric-readings', selectedJobId)" 
                :paginate-elements-by-height="1000" :manual-pagination="false" :show-layout="false" :enable-download="false" 
                @hasDownloaded="uploadPdf($event, `atmospheric-readings-${selectedJobId}`, selectedJobId)"
                @beforeDownload="beforeDownloadNoSave($event, `atmospheric-readings-${selectedJobId}`, selectedJobId)" 
                :preview-modal="true" ref="html2Pdf0">
                    <PdfLogs :reportName="postedData.ReportType" :reportType="postedData.ReportType" :report="postedData" company="Water Emergency Services Incorporated" slot="pdf-content" />
            </vue-html2pdf>
        </div>
    </div>
</template>
<script>
// Humidity Ratio = GGP
import {mapActions, mapGetters} from 'vuex';
import goTo from 'vuetify/es5/services/goto'
import genericFuncs from '@/composable/utilityFunctions'
import useReports from '@/composable/reports'
import { defineComponent, ref, useStore, computed, useContext, watch } from '@nuxtjs/composition-api';
import { reject } from 'q';
export default defineComponent({
    props: {
        company: String,
        abbreviation: String
    },
    setup(props, { emit }) {
        const store = useStore()
        const { $api } = useContext()
        const { formatTime, formatDate, groupByKey, round, convertToC, convertToF, parseDate } = genericFuncs()
        const { htmlToPdfOptions, beforeDownloadNoSave, uploadPdf } = useReports()
        const fetchReports = () => { store.dispatch("reports/fetchReports") }
        const form = ref(null)
        const html2Pdf0 = ref(null)
        const readingsArr = ref([
            {text: "Affected Temperature (fahrenheit)", label: "Affected", identifier: "dryBulbTemp", min: "20", day: [
                {text: "day1", date: "", value: ""},
                {text: "day2",date: "",value: ""},
                {text: "day3",date: "",value: ""},
                {text: "day4",date: "",value: ""},
                {text: "day5",date: "",value: ""},
                {text: "day6",date: "",value: ""},
                {text: "day7",date: "",value: ""}
            ]},
            {text: "Affected Vapor Pressure", label: "Affected", identifier: "vaporPressure", day: [
                {text: "day1", value: ""},
                {text: "day2",value: ""},
                {text: "day3",value: ""},
                {text: "day4",value: ""},
                {text: "day5",value: ""},
                {text: "day6",value: ""},
                {text: "day7",value: ""}
            ]},
            {text: "Affected Dew Point (fahrenheit)", label: "Affected", identifier: "dewPoint", day: [
                {text: "day1", value: ""},
                {text: "day2",value: ""},
                {text: "day3",value: ""},
                {text: "day4",value: ""},
                {text: "day5",value: ""},
                {text: "day6",value: ""},
                {text: "day7",value: ""}
            ]},
            {text: "Affected Relative Humidity", label: "Affected", identifier: "relativeHumidity", day: [
                {text: "day1", value: ""},
                {text: "day2",value: ""},
                {text: "day3",value: ""},
                {text: "day4",value: ""},
                {text: "day5",value: ""},
                {text: "day6",value: ""},
                {text: "day7",value: ""}
            ]},
            {text: "Affected GPP", label: "Affected", identifier: "humidityRatio", day: [
                {text: "day1", value: ""},
                {text: "day2",value: ""},
                {text: "day3",value: ""},
                {text: "day4",value: ""},
                {text: "day5",value: ""},
                {text: "day6",value: ""},
                {text: "day7",value: ""}
            ]},
            {text: "Comparative Temperature", label: "Unaffected", identifier: "dryBulbTemp", day: [
                {text: "day1", value: ""},
                {text: "day2",value: ""},
                {text: "day3",value: ""},
                {text: "day4",value: ""},
                {text: "day5",value: ""},
                {text: "day6",value: ""},
                {text: "day7",value: ""}
            ]},
            {text: "Comparative Vapor Pressure", label: "Unaffected", identifier: "vaporPressure", day: [
                {text: "day1", value: ""},
                {text: "day2",value: ""},
                {text: "day3",value: ""},
                {text: "day4",value: ""},
                {text: "day5",value: ""},
                {text: "day6",value: ""},
                {text: "day7",value: ""}
            ]},
            {text: "Comparative Dew Point (fahrenheit)", label: "Unaffected", identifier: "dewPoint", day: [
                {text: "day1", value: ""},
                {text: "day2",value: ""},
                {text: "day3",value: ""},
                {text: "day4",value: ""},
                {text: "day5",value: ""},
                {text: "day6",value: ""},
                {text: "day7",value: ""}
            ]},
            {text: "Comparative Humidity", label: "Unaffected", identifier: "relativeHumidity", day: [
                {text: "day1", value: ""},
                {text: "day2",value: ""},
                {text: "day3",value: ""},
                {text: "day4",value: ""},
                {text: "day5",value: ""},
                {text: "day6",value: ""},
                {text: "day7",value: ""}
            ]},
            
            {text: "Comparative GGP", label: "Unaffected", identifier: "humidityRatio", day: [
                {text: "day1", value: ""},
                {text: "day2",value: ""},
                {text: "day3",value: ""},
                {text: "day4",value: ""},
                {text: "day5",value: ""},
                {text: "day6",value: ""},
                {text: "day7",value: ""}
            ]},
            {text: "Exterior Temperature", label: "Exterior", identifier: "dryBulbTemp", day: [
                {text: "day1", value: ""},
                {text: "day2",value: ""},
                {text: "day3",value: ""},
                {text: "day4",value: ""},
                {text: "day5",value: ""},
                {text: "day6",value: ""},
                {text: "day7",value: ""}
            ]},
            {text: "Exterior Dew Point (fahrenheit)", label: "Exterior", identifier: "dewPoint", day: [
                {text: "day1", value: ""},
                {text: "day2",value: ""},
                {text: "day3",value: ""},
                {text: "day4",value: ""},
                {text: "day5",value: ""},
                {text: "day6",value: ""},
                {text: "day7",value: ""}
            ]},
            {text: "Exterior RH", label: "Exterior", identifier: "relativeHumidity", day: [
                {text: "day1", value: ""},
                {text: "day2",value: ""},
                {text: "day3",value: ""},
                {text: "day4",value: ""},
                {text: "day5",value: ""},
                {text: "day6",value: ""},
                {text: "day7",value: ""}
            ]},
            {text: "Exterior Pressure", label: "Exterior", identifier: "vaporPressure", day: [
                {text: "day1", value: ""},
                {text: "day2",value: ""},
                {text: "day3",value: ""},
                {text: "day4",value: ""},
                {text: "day5",value: ""},
                {text: "day6",value: ""},
                {text: "day7",value: ""}
            ]},
            {text: "Exterior GGP", label: "Exterior", identifier: "humidityRatio", day: [
                {text: "day1", value: ""},
                {text: "day2",value: ""},
                {text: "day3",value: ""},
                {text: "day4",value: ""},
                {text: "day5",value: ""},
                {text: "day6",value: ""},
                {text: "day7",value: ""}
            ]},
            
            {text: "Contributing Event", day: [
                {text: "day1", value: ""},
                {text: "day2",value: ""},
                {text: "day3",value: ""},
                {text: "day4",value: ""},
                {text: "day5",value: ""},
                {text: "day6",value: ""},
                {text: "day7",value: ""}
            ]},
            {text: "Precipitation (inches)", day: [
                {text: "day1", value: ""},
                {text: "day2",value: ""},
                {text: "day3",value: ""},
                {text: "day4",value: ""},
                {text: "day5",value: ""},
                {text: "day6",value: ""},
                {text: "day7",value: ""}
            ]},
            {text: "Wind (mph)", day: [
                {text: "day1", value: ""},
                {text: "day2",value: ""},
                {text: "day3",value: ""},
                {text: "day4",value: ""},
                {text: "day5",value: ""},
                {text: "day6",value: ""},
                {text: "day7",value: ""}
            ]},  
        ])
        const lossArr = ref([
                {text: "Class 1", day: [
                {text: "day1", value: ""},
                {text: "day2",value: ""},
                {text: "day3",value: ""},
                {text: "day4",value: ""},
                {text: "day5",value: ""},
                {text: "day6",value: ""},
                {text: "day7",value: ""}
            ]},
                {text: "Class 2", day: [
                {text: "day1", value: ""},
                {text: "day2",value: ""},
                {text: "day3",value: ""},
                {text: "day4",value: ""},
                {text: "day5",value: ""},
                {text: "day6",value: ""},
                {text: "day7",value: ""}
            ]},
                {text: "Class 3", day: [
                {text: "day1", value: ""},
                {text: "day2",value: ""},
                {text: "day3",value: ""},
                {text: "day4",value: ""},
                {text: "day5",value: ""},
                {text: "day6",value: ""},
                {text: "day7",value: ""}
            ]},
                {text: "Class 4", day: [
                {text: "day1", value: ""},
                {text: "day2",value: ""},
                {text: "day3",value: ""},
                {text: "day4",value: ""},
                {text: "day5",value: ""},
                {text: "day6",value: ""},
                {text: "day7",value: ""}
            ]}
        ])
        const catArr = ref([
            {text: "Category Water 1", day: [
                {text: "day1", value: ""},
                {text: "day2",value: ""},
                {text: "day3",value: ""},
                {text: "day4",value: ""},
                {text: "day5",value: ""},
                {text: "day6",value: ""},
                {text: "day7",value: ""}
            ]},
            {text: "Category Water 2", day: [
                {text: "day1", value: ""},
                {text: "day2",value: ""},
                {text: "day3",value: ""},
                {text: "day4",value: ""},
                {text: "day5",value: ""},
                {text: "day6",value: ""},
                {text: "day7",value: ""}
            ]},
            {text: "Category Water 3", day: [
                {text: "day1", value: ""},
                {text: "day2",value: ""},
                {text: "day3",value: ""},
                {text: "day4",value: ""},
                {text: "day5",value: ""},
                {text: "day6",value: ""},
                {text: "day7",value: ""}
            ]},
            {text: "Category Water 4", day: [
                {text: "day1", value: ""},
                {text: "day2",value: ""},
                {text: "day3",value: ""},
                {text: "day4",value: ""},
                {text: "day5",value: ""},
                {text: "day6",value: ""},
                {text: "day7",value: ""}
            ]}
        ])
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
        const notes = ref("")
        const reportFetched = ref(false)
        const warningDialog = ref(false)
        const psychrometricData = ref({
            Affected: {
                info: {
                    dryBulbTemp: "",
                    humidityRatio: "",
                    dewPoint: "",
                    vaporPressure: "",
                    relativeHumidity: ""
                },
                date: "",
                color: "",
                readingsType: "Affected"
            },
            Exterior: {
                info: {
                    dryBulbTemp: "",
                    relativeHumidity: "",
                    humidityRatio: "",
                    dewPoint: "",
                    vaporPressure: ""
                },
                date: "",
                color: "",
                readingsType: "Exterior"
            },
            Unaffected: {
                info: {
                    dryBulbTemp: "",
                    humidityRatio: "",
                    dewPoint: "",
                    vaporPressure: "",
                    relativeHumidity: ""
                },
                date: "",
                color: "",
                readingsType: "Unaffected"
            }
        })
        const colors = ref(['#157f27', '#900C3F', '#0A9C8F', '#FF5733', '#EB1F28', '#343434', '#C70039'])
        const hPa = ref(.1805)
        const beta = ref(17.62)
        const temp = ref(243.12)
        const vapor = ref("")
        const tempInC = ref("")
        const Dp = ref("")
        const readingsType = ref({})
        const fetchedPsychometric = ref({})
        const currentDate = ref(formatDate(new Date().toISOString().substring(0, 10)))
        const error = ref(false)
        const reportId = ref("")
        const isLoading = ref(false)
        const postedData = ref({})
        
        const getUser = computed(() => store.getters["users/getUser"])
        const getReports = computed(() => store.getters["reports/getReports"])
        const groupingData = computed(() => {
            return groupByKey(readingsArr.value, 'label')
        })
        const dateIndex = computed(() => {
            return dateRanges.value.indexOf(currentDate.value)
        })
        const dateRanges = computed(() => {
            var datediff = new Date(endDateFormatted.value) - new Date(initDateFormatted.value)
            var daysDiff = datediff /  (1000 * 60 * 60 * 24);
            var startDateDay = new Date(initDateFormatted.value).getDate()
            var dates = []
            for (let i = 0; i <= daysDiff; i++) {
                var date = new Date(initDateFormatted.value)
                var day = date.setDate(startDateDay + i)
                var formattedDate = formatDate(new Date(day).toISOString().substr(0, 10))
                dates.push(formattedDate)
            }
            readingsArr.value.forEach((item, i) => {
                for (let j = 0; j < item.day.length; j++) {
                    item.day[j].date = dates[j]
                }
            })
            return dates
        })
        const vaporToGGP = computed(() => {
            var nums = []
            var counter = 0
            var ggp = 0
            while (counter <= 1.4) {
                counter = counter + .01
                ggp = ggp + 1.5
                nums.push({vaporPressure: round(counter, 2), humidityRatio: ggp.toString()})
            }
            return nums
        })

        function calculationsDp(e, param, label, date) {
            let dateIndex = dateRanges.value.indexOf(date)
            var affectedTemp = groupingData.value["Affected"].find(el => el.identifier === "dryBulbTemp" && el.label === "Affected")
            var exteriorTemp = groupingData.value["Exterior"].find(el => el.identifier === "dryBulbTemp" && el.label === "Exterior")
            var unaffectedTemp = groupingData.value["Unaffected"].find(el => el.identifier === "dryBulbTemp" && el.label === "Unaffected")
            var affectedRH = groupingData.value["Affected"].find(el => el.identifier === "relativeHumidity" && el.label === "Affected")
            var exteriorRH = groupingData.value["Exterior"].find(el => el.identifier === "relativeHumidity" && el.label === "Exterior")
            var unaffectedRH = groupingData.value["Unaffected"].find(el => el.identifier === "relativeHumidity" && el.label === "Unaffected")
            var affectedDp = groupingData.value["Affected"].find(el => el.identifier === "dewPoint" && el.label === "Affected")
            var exteriorDp = groupingData.value["Exterior"].find(el => el.identifier === "dewPoint" && el.label === "Exterior")
            var unaffectedDp = groupingData.value["Unaffected"].find(el => el.identifier === "dewPoint" && el.label === "Unaffected")
            var affectedVapor = groupingData.value["Affected"].find(el => el.identifier === "vaporPressure" && el.label === "Affected")
            var exteriorVapor = groupingData.value["Exterior"].find(el => el.identifier === "vaporPressure" && el.label === "Exterior")
            var unaffectedVapor = groupingData.value["Unaffected"].find(el => el.identifier === "vaporPressure" && el.label === "Unaffected")
            var tempInCAffected = convertToC(affectedTemp.day[dateIndex].value)
            var tempInCExterior = convertToC(exteriorTemp.day[dateIndex].value)
            var tempInCUnaffected = convertToC(unaffectedTemp.day[dateIndex].value)
            
            for (const property in groupingData.value) {
                groupingData.value[property].forEach((item, i) => {
                    if (param === "dryBulbTemp" && label === "Affected") {
                        psychrometricData.value["Affected"].info.dryBulbTemp = parseFloat(e.target.value)
                    }
                    if (param === "dryBulbTemp" && label === "Exterior") {
                        psychrometricData.value["Exterior"].info.dryBulbTemp = parseFloat(e.target.value)
                    }
                    if (param === "dryBulbTemp" && label === "Unaffected") {
                        psychrometricData.value["Unaffected"].info.dryBulbTemp = parseFloat(e.target.value)
                    }
                    if (param === "humidityRatio" && label === "Affected") {
                        let vapor = e.target.value
                        affectedVapor.day[dateIndex].value = calcVapor(vapor, "Affected")
                        psychrometricData.value["Affected"].info.humidityRatio = parseFloat(e.target.value)
                        psychrometricData.value["Affected"].info.vaporPressure = calcVapor(vapor, "Affected")
                    }
                    if (param === "humidityRatio" && label === "Unaffected") {
                        unaffectedVapor.day[dateIndex].value = calcVapor(e.target.value, "Unaffected")
                        psychrometricData.value["Unaffected"].info.humidityRatio = parseFloat(e.target.value)
                        psychrometricData.value["Unaffected"].info.vaporPressure = calcVapor(vapor, "Unaffected")
                    }
                    if (param === "humidityRatio" && label === "Exterior") {
                        exteriorVapor.day[dateIndex].value = calcVapor(e.target.value, "Exterior")
                        psychrometricData.value["Exterior"].info.humidityRatio = parseFloat(e.target.value)
                        psychrometricData.value["Exterior"].info.vaporPressure = calcVapor(vapor, "Exterior")
                    }
                    if (item.identifier === "dewPoint" && label === "Affected") {
                        var ln = affectedVapor.day[dateIndex].value / hPa.value
                        var dewPointF = convertToF((temp.value * Math.log(ln)) / (beta.value - Math.log(ln)))
                        affectedDp.day[dateIndex].value = round(dewPointF, 3)
                        psychrometricData.value["Affected"].info.dewPoint = round(dewPointF, 3)
                    }
                    if (item.identifier === "dewPoint" && label === "Unaffected") {
                        var ln = unaffectedVapor.day[dateIndex].value / hPa.value
                        var dewPointF = convertToF((temp.value * Math.log(ln)) / (beta.value - Math.log(ln)))
                        unaffectedDp.day[dateIndex].value = round(dewPointF, 3)
                        psychrometricData.value["Unaffected"].info.dewPoint = round(dewPointF, 3)
                    }
                    if (item.identifier === "dewPoint" && label === "Exterior") {
                        var ln = exteriorVapor.day[dateIndex].value / hPa.value
                        var dewPointF = convertToF((temp.value * Math.log(ln)) / (beta.value - Math.log(ln)))
                        exteriorDp.day[dateIndex].value = round(dewPointF, 3)
                        psychrometricData.value["Exterior"].info.dewPoint = round(dewPointF, 3)
                    }  
                    if (item.identifier === "relativeHumidity" && label === "Affected") {
                        var satVapor = hPa.value * Math.exp((beta.value * tempInCAffected) / (temp.value + tempInCAffected))
                        affectedRH.day[dateIndex].value = `${(affectedVapor.day[dateIndex].value / satVapor * 100).toFixed(2)}%`
                        psychrometricData.value["Affected"].info.relativeHumidity = `${(affectedVapor.day[dateIndex].value / satVapor * 100).toFixed(2)}%`
                    }
                    if (item.identifier === "relativeHumidity" && label === "Unaffected") {
                        var satVapor = hPa.value * Math.exp((beta.value * tempInCUnaffected) / (temp.value + tempInCUnaffected))
                        unaffectedRH.day[dateIndex].value = `${(unaffectedVapor.day[dateIndex].value / satVapor * 100).toFixed(2)}%`
                        psychrometricData.value["Unaffected"].info.relativeHumidity = `${(unaffectedVapor.day[dateIndex].value / satVapor * 100).toFixed(2)}%`
                    }
                    if (item.identifier === "relativeHumidity" && label === "Exterior") {
                        var satVapor = hPa.value * Math.exp((beta.value * tempInCExterior) / (temp.value + tempInCExterior))
                        exteriorRH.day[dateIndex].value = `${(exteriorVapor.day[dateIndex].value / satVapor * 100).toFixed(2)}%`
                        psychrometricData.value["Exterior"].info.relativeHumidity = `${(exteriorVapor / satVapor * 100).toFixed(2)}%`
                    }
                })
            }
        }
        function calcVapor(ggp) {
            const closest = vaporToGGP.value.reduce((a,b) => {
                return Math.abs(b.humidityRatio - ggp) < Math.abs(a.humidityRatio - ggp) ? b : a;
            })
            return closest.vaporPressure.toString()
        }
        function disableDates(curindex) {
            var dateOfRow = new Date(dateRanges.value[curindex])
            dateOfRow.setHours(0,0,0,0)
            var today = new Date(currentDate.value)
            today.setHours(0,0,0,0)
            if (dateOfRow.getTime() !== today.getTime()) {
                return true
            } else {
                return false
            }
        }
        function addDays(d, days) {
            const date = new Date(d);
            date.setDate(date.getDate() + days);
            return date;
        }
        async function submitForm() {
            const reports = getReports.value.filter((v) => {
                return v.ReportType === 'atmospheric-readings'
            })
            const jobids = reports.map((v) => {
                return v.JobId
            })
            await submitPsychrometic().then(() => {
                form.value.validate().then(success => {
                    if (!success) {
                        submitting.value = false
                        errorDialog.value = true
                        return
                    }
                    onSubmit().then((result) => {
                        submittedMessage.value = result.message
                        html2Pdf0.value.generatePdf()
                    })
                })
            }).catch(err => {
                console.log("Error ", err)
                errorMessage.value = err
                return
            })
        }
        function onSubmit() {
            submitting.value = true
            const post = {
                JobId: selectedJobId.value,
                ReportType: "atmospheric-readings",
                startDate: initDateFormatted.value,
                endDate: endDateFormatted.value,
                formType: "logs-report",
                readingsLog: readingsArr.value,
                lossClassification: lossArr.value,
                categoryData: catArr.value,
                notes: notes.value,
                teamMember: getUser.value
            };
            postedData.value = post
            return new Promise((resolve, reject) => {
                /* $api.$put(`/api/reports/atmospheric-readings/${selectedJobId.value}/update`, post).then((res) => {
                    submitting.value = false
                    submitted.value = true
                    fetchReports()
                    resolve(res)
                }).catch(err => {
                    errorDialog.value = true
                    submitting.value = false
                    reject(err)
                    if (err.response) {
                        console.error(err.response.data)
                    }
                }) */
                resolve(true)
            })
        }
        async function submitPsychrometic() {
            let filteredResults = []
            for (const property in groupingData.value) {
                if (property)
                groupingData.value[property].forEach((item) => {
                    for (let i = 0; i < item.day.length; i++) {
                        if (filteredResults.filter(el => el.readingsType == property && el.date == item.day[i].date).length == 0 && property !== undefined) {
                            let hrI = groupingData.value[property].findIndex(el => el.identifier == "humidityRatio")
                            let tempI = groupingData.value[property].findIndex(el => el.identifier == "dryBulbTemp")
                            let dpI = groupingData.value[property].findIndex(el => el.identifier == "dewPoint")
                            let vpI = groupingData.value[property].findIndex(el => el.identifier == "vaporPressure")
                            let rhI = groupingData.value[property].findIndex(el => el.identifier == "relativeHumidity")
                            console.log(vpI)
                            filteredResults.push({
                                info: {
                                    "dryBulbTemp": parseFloat(groupingData.value[property][tempI].day[i].value),
                                    "humidityRatio": parseFloat(groupingData.value[property][hrI].day[i].value),
                                    "dewPoint": parseFloat(groupingData.value[property][dpI].day[i].value),
                                    "vaporPressure": groupingData.value[property][vpI].day[i].value.toString(),
                                    "relativeHumidty": groupingData.value[property][rhI].day[i].value.toString(),
                                },
                                readingsType: property,
                                date: item.day[i].date
                            })
                        }
                    }
                    
                    
                    
                    /* let groupByDate = item.day.filter(d => d.value !== "").map((x) => {
                        const p = {
                            info: {
                                [property]: x.value
                            },
                            date: x.date
                        }
                        return p
                    })
                    console.log(groupByDate) */
                    /* item.day.forEach((d) => {
                        var obj = {
                            dryBulbTemp: d.value,
                            humidityRatio: data.y,
                            dewPoint: dewPoint.value + '%',
                            vaporPressure: vaporPressure.value,
                            relativeHumidity: RH.value
                        }
                    }) */
                    /* var filteredResults = item.day.filter(d => d.date === currentDate.value && d.value !== "")
                    if (filteredResults.length > 0) {
                        if (item.identifier == "dryBulbTemp" || item.identifier == "humidityRatio") {
                            psychrometricData.value[property].info[item.identifier] = parseFloat(filteredResults[0].value)
                        } else {
                            psychrometricData.value[property].info[item.identifier] = filteredResults[0].value.toString()
                        }
                        psychrometricData.value[property].date = filteredResults[0].date
                        psychrometricData.value[property].color = colors.value[dateIndex.value]
                    } */
                })
            }
            console.log("job progress: ", filteredResults)
            var promises = []
            for (const property in psychrometricData.value) {
                if (psychrometricData.value[property].color === "") {
                    // this is to make sure not to submit empty data
                    delete psychrometricData.value[property]
                }
                const psychrometricPost = {
                    JobId: selectedJobId.value,
                    teamMember: getUser.value,
                    jobProgress: psychrometricData.value[property],
                    formType: 'chart-report',
                    ReportType: 'psychrometric-chart'
                }
                promises.push(psychrometricPost)
            }
            return new Promise((resolve, reject) => {
                Promise.all(promises).then((item) => {
                    let filteredArr = item.filter(r => r.jobProgress !== undefined)
                    //console.log(filteredArr)
                    filteredArr.forEach((item) => {
                            let updateReading = (readingsType.value[item.jobProgress.readingsType] !== undefined
                                && readingsType.value[item.jobProgress.readingsType].find(el => el.date === currentDate.value) !== undefined)
                            //var newDateProgress = this.readingsType[item.jobProgress.readingsType].find(el => el.date === jobProgressDate) === undefined
                            /* if (updateReading) {
                                $api.$post(`/api/reports/psychrometric-chart/update-progress`, item).then((res) => {
                                    submittedMessage.value = res
                                })
                            } else {
                                $api.$post(`/api/reports/psychrometric-chart/update-chart`, item).then((res) => {
                                    submittedMessage.value = res
                                })
                            } */
                        })
                      resolve("Updated psychrometric chart")
                }).catch(err => {
                    reject(err)
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
            isLoading.value = true
            $api.$get(`/api/reports/details/atmospheric-readings/${val}`).then((res) => {
                isLoading.value = false
                reportFetched.value = true
                initDateFormatted.value = res.startDate
                emit("date", res.startDate)
                endDateFormatted.value = res.endDate
                readingsArr.value = res.readingsLog
                lossArr.value = res.lossClassification
                catArr.value = res.categoryData
                notes.value = res.notes
                reportId.value = res.Id
            }).catch((error) => {
                isLoading.value = false
                initDateFormatted.value = formatDate(new Date().toISOString().substring(0, 10))
                endDateFormatted.value = formatDate(addDays(new Date(), 6).toISOString().substring(0, 10))
                readingsArr.value.forEach((item, i) => {
                    item.day.forEach((d, j) => {
                        d.value = ""
                    })
                })
                lossArr.value.forEach((item, i) => {
                    item.day.forEach((d, j) => {
                        d.value = ""
                    })
                })
                catArr.value.forEach((item, i) => {
                    item.day.forEach((d, j) => {
                        d.value = ""
                    })
                })
                notes.value = ""
                reportFetched.value = false
                reportId.value = ""
            })

            $api.$get(`/api/reports/details/psychrometric-chart/${val}`).then((res) => {
                fetchedPsychometric.value = res
                readingsType.value = groupByKey(res.jobProgress, "readingsType")
                initDate.value = new Date(res.jobProgress[0].date).toISOString().substring(0, 10)
                endDate.value = addDays(new Date(res.jobProgress[0].date).toISOString().substring(0, 10), 6).toISOString().substring(0, 10)
            }).catch((error) => {
                error.value = true
                fetchedPsychometric.value = {}
            })
        })

        return {
            readingsArr,
            lossArr,
            catArr,
            errorDialog,
            submittedMessage,
            submitting,
            submitted,
            errorMessage,
            selectedJobId,
            initDate,
            initDateFormatted,
            endDate,
            endDateFormatted,
            initDateModal,
            endDateModal,
            notes,
            reportFetched,
            warningDialog,
            psychrometricData,
            colors,
            hPa,
            beta,
            temp,
            vapor,
            tempInC,
            Dp,
            readingsType,
            fetchedPsychometric,
            currentDate,
            error,
            reportId,
            isLoading,
            getUser,
            getReports,
            groupingData,
            dateRanges,
            calculationsDp,
            submitForm,
            htmlToPdfOptions,
            beforeDownloadNoSave,
            uploadPdf,
            postedData,
            parseDate,
            form,
            html2Pdf0,
            dateIndex
        }
    }
})
</script>
<style lang="scss">
.reading-logs {
    grid-template-rows:50px repeat(18, 1fr);
    .row-heading .form__table--cols {
        grid-column: 1/4 span;
        border:0;
    }
}
</style>