<template>
    <div class="form-wrapper form-wrapper__general-history">
        <v-overlay :value="loading" v-show="loading" light>
            <v-progress-circular
                indeterminate
                size="64"
            ></v-progress-circular>
        </v-overlay>
        <h1 class="text-center">{{company}}</h1>
        <h2 class="text-center">General History Logs</h2>
        <ValidationObserver ref="form" v-slot="{errors, handleSubmit}">
            <div v-for="item in message" :key="item">
                <h3 v-if="message.length > 0">{{item}}</h3>
            </div>
            
            <v-dialog width="400px" v-model="errorDialog">
                <div class="modal__error">
                    <div v-for="(error, i) in errors" :key="`error-${i}`">
                        <h3 class="form__input--error">{{ error[0] }}</h3>
                    </div>
                </div>
            </v-dialog>
            <form class="form" @submit.prevent="handleSubmit(onSubmit)">
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
                                    <input type="text" class="form__input" v-model="row[col.id]" />
                                </div>
                            </div>
                        </div>
                        <button class="button--normal" @click="addRow('payments')">Add Row</button>
                    </div>
                    <div class="pa-4">
                        <ValidationProvider rules="required" v-slot="{errors}" name="Start Job Date" class="form__input-group form__input-group--normal">
                            <input type="hidden" v-model="startOfJob" />
                            <label class="form__label">Start of Job Date</label>
                            <UiDatePicker dateId="startDate" dialogId="startDateDialog" @date="startOfJob = $event" />
                            <span class="form__input--error">{{ errors[0] }}</span>
                        </ValidationProvider>
                        <ValidationProvider rules="required" v-slot="{errors}" name="End Job Date" class="form__input-group form__input-group--normal">
                            <input type="hidden" v-model="endOfJob" />
                            <label class="form__label">End of Job Date</label>
                            <UiDatePicker dateId="endDate" dialogId="endDateDialog" @date="endOfJob = $event" />
                            <span class="form__input--error">{{ errors[0] }}</span>
                        </ValidationProvider>
                        <ValidationProvider rules="required" v-slot="{errors}" name="Initial Email Sent" class="form__input-group form__input-group--normal">
                            <input type="hidden" v-model="initialEmailSentDate" />
                            <label class="form__label">Initial Email Sent</label>
                            <UiDatePicker dateId="emailSentDate" dialogId="emailSentDateDialog" @date="initialEmailSentDate = $event" />
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
                                    :format="dateMask.format" :parse="dateMask.parse" :pattern="dateMask.pattern" class="form__input" />
                                <imask-input v-else-if="col.id == 'time'" v-model="row[col.id]" :lazy="false" :mask="timeMask.mask" :blocks="timeMask.blocks" class="form__input" />
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
                    <button class="button--normal" @click="addRow('logs')">Add Row</button>
                </div>
                <button type="submit" class="button button--normal">{{ submitting ? 'Submitting' : 'Submit' }}</button>
            </form>
        </ValidationObserver>
    </div>
</template>
<script>
import { computed, defineComponent, ref, useContext, useStore, watch } from '@nuxtjs/composition-api'
import useReports from '~/composable/reports'
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
        const { getReportPromise, loading, report, errorMessage, message } = useReports()
        const { formatDate } = genericFuncs()
        const submitted = ref(false)
        const submitting = ref(false)
        const selectedJobId = ref("")
        const errorDialog = ref(false)
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
        const startOfJob = new Date().toISOString().substring(0, 10)
        const endOfJob = new Date().toISOString().substring(0, 10)
        const initialEmailSentDate = new Date().toISOString().substring(0, 10)
        const fetchedGeneralHistory = ref(false)

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
        function onSubmit() {
            message.value = ""
            const post = {
                JobId: selectedJobId.value,
                customerFirstName: report.value.cusFirstName,
                customerLastName: report.value.cusLastName,
                customerPhoneNumber: report.value.customerPhoneNumber,
                customerEmail: report.value.EmailAddress,
                location: report.value.location,
                insuranceCompany: report.value.InsuranceCompany,
                adjusterName: report.value.adjusterName,
                adjusterPhoneNumber: report.value.adjusterPhone,
                adjusterEmail: report.value.adjusterEmail,
                claimNumber: report.value.ClaimNumber,
                policyNumber: report.value.PolicyNumber,
                payments: payments.value,
                startOfJob: startOfJob,
                endOfJob: endOfJob,
                initialEmailSentDate: initialEmailSentDate
            }
            submitting.value = true
            $api.$post("/api/GeneralHistory/new", post).then((res) => {
                message.value.push("General history log created!")
                submitting.value = false
                submitted.value = true
            }).catch(err => {
                errorMessage.value.push(err.response.data)
            })
        }

        watch(selectedJobId, (val) => {
            getReportPromise(`rapid-response/${val}`)
            $api.$get(`/api/GeneralHistory/${val}`).then((res) => {
                fetchedGeneralHistory.value = true
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
            onSubmit,
            fetchedGeneralHistory
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
            column-gap:10px;
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