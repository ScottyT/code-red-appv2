<template>
    <section class="pdf-content" slot="pdf-content">
        <h1 class="text-center">{{company}}</h1>
        <h2 class="text-center">General History Logs</h2>
        <div class="report-details__section">
            <div class="report-details__data">
                <label>Job ID</label>
                <span>{{report.JobId}}</span>
            </div>
            <div class="report-details__data">
                <label>Customer First Name</label>
                <span>{{report.customerFirstName}}</span>
            </div>
            <div class="report-details__data">
                <label>Customer Last Name</label>
                <span>{{report.customerLastName}}</span>
            </div>
            <div class="report-details__data">
                <label>Customer Phone Number</label>
                <span>{{report.customerPhoneNumber}}</span>
            </div>
            <div class="report-details__data">
                <label>Customer Email</label>
                <span>{{report.customerEmail}}</span>
            </div>
            <div class="report-details__data">
                <label>Insurance Company</label>
                <span>{{report.insuranceCompany}}</span>
            </div>
            <div class="report-details__data">
                <label>Adjuster Name</label>
                <span>{{report.adjusterName}}</span>
            </div>
            <div class="report-details__data">
                <label>Adjuster Phone Number</label>
                <span>{{report.adjusterPhoneNumber}}</span>
            </div>
            <div class="report-details__data">
                <label>Adjuster Email</label>
                <span>{{report.adjusterEmail}}</span>
            </div>
            <div class="report-details__data">
                <label>Claim #</label>
                <span>{{report.claimNumber}}</span>
            </div>
            <div class="report-details__data">
                <label>Policy #</label>
                <span>{{report.policyNumber}}</span>
            </div>
        </div>
        <div class="report-details__section">
            <h2>Payments Received and Dates and Amounts</h2>
            <div class="pdf-item__table payments-table__table">
                <div class="payments-table__table--row pdf-item__table--row">
                    <div class="payments-table__table--col" v-for="(colheader, i) in paymentsArrHeaders" :key="`${colheader}-${i}`">
                        {{colheader.label}}
                    </div>
                </div>
                <template v-if="report.payments !== undefined">
                    <div class="payments-table__table--row pdf-item__table--row" v-for="(row, i) in report.payments" :key="`row-${i}`">
                        <div class="payments-table__table--col" v-for="(col, j) in paymentsArrHeaders" :key="`col-${j}-row-${i}`">
                            <span class="form__input--currency" v-if="col.id == 'amount'">
                                <span class="ma-0">$</span>{{row['amount']}}
                            </span>
                            <span v-else-if="col.id == 'date'">{{row['date']}}</span>
                            <span v-else>{{row[col.id]}}</span>
                        </div>
                    </div>
                </template>
            </div>
        </div>
        <div class="report-details__section">
            <div class="report-details__data">
                <label>Start date of Job</label>
                <span>{{report.startOfJob}}</span>
            </div>
            <div class="report-details__data">
                <label>End date of Job</label>
                <span>{{report.endOfJob}}</span>
            </div>
            <div class="report-details__data">
                <label>Initial email sent date</label>
                <span>{{report.initialEmailDateSent}}</span>
            </div>
        </div>
        <div class="report-details__section flex-column">
            <h2>Logs</h2>
            <div class="logs-table__table pdf-item__table">
                <template v-if="report.logs !== undefined">
                    <div class="pdf-item__table--row logs-table__table--row">
                        <div class="pdf-item__table--col" v-for="(colheader, i) in logsHeader" :key="`logsheader-${i}`">
                            {{colheader.label}}
                        </div>
                    </div>
                    <div class="pdf-item__table--row logs-table__table--row" v-for="(row, i) in report.logs" :key="`logsrow-${i}`">
                        <div class="pdf-item__table--col" v-for="(col, j) in logsHeader" :key="`logscol-${j}`">
                            <span>{{row[col.id]}}</span>
                        </div>
                    </div>
                </template>
            </div>
        </div>
    </section>
</template>
<script>
import { defineComponent } from '@nuxtjs/composition-api'

export default defineComponent({
    props: {
        company: String,
        abbreviation: String,
        jobid: String,
        report: Object
    },
    setup() {
        const paymentsArrHeaders = [
            {id: "paymentType", label:"Payment Type"}, 
            {id: "amount", label: "Amount"}, 
            {id: "date", label: "Date"},
            {id: "keyNotes", label: "Key Notes About Payment"}]
        const logsHeader = [
            {id: "date", label:"Date"},
            {id: "time", label:"Time"},
            {id: "typeOfCommunication", label:"Type of Communication"},
            {id: "codeRedRepsName", label:"Code Red Rep's Name"},
            {id: "communicationWith", label:"Communication with"},
            {id: "summaryNotes", label:"Brief Summary Notes"},
            {id: "communicationRecords", label:"Communication Records"},
        ]
        return {
            paymentsArrHeaders,
            logsHeader
        }
    },
})
</script>
<style lang="scss" scoped>
.logs-table {
    &__table {
        max-width:1200px;
        &--row {
            @include tableColumns(false, 80px 80px 104px 150px 120px 120px 1fr, 7, 0);
        }
    }
}
.payments-table {
    &__table {
        max-width:600px;
        &--row {
            @include tableColumns(false, 130px 128px 100px 1fr, 4, 0);
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
.pdf-item {
    &__table {
        width:100%;
        height:auto;
        border:1px solid $color-black;
        &--header {
            height:50px;
        }
        &--row {
            row-gap:10px;
            display:grid;
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
            padding:3px;
            input[type=checkbox] {
                width:100%;
                height:100%;
            }
        }
    }
}
</style>