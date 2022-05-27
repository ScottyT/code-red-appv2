<template>
    <div id="form-wrapper" class="form-wrapper form-wrapper__general-history">
        <v-overlay :value="loading" v-show="loading" light>
            <v-progress-circular
                indeterminate
                size="64"
            ></v-progress-circular>
        </v-overlay>
        <h1 class="text-center">{{company}}</h1>
        <h2 class="text-center">General History Logs</h2>
        <ValidationObserver ref="form" v-slot="{errors}">
            <div v-for="item in message" :key="item">
                <h3 v-if="message.length > 0">{{item}}</h3>
            </div>
            <UiModal width="400px" :modalOpen="errorDialog" @close="errorDialog = $event">
                <template v-slot:body>
                    <div v-for="(error, i) in errors" :key="`error-${i}`">
                        <div class="modal__error" v-if="error.length > 0">
                            <h3 class="form__input--error">{{ error[0] }}</h3>
                        </div>
                    </div>
                </template>
            </UiModal>
            <form class="form" @submit.prevent="submitForm" v-if="!submitted">
                <div class="form__form-group">
                    <ValidationProvider rules="required" v-slot="{errors, ariaMsg}" name="Job ID" class="form__input-group form__input-group--normal">
                        <input type="hidden" v-model="selectedJobId" />
                        <label class="form__label">Job ID:</label>
                        <i class="form__select--icon icon--angle-down mdi" aria-label="icon"></i>
                        <select class="form__input" v-model="selectedJobId">
                            <option disabled value="">Please select a Job ID</option>
                            <option v-for="(item, i) in $store.state.reports.jobids" :key="`jobids-${i}`">{{item}}</option>
                        </select>
                        <span class="form__input--error" v-bind="ariaMsg">{{ errors[0] }}</span>
                    </ValidationProvider>
                    <ValidationProvider name="Customer First Name" class="form__input-group form__input-group--normal">
                        <label class="form__label">Customer First Name</label>
                        <input type="text" class="form__input" v-model="report.cusFirstName" />
                    </ValidationProvider>
                    <ValidationProvider name="Customer First Name" class="form__input-group form__input-group--normal">
                        <label class="form__label">Customer Last Name</label>
                        <input type="text" class="form__input" v-model="report.cusLastName" />
                    </ValidationProvider>
                    <ValidationProvider name="Customer Phone Number" class="form__input-group form__input-group--normal">
                        <label class="form__label">Customer Phone Number</label>
                        <input type="text" class="form__input" v-model="report.PhoneNumber" />
                    </ValidationProvider>
                    <ValidationProvider name="Customer Email" class="form__input-group form__input-group--normal">
                        <label class="form__label">Customer Email</label>
                        <input type="text" class="form__input" v-model="report.EmailAddress" />
                    </ValidationProvider>
                    <ValidationProvider :name="v" v-for="(key, v) in report.location" :key="key" class="form__input-group form__input-group--long">
                        <label class="form__label" v-uppercase>{{v}}</label>
                        <input type="text" class="form__input" v-model="report.location[v]" />
                    </ValidationProvider>
                    <ValidationProvider name="Insurance Company" class="form__input-group form__input-group--normal">
                        <label for="insuranceCompany" class="form__label">Insurance Company</label>
                        <input type="text" id="insuranceCompany" class="form__input" v-model="report.InsuranceCompany" />
                    </ValidationProvider>
                    <ValidationProvider name="Insurance Contact Name" class="form__input-group form__input-group--normal">
                        <label for="adjusterName" class="form__label">Insurance Contact Name</label>
                        <input type="text" id="adjusterName" class="form__input" v-model="report.adjusterName" />
                    </ValidationProvider>
                    <ValidationProvider name="Insurance Contact Phone" class="form__input-group form__input-group--normal">
                        <label for="adjusterPhone" class="form__label">Insurance Contact Phone #</label>
                        <input type="text" id="adjusterPhone" class="form__input" v-model="report.adjusterPhone" />
                    </ValidationProvider>
                    <ValidationProvider name="Insurance Contact Email" class="form__input-group form__input-group--normal">
                        <label for="adjusterEmail" class="form__label">Insurance Contact Email</label>
                        <input type="text" id="adjusterEmail" class="form__input" v-model="report.adjusterEmail" />
                    </ValidationProvider>
                    <ValidationProvider name="ClaimNumber" class="form__input-group form__input-group--normal">
                        <label for="claimnumber" class="form__label">Claim #</label>
                        <input type="text" id="claimnumber" class="form__input" v-model="report.ClaimNumber" />
                    </ValidationProvider>
                    <ValidationProvider name="PolicyNumber" class="form__input-group form__input-group--normal">
                        <label for="policynumber" class="form__label">Policy #</label>
                        <input type="text" id="policynumber" class="form__input" v-model="report.PolicyNumber" />
                    </ValidationProvider>
                </div>
                <div class="form__form-group flex">
                    <div class="payments-received">
                        <h2>Payments Received and Dates and Amounts</h2>
                        <div class="payments-received__table">
                            <div class="payments-received__table--header payments-received__table--row">
                                <div class="payments-received__table--col" v-for="(colheader, i) in paymentsArrHeaders" :key="`${colheader}-${i}`">
                                    {{colheader.label}}
                                </div>
                            </div>
                            <div class="payments-received__table--row" v-for="(row, i) in payments" :key="`row-${i}`">
                                <div class="payments-received__table--col" v-for="(col, j) in paymentsArrHeaders" :key="`col-${j}-row-${i}`">
                                    <span class="form__input--currency" v-if="col.id == 'amount'">
                                        <span class="ma-0">$</span><input type="text" class="form__input form__input--short" v-model="row[col.id]"
                                            @keypress="currencyFormat" />
                                    </span>
                                    <imask-input v-else-if="col.id == 'date'" @complete="row[col.id] = $event" :lazy="false" :blocks="dateMask.blocks" :mask="dateMask.mask"
                                        :format="dateMask.format" :parse="dateMask.parse" :pattern="dateMask.pattern" class="form__input" v-model="row['date']" />
                                    <input v-else type="text" class="form__input" v-model="row[col.id]" />
                                </div>
                            </div>
                        </div>
                        <button class="button--normal" type="button" @click="addRow('payments')">Add Row</button>
                    </div>
                    <div class="pa-4">
                        <ValidationProvider rules="required" v-slot="{errors}" name="Start Job Date" class="form__input-group form__input-group--normal">
                            <input type="hidden" v-model="startOfJob" />
                            <label class="form__label">Start of Job Date</label>
                            <UiDatePicker dateId="startDate" dialogId="startDateDialog" :existingDate="startOfJob" @date="startOfJob = $event" />
                            <span class="form__input--error">{{ errors[0] }}</span>
                        </ValidationProvider>
                        <ValidationProvider rules="required" v-slot="{errors}" name="End Job Date" class="form__input-group form__input-group--normal">
                            <input type="hidden" v-model="endOfJob" />
                            <label class="form__label">End of Job Date</label>
                            <UiDatePicker dateId="endDate" dialogId="endDateDialog" :existingDate="endOfJob" @date="endOfJob = $event" />
                            <span class="form__input--error">{{ errors[0] }}</span>
                        </ValidationProvider>
                        <ValidationProvider rules="required" v-slot="{errors}" name="Initial Email Sent" class="form__input-group form__input-group--normal">
                            <input type="hidden" v-model="initialEmailSentDate" />
                            <label class="form__label">Initial Email Sent</label>
                            <UiDatePicker dateId="emailSentDate" dialogId="emailSentDateDialog" :existingDate="initialEmailSentDate" @date="initialEmailSentDate = $event" />
                            <span class="form__input--error">{{ errors[0] }}</span>
                        </ValidationProvider>
                    </div>
                </div>
                <div class="form__form-group form__form-group--column">
                    <h2>Logs</h2>
                    <div class="form__table form__table--logs">
                        <div class="form__table--rows form__table--rows--logs">
                            <div class="form__table--cols" v-for="(colheader, i) in logsHeader" :key="`logsheader-${i}`">
                                {{colheader.label}}
                            </div>
                        </div>
                        <div class="form__table--rows form__table--rows--logs" v-for="(row, i) in logs" :key="`logsrow-${i}`">
                            <div class="form__table--cols" v-for="(col, j) in logsHeader" :key="`logscol-${j}`">
                                <imask-input v-if="col.id == 'date'" @complete="row[col.id] = $event" :lazy="false" :blocks="dateMask.blocks" :mask="dateMask.mask"
                                    v-model="row['date']" :format="dateMask.format" :parse="dateMask.parse" :pattern="dateMask.pattern" class="form__input" />
                                <imask-input v-else-if="col.id == 'time'" v-model="row['time']" :lazy="false" :mask="timeMask.mask" :blocks="timeMask.blocks" class="form__input" />
                                <span class="relative" v-else-if="col.id == 'typeOfCommunication'">
                                    <i class="form__select--icon icon--angle-down mdi" aria-label="icon"></i>
                                    <select class="form__input" v-model="row[col.id]">
                                        <option disabled value="">Choose type</option>
                                        <option v-for="item in communicationTypes" :key="item">{{item}}</option>
                                    </select>
                                </span>
                                <input v-else type="text" class="form__input" v-model="row[col.id]" />
                            </div>
                        </div>
                    </div>
                    <button class="button--normal" type="button" @click="addRow('logs')">Add Row</button>
                </div>
                <button type="submit" class="button button--normal">{{ submitting ? 'Submitting' : 'Submit' }}</button>
            </form>
        </ValidationObserver>
        <vue-html2pdf :pdf-quality="2" pdf-content-width="100%" :html-to-pdf-options="htmlToPdfOptions('general-history', selectedJobId)"
            :paginate-elements-by-height="800" :manual-pagination="false" :show-layout="false" :enable-download="false" :preview-modal="true"
            @beforeDownload="beforeDownloadNoSave($event, `general-history-${selectedJobId}`, selectedJobId)"
            @hasDownloaded="uploadPdf($event, `general-history-${selectedJobId}`, selectedJobId)" ref="html2Pdf0">
            <PdfGeneralHistory slot="pdf-content" :jobid="selectedJobId" :report="postedData" company="Water Emergency Services Incorporated" abbreviation="WESI" />
        </vue-html2pdf>
    </div>
</template>
<script>
import { computed, defineComponent, ref, useContext, useStore, watch } from '@nuxtjs/composition-api'
import useReports from '~/composable/reports'
import useScroll from '~/composable/scrollTo'
import genericFuncs from '~/composable/utilityFunctions'
import { dateMask, timeMask } from "@/data/masks";

export default defineComponent({
    props: {
        company: String,
        abbreviation: String
    },
    setup(props) {
        const store = useStore()
        const { $api } = useContext()
        const { scroll, y } = useScroll()
        const { getReportPromise, htmlToPdfOptions, uploadPdf, beforeDownloadNoSave, loading, report, errorMessage, message } = useReports()
        const fetchReports = () => { store.dispatch("reports/fetchReports") }
        const { currencyFormat, formatDate } = genericFuncs()
        const submitted = ref(false)
        const submitting = ref(false)
        const selectedJobId = ref("")
        const errorDialog = ref(false)
        const successDialog = ref(false)
        const paymentsArrHeaders = [
            {id: "paymentType", label:"Payment Type"}, 
            {id: "amount", label: "Amount"}, 
            {id: "date", label: "Date"},
            {id: "keyNotes", label: "Key Notes About Payment"}]
        const payments = ref([
            {
                paymentType: "",
                amount: "",
                date: "",
                keyNotes: ""
            }
        ])
        const communicationTypes = [
            "Email", "Phone", "Return Call", "Outbound Call", "Inbound Call", "Voicemail", "Text Message", "USPS Mail"
        ]
        const logsHeader = [
            {id: "date", label:"Date"},
            {id: "time", label:"Time"},
            {id: "typeOfCommunication", label:"Type of Communication"},
            {id: "codeRedRepsName", label:"Code Red Rep's Name"},
            {id: "communicationWith", label:"Communication with"},
            {id: "summaryNotes", label:"Brief Summary Notes"},
            {id: "communicationRecords", label:"Communication Records"},
        ]
        const logs = ref([
            {
                date: "",
                time: "",
                typeOfCommunication: "",
                codeRedRepsName: "",
                communicationWith: "",
                summaryNotes: "",
                communicationRecords: ""
            }
        ])
        const startOfJob = ref(new Date().toISOString().substring(0, 10))
        const endOfJob = ref(new Date().toISOString().substring(0, 10))
        const initialEmailSentDate = ref(formatDate(new Date().toISOString().substring(0, 10)))
        const fetchedGeneralHistory = ref(false)
        const form = ref(null)
        const html2Pdf0 = ref(null)
        const postedData = ref({})

        function addRow(arr) {
            switch (arr) {
                case 'payments':
                    payments.value.push({
                        paymentType: "",
                        amount: "",
                        date: "",
                        keyNotes: ""
                    })
                    break;
                case 'logs':
                    logs.value.push({
                        date: "",
                        time: "",
                        typeOfCommunication: "",
                        codeRedRepsName: "",
                        communicationWith: "",
                        summaryNotes: "",
                        communicationRecords: ""
                    })
                    break;
            }
        }
        async function submitForm() {
            await form.value.validate().then(success => {
                if (!success) {
                    submitting.value = false
                    submitted.value = false
                    errorDialog.value = true
                    scroll()
                    return
                }
                onSubmit().then((result) => {
                    submitting.value = false
                    submitted.value = true
                    html2Pdf0.value.generatePdf()
                    scroll()
                })
            })
        }
        function onSubmit() {
            message.value = []
            for (let i = 0; i < payments.value.length; i++) {
                payments.value[i].amount = parseFloat(payments.value[i]['amount'])
            }
            const post = {
                JobId: selectedJobId.value,
                customerFirstName: report.value.cusFirstName,
                customerLastName: report.value.cusLastName,
                customerPhoneNumber: report.value.PhoneNumber,
                customerEmail: report.value.EmailAddress,
                location: report.value.location,
                insuranceCompany: report.value.InsuranceCompany,
                adjusterName: report.value.adjusterName,
                adjusterPhoneNumber: report.value.adjusterPhone,
                adjusterEmail: report.value.adjusterEmail,
                claimNumber: report.value.ClaimNumber,
                policyNumber: report.value.PolicyNumber,
                payments: payments.value,
                startOfJob: startOfJob.value,
                endOfJob: endOfJob.value,
                initialEmailSentDate: initialEmailSentDate.value,
                logs: logs.value
            }
            submitting.value = true
            postedData.value = post
            return new Promise((resolve, reject) => {
                if (!fetchedGeneralHistory.value) {
                    $api.$post("/api/GeneralHistory/new", post).then((res) => {
                        message.value.push("General history log created!")
                        submitted.value = true
                        fetchReports()
                        resolve(res)
                    }).catch(err => {
                        reject(err)
                        if (err.response) {
                            errorMessage.value.push(err.response.data)
                        }
                    })
                } else {
                    $api.$put("/api/GeneralHistory/update", post).then((res) => {
                        message.value.push("General history logs have been updated!")
                        resolve(res)
                    }).catch(err => {
                        reject(err)
                        if (err.response) {
                            errorMessage.value.push(err.response.data)
                        }
                    })
                }
            })
        }

        watch(selectedJobId, (val) => {
            message.value = []
            getReportPromise(`rapid-response/${val}`)
            $api.$get(`/api/GeneralHistory/${val}`).then((res) => {
                fetchedGeneralHistory.value = true
                payments.value = res.payments
                startOfJob.value = res.startOfJob
                endOfJob.value = res.endOfJob
                initialEmailSentDate.value = res.initialEmailSentDate
                logs.value = res.logs
            }).catch(err => {
                fetchedGeneralHistory.value = false
            })
        })

        return {
            paymentsArrHeaders,
            logsHeader,
            dateMask,
            timeMask,
            communicationTypes,
            submitted,
            submitting,
            selectedJobId,
            loading,
            report,
            message,
            errorMessage,
            errorDialog,
            payments,
            addRow,
            startOfJob,
            endOfJob,
            initialEmailSentDate,
            logs,
            submitForm,
            fetchedGeneralHistory,
            successDialog,
            form,
            currencyFormat,
            beforeDownloadNoSave,
            uploadPdf,
            htmlToPdfOptions,
            html2Pdf0,
            postedData
        }
    },
})
</script>
<style lang="scss">
.payments-received {
    display:flex;
    flex-direction: column;
    .form__input {
        box-shadow:none;
        padding:2px;
    }
    &__table {
        max-width:600px;
        width:100%;
        height:auto;
        border:1px solid $color-black;
        &--header {
            height:50px;
        }
        &--row {
            display:grid;
            @include tableColumns(false, 130px 128px 100px 1fr, 4, 0);
            row-gap:10px;
            &:not(:first-child) {
                border-top:1px solid $color-black;
            }
        }
        &--col {
            display:flex;
            align-items:center;
            justify-content:center;
            height:100%;
            &:not(:first-child) {
                border-left:1px solid $color-black;
            }
        }
    }
}
</style>