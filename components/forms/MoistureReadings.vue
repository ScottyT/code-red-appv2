<template>
    <div class="form-wrapper">
        <h1 class="text-center">{{company}}</h1>
        <h3 class="text-center">MOISTURE READING MAP READINGS</h3>
        <v-overlay :value="isLoading" v-show="isLoading" light>
            <v-progress-circular indeterminate size="64"></v-progress-circular>
        </v-overlay>
        <ValidationObserver ref="form" v-slot="{ errors }">
            <v-dialog width="400px" v-model="errorDialog">
                <div class="modal__error">
                    <div v-for="(error, i) in errors" :key="`error-${i}`">
                        <h3 class="form__input--error">{{ error[0] }}</h3>
                    </div>
                </div>
            </v-dialog>
            <p class="font-weight-bold">{{submittedMessage}}</p>
            <form class="form" v-if="!submitted" @submit.prevent="submitForm">
                <div class="form__form-group">
                    <ValidationProvider vid="JobId" v-slot="{errors, ariaMsg}" name="Job ID" class="form__input-group form__input-group--normal">
                        <input type="hidden" v-model="selectedJobId" />
                        <label class="form__label">Job ID:</label>
                        <i class="form__select--icon icon--angle-down mdi" aria-label="icon"></i>
                        <select class="form__input" v-model="selectedJobId">
                            <option disabled value="">Please select a Job ID</option>
                            <option v-for="(item, i) in $store.state.reports.jobids" :key="`jobids-${i}`">{{item}}</option>
                        </select>
                        <span class="form__input--error" v-bind="ariaMsg">{{ errors[0] }}</span>
                    </ValidationProvider>
                    <ValidationProvider vid="evalDate" name="Initial date of evaluation" rules="required" v-slot="{errors, ariaMsg}" class="form__input-group form__input-group--short">
                        <label class="form__label" for="evalDate">Initial Date of Evaluation</label>
                        <input type="hidden" v-model="initialEvalDateFormatted" />
                        <v-dialog ref="initEvalDateDialog" v-model="initEvalDateModal" :return-value.sync="initialEvalDate" persistent width="500px">
                            <template v-slot:activator="{on, attrs}">
                                <input id="evalDate" v-model="initialEvalDateFormatted" v-bind="attrs" readonly class="form__input" v-on="on"
                                    @blur="initialEvalDate = parseDate(initialEvalDateFormatted)" />
                            </template>
                            <v-date-picker v-model="initialEvalDate" scrollable>
                                <v-spacer></v-spacer>
                                <v-btn text color="#fff" @click="initEvalDateModal = false">Cancel</v-btn>
                                <v-btn text color="#fff" @click="$refs.initEvalDateDialog.save(initialEvalDate)">OK</v-btn>
                            </v-date-picker>
                        </v-dialog>
                        <span class="form__input--error" v-bind="ariaMsg">{{ errors[0] }}</span>
                    </ValidationProvider>
                    <div class="form__input-group form__input-group--long">
                        <label for="location" class="form__label">Location</label>
                        <UiGeoCoder @sendAddress="settingLocation($event)" :mapView="false" geocoderid="geocoder" geocoderef="geocoder" />
                    </div>
                    <ValidationProvider vid="address" name="Address" rules="required" v-slot="{errors, ariaMsg}" class="form__input-group form__input-group--long">
                        <label for="address" class="form__label">Address</label>
                        <input id="address" v-model="location.address" name="Address" type="text" class="form__input form__input--long" />
                        <span class="form__input--error" v-bind="ariaMsg">{{ errors[0] }}</span>
                    </ValidationProvider>
                    <ValidationProvider vid="cityStateZip" name="City, State, and Zip" rules="required" v-slot="{errors, ariaMsg}" class="form__input-group form__input-group--long">
                        <label for="citystatezip" class="form__label">City, State, Zip</label>
                        <input id="citystatezip" v-model="location.cityStateZip" type="text" class="form__input form__input--long" />
                        <span class="form__input--error" v-bind="ariaMsg">{{ errors[0] }}</span>
                    </ValidationProvider>
                </div>
                <div class="form__form-group area-sub-group">
                    <div class="form__input-group form__input-group--long" v-for="(subarea, i) in subAreas" :key="`subarea-${i}`">
                        <label class="form__label">Area Sub-{{i+1}}</label>
                        <input :id="`areaSub${i}`" class="form__input" v-model="subarea.areaName" @click="openTable(i)" />
                        <transition name="table-slide">
                            <div class="area-sub-group__table" v-if="active === i">
                                <div class="area-sub-group__table--row">
                                    <div class="area-sub-group__table--cols">
                                        <label class="form__label">Date:</label>
                                    </div>
                                    <div class="area-sub-group__table--cols" v-for="(col, k) in subarea.areaCols" :key="`col-${k}`">
                                        <label class="form__label">Area {{col}} %</label>
                                    </div>
                                </div>
                                <div class="area-sub-group__table--row" v-for="(row, k) in subAreas[i].areas" :key="`row-${k}`">
                                    <div class="area-sub-group__table--cols">
                                        <input type="text" v-mask="'##/##/####'" v-model="row.date" class="form__input" />
                                    </div>
                                    <div class="area-sub-group__table--cols" v-for="(area, l) in row.area" :key="`input-${l}`">
                                        <span class="number-input"><input type="number" maxlength="3" v-model="row.area[l].val" class="form__input" /></span>                                       
                                    </div>
                                    <button class="button--normal" type="button" @click="addColumn(row.area, i, k)">+</button>
                                </div>
                                <button class="button--normal" type="button" @click="addRow(`row${subarea.areas.length}`, `sub${i}`, i, 'area-readings')">Add row</button>
                                <!-- <button class="button--normal" type="button" @click="addColumn(subarea.areas[0].area, i)">Add column</button> -->
                            </div>
                        </transition>
                    </div>
                    <button class="button--normal" type="button" @click="addSub(`sub${subAreas.length}`, subAreas.length)">Add new sub area</button>
                </div>
                <div class="form__form-group area-sub-group">
                    <div class="form__input-group form__input-group--long">
                        <label for="baseLine" class="form__label">Base Line Comparitive Readings (Non-Affected)</label>
                        <div class="area-sub-group__table">
                            <div class="area-sub-group__table--row">
                                <div class="area-sub-group__table--cols">
                                    <label class="form__label">Date:</label>
                                </div>
                                <div class="area-sub-group__table--cols" v-for="(subarea, i) in subAreas" :key="i">
                                    <label class="form__label">Area Sub-{{i+1}} %</label>
                                </div>
                            </div>
                            <div class="area-sub-group__table--row" v-for="(row, j) in baseline" :key="`base-${j}`">
                                <div class="area-sub-group__table--cols">
                                    <input type="text" v-mask="'##/##/####'" v-model="row.date" class="form__input" />
                                </div>
                                <div class="area-sub-group__table--cols" v-for="(col, i) in row.subareas"
                                     :key="`cols-${i}`">
                                    <span class="number-input"><input type="text" maxlength="3" v-model="col.val"
                                               class="form__input" /></span>
                                </div>
                            </div>
                            <button class="button--normal" type="button" 
                                @click="addRow(`baseline${baseline.length - 1}`,`baseline${baseline.length - 1}`, baseline.length, 'baseline-readings')">Add row</button>
                        </div>
                    </div>
                </div>
                <LayoutMoistureCompare :width="860" :height="700" :jobid="selectedJobId" :existingChart="baseline" />
                <!-- <button type="button" class="button--normal" @click="updateChart">Update</button> -->
                <div class="form__section">
                    <ValidationProvider vid="notes" name="Notes" rules="required" v-slot="{errors, ariaMsg}" class="form__input--input-group">
                        <label class="form__label" for="notes">Notes:</label>
                        <textarea id="notes" class="form__input form__input--textarea" v-model="notes"></textarea>
                        <span class="form__input--error" v-bind="ariaMsg">{{ errors[0] }}</span>
                    </ValidationProvider>
                </div>
                <div class="form__form-group">
                    <UiFilesUpload :singleImage="false" path="moisture-images" subDir="" :rootPath="selectedJobId" @uploadDone="uploaded = $event" @sendDownloadUrl="uploadedFiles = $event" />
                </div>
                <button type="submit" class="button button--normal" v-show="!reportFetched">{{ submitting ? 'Submitting' : 'Submit' }}</button>
                <v-dialog width="400px" v-model="warningDialog">
                    <template v-slot:activator="{on, attrs}">
                        <button v-show="reportFetched" type="button" v-bind="attrs" class="button button--normal" v-on="on">Update</button>
                    </template>
                    <div class="modal__content">
                        <p>You are about to overwrite this report. This is irreversable. Are you sure you want to submit?</p>                       
                    </div>
                    <div class="modal__footer">
                        <button class="button--normal" type="submit" @click="submitForm">Yes</button>
                        <button class="button--normal" type="button" @click="warningDialog = false">Cancel</button>
                    </div>
                </v-dialog>
            </form>
        </ValidationObserver>
        <div>
                <vue-html2pdf :pdf-quality="2" pdf-content-width="100%" :html-to-pdf-options="htmlToPdfOptions('moisture-map', selectedJobId)" :paginate-elements-by-height="800" :manual-pagination="false"
                    :show-layout="false" :enable-download="false" @hasDownloaded="uploadPdf($event, `moisture-map-${selectedJobId}`, selectedJobId)" 
                    @beforeDownload="beforeDownloadNoSave($event, `moisture-map-${selectedJobId}`, selectedJobId)" :preview-modal="true" ref="html2Pdf0">
                        <LayoutMoistureMapDetails slot="pdf-content" :reportName="postedData.ReportType" :report="postedData" company="Water Emergency Services Incorporated"
                            :pdf="true" :loaded="chartCreated" :existingChart="baseline" />
                </vue-html2pdf>
        </div>
    </div>
</template>
<script>
import {mapActions, mapGetters} from 'vuex';
import genericFuncs from '@/composable/utilityFunctions'
import useReports from '@/composable/reports'
import { dateMask } from "@/data/masks";
import { defineComponent, ref, computed, watch, useStore, useContext } from '@nuxtjs/composition-api';
export default defineComponent({
    props: {
        company: String,
        abbreviation: String
    },
    setup(props) {
        const store = useStore()
        const { $api } = useContext()
        const fetchReports = () => { store.dispatch("reports/fetchReports") }
        const { formatDate, parseDate } = genericFuncs()
        const { htmlToPdfOptions, beforeDownloadNoSave, uploadPdf } = useReports()
        const errorDialog = ref(false)
        const uploading = ref(false)
        const submittedMessage = ref("")
        const errorMessage = ref("")
        const submitted = ref(false)
        const submitting = ref(false)
        const selectedJobId = ref("")
        const uploadedFiles = ref([])
        const initialEvalDate = new Date().toISOString().substr(0, 10)
        const initialEvalDateFormatted = formatDate(new Date().toISOString().substr(0, 10))
        const initEvalDateModal = ref(false)
        const location = ref({
            address: null,
            city: null,
            cityStateZip: null,
        })
        const areaCols = ref(["A"])
        const subAreas = ref([
            {
                areaCols: ["A"],
                subLabel: 'sub0',
                areaName: "",
                reading: "",
                areas: [
                    {
                        date: "",
                        label: "row0",
                        area: [
                            {
                                label: 'A',
                                val: ''
                            }
                        ]
                    }
                ],
            }
        ])
        const baseline = ref([
            {
                date: '',
                subareas: [{label: "sub1", val: ""}],
                label: 'baseline0'
            }
        ])
        const uploadProgress = ref("")
        const uploadMessage = ref("")
        const filesUpload = ref([])
        const notes = ref('')
        const disabled = ref(false)
        const tables = ref([false, false, false])
        const active = ref(null)
        const reportFetched = ref(false)
        const warningDialog = ref(false)
        const loaded = ref(false)
        const uploaded = ref(false)
        const isLoading = ref(false)
        const form = ref(null)
        const html2Pdf0 = ref(null)
        const postedData = ref({})
        const chartCreated = ref(false)

        const getUser = computed(() => store.getters["users/getUser"])
        const getReports = computed(() => store.getters["reports/getReports"])
        const date = computed(() => {
            const today = new Date()
            return (today.getMonth() + 1)+'-'+today.getUTCDate()+'-'+today.getFullYear();
        })

        function updateChart() {
            emit('updatingChart', baseline.value)
            loaded.value = false
            setTimeout(() => {
                loaded.value = true
            }, 500)
        }
        function addDays(d, days) {
            if (d === undefined) return
            const date = new Date(d);
            
            date.setDate(date.getDate() + days);
            return date;
        }
        function addRow(area, subarea, subIndex, areaType) {
            switch (areaType) {
                case "area-readings":
                    var sub = subAreas.value.find(el => el.subLabel === subarea)
                    if (sub.areas[sub.areas.length - 1].date === "") {
                        alert("You must add a date for sub area row.")
                        break;
                    }
                    var cols = []
                    subAreas.value[subIndex].areaCols.forEach((col) => {
                        cols.push({label: col, val: ''})
                    })
                    var nextDate = formatDate(addDays(sub.areas[sub.areas.length - 1].date, 1).toISOString().substr(0,10))
                    sub.areas.push({ date: nextDate,label: area,area: cols })
                    break;
                case "baseline-readings":
                    var baselineRow = baseline.value.find(el => el.label === area)
                    if (baselineRow.date === "") {
                        alert("You must add a date for sub area row.")
                        break;
                    }
                    var cols = []
                    baselineRow.subareas.forEach((item) => {
                        cols.push({label: `sub${subIndex+1}`, val: ""})
                    })
                    baseline.value.push({date: "", label: `baseline${subIndex}`, subareas: cols})
                    break;
            }           
        }
        function addSub(sub, index) {
            subAreas.value.push({
                subLabel: sub,
                areaName: "",
                areaCols: ["A"],
                areas: [
                    {
                        date: "",
                        label: "row0",
                        area: [
                            {
                                label: 'A',
                                val: ''
                            }
                        ]
                    }
                ],
            })
            var subColLabels = []
            subAreas.value.forEach((item) => {
                subColLabels.push(item.subLabel)
            })
            baseline.value.forEach((col) => {
                col.subareas.push({label: subColLabels[index], val: ""})
            })
        }
        function addColumn(colArr, subIndex, rowIndex) {
            var char2 = new Array(27)
            var char1 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
            char2 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')
            char2.unshift('')
            
            var result = []
            for (var i=0;i<char2.length;i++) {
                for (var j=0;j<char1.length;j++) {
                    result.push(char2[i] + char1[j])
                }
            }
            
            var colToAdd = result[colArr.length]
            if (!subAreas.value[subIndex].areaCols.includes(colToAdd)) {
                subAreas.value[subIndex].areaCols.push(colToAdd)
            }
            if (!areaCols.value.includes(colToAdd)) {
                areaCols.value.push(colToAdd)
            }

            subAreas.value[subIndex].areas[rowIndex].area.push({label: result[colArr.length], val: ""})
        }
        async function submitForm() {
            const reports = getReports.value.filter((v) => {
                return v.ReportType === 'moisture-map'
            })
            const jobids = reports.map((v) => {
                return v.JobId
            })
            await form.value.validate().then(success => {
                if (!success) {
                    submitting.value = false
                    errorDialog.value = true
                    return;
                }
                Promise.all([onSubmit()]).then((result) => {
                    submittedMessage.value = result[0]
                    console.log(result)
                    chartCreated.value = true
                    html2Pdf0.value.generatePdf()
                }).catch(error => console.log(`Error in promises ${error}`))
            })
        }
        function onSubmit() {
            submittedMessage.value = ""
            const post = {
                JobId: selectedJobId.value,
                ReportType: "moisture-map",
                formType: "logs-report",
                initialEvalDate: initialEvalDateFormatted.value,
                baselineReadings: baseline.value,
                readingsRow: subAreas.value,
                location: location.value,
                notes: notes.value,
                teamMember: getUser.value
            };
            postedData.value = post
            chartCreated.value = true
            return new Promise((resolve, reject) => {
                $api.$put(`/api/reports/moisture-map/${selectedJobId.value}/update`, post).then((res) => {
                    submittedMessage.value = res
                    submitting.value = false
                    submitted.value = true
                    fetchReports()
                    resolve(res)
                }).catch(err => {
                    if (err.response) {
                        errorMessage.value = err.response.data.message
                        errorDialog.value = true
                        submitting.value = false
                        reject(err.response.data.message)
                    }
                })
            })
        }
        function openTable(index) {
            active.value = index
        }
        function settingLocation(params) {
            location.value.cityStateZip = params.cityStateZip
            location.value.address = params.address
        }

        return {
            errorDialog,
            uploading,
            submittedMessage,
            errorMessage,
            submitted,
            submitting,
            selectedJobId,
            uploadedFiles,
            initialEvalDate,
            initialEvalDateFormatted,
            initEvalDateModal,
            location,
            areaCols,
            subAreas,
            baseline,
            uploadProgress,
            uploadMessage,
            filesUpload,
            notes,
            disabled,
            tables,
            active,
            reportFetched,
            warningDialog,
            loaded,
            uploaded,
            isLoading,
            form,
            html2Pdf0,
            getUser,
            getReports,
            updateChart,
            addRow,
            addSub,
            addColumn,
            submitForm,
            htmlToPdfOptions,
            beforeDownloadNoSave,
            uploadPdf,
            parseDate,
            dateMask,
            postedData,
            openTable,
            settingLocation,
            chartCreated
        }
    }
})
</script>
<style lang="scss">
.moisture-map {
    @include respond(tabletLargeMax) {
        font-size:.95em;
    }
    .form__table--rows {
        grid-template-columns:100px repeat(12, 1fr);
    }
    input[type=text] {
        margin-bottom:0;
        @include respond(tabletLandscapeMax) {
            font-size:.9em;
            padding:2px 4px;
        }
    }
    .number-input {
        display:inline-block;
        @include respond(tabletLarge) {
            width:53px;
            input {
                padding:2px 4px;
            }
        }
        width:38px;
    }
}
.area-sub-group {
    flex-direction:column;
    &__table {
        width: 700px;
        height:auto;
        padding:10px 0;
        &--row {
            display:grid;
            grid-template-columns: 118px repeat(auto-fill, minmax(62px, 1fr));
            column-gap:15px;
            &:not(:first-child) {
                margin:7px 0;
            }
        }
    }
}
</style>