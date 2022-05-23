<template>
    <div class="form-wrapper">
            <!-- <h1 class="text-center">{{company}}</h1> -->
            <h2 class="text-center">Certificate of Completion</h2>
            <ValidationObserver ref="form" v-slot="{errors}">
                <v-dialog width="400px" v-model="errorDialog">
                    <div class="modal__error">
                    <div v-for="(error, i) in errors" :key="`error-${i}`">
                        <h3 class="form__input--error">{{ error[0] }}</h3>
                    </div>
                    </div>
                </v-dialog>
                <h2>{{message}}</h2>
                <h3 class="alert alert--error" v-for="(error, i) in errorMessage" :key="`server-errors-${i}`">{{error}}</h3>
                <form ref="form" class="form" @submit.prevent="submitForm" v-if="!submitted">
                    <fieldset v-if="currentStep === 1">
                        <div class="form__form-group">
                            <ValidationProvider name="Job Id" rules="required" v-slot="{errors}" class="form__input-group form__input-group--normal">
                                <input type="hidden" v-model="selectedJobId" />
                                <label for="selectJobId" class="form__label">Job ID</label>
                                <i class="form__select--icon icon--angle-down mdi" aria-label="icon"></i>
                                <select class="form__input" v-model="selectedJobId">
                                    <option disabled value="">Please select a Job Id</option>
                                    <option v-for="(item, i) in $store.state.reports.jobids" :key="`jobid-${i}`">{{item}}</option>
                                </select>
                                <span class="form__input--error">{{ errors[0] }}</span>
                            </ValidationProvider>
                        </div>
                        <p>This Assignment of Claim Agreement (hereinafter referred to as “Assignment” and/or “Agreement”) and Mitigation

                            Contract (hereinafter referred to as “Contract”) is entered into by and between:
                            {{company}} (hereinafter referred to as “{{abbreviation}}” and/or “Insured”)

                            and

                            The Owner/Persons of legal authority (hereinafter referred to as “Property Representative”)
                            of the property more commonly known as and identified by the following address:
                        </p>
                        <div class="form__form-group">
                            <ValidationProvider rules="required" class="form__input-group form__input-group--long" v-slot="{ errors }" name="Subject property">
                                <input type="text" class="form__input" v-model="subjectProperty" />
                                <span class="txt--subtext mt-2">(hereinafter referred to as “Subject Property”)</span>
                                <span class="form__input--error">{{ errors[0] }}</span>
                            </ValidationProvider>
                            <UiGeoCoder @sendAddress="settingSubjectProperty($event)" mapid="map" geocoderid="subjectProperty" geocoderef="geocoderProperty" mapView />
                        </div>
                        <p><strong>{{company}} has completed the Assignment of Benefit Agreement and Mitigation Contract in full</strong></p>
                        <p>SHARE: Property Representative will send a copy of this Agreement, Contract, Certificate of Completion, Xactimate and
                            the {{abbreviation}} W9 to the insurance company, the insurance company’s representatives and mortgage institutions to allow {{abbreviation}}
                            to communicate, share and exchange through reasonable introduction and/or through means found proper in the daily course
                            of business information including but not limited to the services that {{abbreviation}} has provided, currently is providing and/or may
                            be required to provide in the future.
                        </p>
                        <p>
                            DIRECTION OF PAYMENT: Property Representative hereby authorizes and unequivocally instructs direct payment of
                            any benefits or proceeds for services rendered pursuant to the Assignment of Claim Agreement and Mitigation Contract and
                            that such payment be made payable directly and solely to {{abbreviation}} and sent exclusively to {{abbreviation}} from the insurance company
                            including but not limited to all invoices, tasks, billable hours and billable units partially and /or completely provided by
                            {{abbreviation}}.
                        </p>
                        <div class="form__form-group form__form-group--inline form__form-group--info-box">
                            <span class="form__input-group--inline">
                                <div class="form__input-group--section">
                                    <label for="InsuredDeductible" class="form__label">Insured Deductible</label>
                                    <span class="currency-input">$</span><input type="text" id="InsuredDeductible" class="form__input form__input--short"
                                        v-model="deductible" @keypress="currencyFormat" />
                                </div>
                            </span>
                            <span class="form__input-group--inline">
                                <div class="form__input-group--section">
                                    <label for="InsuredEndDate" class="form__label">Insured: Agreed “Term” of Service Minimum End Date</label>
                                    <UiDatePicker dateId="InsuredEndDate" dialogId="dialogEndDate" @date="insuredEndDateFormatted = $event" />
                                </div>
                            </span>
                            <span class="form__input-group--inline">
                                <div class="form__input-group--section">
                                    <label for="insuredPayment1" class="form__label">Insured Payment 1)</label>
                                    <span class="form__input--currency">
                                        <span>$</span><input type="text" class="form__input form__input--short" v-model="insuredPayment.firstStep" />
                                    </span>
                                </div>
                                <div class="form__input-group--inline form__input-group--date-group">
                                    <label for="insuredDay1" class="form__label">Day (1) Date</label>
                                    <UiDatePicker dateId="insuredDay1" dialogId="insuredPayDay1" @date="insuredPayment.day1DateFormatted = $event" />
                                </div>
                            </span>
                            <span class="form__input-group--inline">
                                <div>
                                    <label for="insuredPayment2" class="form__label">Insured Payment 2)</label>
                                    <span class="form__input--currency">
                                        <span>$</span><input id="insuredPayment2" type="text" class="form__input form__input--short" v-model="insuredPayment.secondStep" />
                                    </span>
                                </div>
                                <div class="form__input-group--inline form__input-group--date-group">
                                    <label for="insuredDay5" class="form__label">Day (5) Date (upon pickup)</label>
                                    <UiDatePicker dateId="insuredDay5" dialogId="insuredPayDay5" @date="insuredPayment.day5DateFormatted = $event" />
                                </div>
                            </span>
                            <span class="form__input-group--inline">
                                <div>
                                    <label class="form__label">Insured Payment 3) = “Available Proceeds” Per terms of this agreement</label>
                                </div>
                            </span>
                            <v-spacer></v-spacer>
                            <span class="form__input-group--inline">
                                <label class="form__label">Insured Payment 4) = Succeeding Day of “Available Proceeds” for Remaining Balance</label>
                            </span>
                        </div>
                        <div class="form__form-group form__form-group--inline form__form-group--info-box">
                            <span class="form__input-group--inline form__input-group--date-group">
                                <label for="NonInsuredEndDate" class="form__label">Non-Insured or Still Pending Coverage: Agreed “Term” of Service Minimum End Date</label>
                                <UiDatePicker dateId="NonInsuredEndDate" dialogId="dialognoninsuredEndDate" @date="nonInsuredPayment.endDateFormatted = $event" />
                            </span>
                            <span class="form__input-group--inline form__input-group--date-group">
                                <label for="NonInsuredDay1Date" class="form__label">Non-Insured or Still Pending Coverage: Payment 1) = $750.00 Day (1) Date</label>
                                <UiDatePicker dateId="NonInsuredDay1Date" dialogId="nonInsuredDay1" @date="nonInsuredPayment.day1DateFormatted = $event" />
                            </span>
                            <span class="form__input-group--inline form__input-group--date-group">
                                <label for="NonInsuredDay5Date" class="form__label">Non-Insured or Still Pending Coverage: Payment 2) = $750.00 Day (5) Date</label>
                                <UiDatePicker dateId="NonInsuredDay5Date" dialogId="nonInsuredDay5" @date="nonInsuredPayment.day5DateFormatted = $event" />
                            </span>
                            <span class="form__input-group--inline">
                                <label for="NonInsuredDay5Date" class="form__label">Non-Insured or Still Pending Coverage: Payment 3) = Succeeding Day of the Term for Remaining Balance</label>                           
                            </span>
                        </div>
                        <ValidationProvider rules="required" name="Rating" v-slot="{errors}" class="form__form-group">
                            <span><strong>Please Circle: RATE YOUR EXPIERENCE WITH OUR SERVICES:</strong></span>
                            <ul class="form__form-group--inline mt-3">
                                <li v-for="(item, i) in ratings" :key="`ratings-${i}`" class="form__input--radio">
                                    <label :for="item">{{item}}</label>
                                    <input :id="item" type="radio" v-model="selectedRating" :value="item" />
                                </li>
                            </ul>
                            <span class="form__input--error">{{ errors[0] }}</span>
                        </ValidationProvider>
                        <p>I am satisfied with the completion of all mitigation services and all other related services performed on the Subject Property by {{company}}.</p>
                        <div class="form__form-group">
                            <span class="form__input-group--inline">
                                <ValidationProvider rules="required" name="Representative" v-slot="{errors}" class="form__input-group form__input-group--long">
                                    <label for="repPrint" class="form__label">Representative (Print)</label>
                                    <input id="repPrint" type="text" class="form__input" v-model="repPrint" />
                                    <span class="form__input--error">{{ errors[0] }}</span>
                                </ValidationProvider>
                                <div class="form__input-group form__input-group--short">
                                    <label for="timeRepPrint" class="form__label">Time</label>
                                    <v-dialog ref="timeRepDialog" v-model="repTimeModal" :return-value.sync="repPrintTime" light persistent max-width="320px">
                                        <template v-slot:activator="{ on, attrs }">
                                            <input id="NonInsuredDay5Date" v-model="repPrintTimeFormatted" v-bind="attrs" class="form__input form__input--short" v-on="on" readonly />
                                        </template>
                                        <v-time-picker v-model="repPrintTime" scrollable>
                                            <v-spacer></v-spacer>
                                            <v-btn text color="#fff" @click="repTimeModal = false">Cancel</v-btn>
                                            <v-btn text color="#fff" @click="$refs.timeRepDialog.save(repPrintTime)">OK</v-btn>
                                        </v-time-picker>
                                    </v-dialog>
                                </div>
                            </span>
                            <LazyUiSignaturePadModal width="700px" height="219px" dialog :initial="false" sigType="customer" inputId="repSigPad" 
                                :sigData="repSign" sigRef="repSigPad" name="Representative Signature" />
                            <span class="form__input-group--inline">
                                <div class="form__input-group form__input-group--short">
                                    <label for="dateRepSign" class="form__label">Date</label>
                                    <UiDatePicker dateId="dateRepSign" dialogId="dialogRepSign" @date="repSignDateFormatted = $event" />
                                </div>
                            </span>
                            <LazyUiSignaturePadModal v-model="empSig" width="700px" height="219px" :initial="false" :sigData="teamMemberSig" inputId="teamMemberSig" sigType="employee" 
                                sigRef="teamMemberSigPad" name="Team Member Signature" />
                            <div class="form__input-group form__input-group--short">
                                <label for="dateTeamSign" class="form__label">Date</label>
                                <UiDatePicker dateId="dateTeamSign" dialogId="dialogTeamSign" @date="teamSignDateFormatted = $event" />
                            </div>
                            <div class="form__input-group">
                                <label for="testimonial" class="form__label">Would you care to give a Short Testimonial Note:</label>
                                <textarea id="testimonial" v-model="testimonial" class="form__input--textarea form__input"></textarea>                              
                            </div>
                            <ValidationProvider name="Payment option" rules="required" v-slot="{errors}" class="form__input-group mt-3">
                                <p class="form__label">Which payment method will you use?</p>
                                <ul class="form__form-group--inline">
                                    <li v-for="(item, i) in paymentOptions" :key="`payment-${i}`" class="form__input--radio">
                                        <label :for="item">{{item}}</label>
                                        <input :id="item" type="radio" v-model="paymentOption" :value="item" />
                                    </li>
                                </ul><br/>
                                <span class="form__input--error">{{ errors[0] }}</span>
                            </ValidationProvider>
                            <ValidationProvider v-if="paymentOption === 'Card'" name="Existing credit card" rules="required" v-slot="{errors}" class="form__input-group mt-3">
                                <p class="form__label">Are you using an existing credit/debit card?</p>
                                <ul class="form__form-group--inline">
                                    <li class="form__input--radio">
                                        <label for="Yes">Yes</label>
                                        <input id="Yes" type="radio" v-model="existingCreditCard" value="Yes" />
                                    </li>
                                    <li class="form__input--radio">
                                        <label for="No">No</label>
                                        <input id="No" type="radio" v-model="existingCreditCard" value="No" />
                                    </li>
                                </ul>
                                <span class="form__input--error">{{ errors[0] }}</span>
                            </ValidationProvider>
                            <ValidationProvider v-if="existingCreditCard === 'Yes' && paymentOption === 'Card'" name="Card to link" rules="required" v-slot="{errors}"
                                class="form__input-group form__input-group--long">
                                <input type="hidden" v-model="cardToUse" />
                                <label class="form__label">Card number</label>
                                <i class="form__select--icon icon--angle-down mdi" aria-label="icon"></i>
                                <select class="form__input" v-model="cardToUse">
                                    <option disabled value="">Please select a credit/debit card</option>
                                    <option v-for="(item, i) in cardNumbers" :key="`cardnumbers-${i}`">{{item}}</option>
                                </select>
                                <span class="form__input--error">{{ errors[0] }}</span>                         
                            </ValidationProvider>
                        </div>
                    </fieldset>
                    <LazyFormsCreditCard v-if="currentStep >= 2 && paymentOption == 'Card'" ref="creditCardForm"  :partOfLastSection="true" :jobId="selectedJobId" :repPrint="repPrint"
                        @submit="submitForm" @cardSubmit="cardSubmittedValue" company="Water Emergency Services Incorporated" abbreviation="WESI" />
                    <v-btn type="submit" v-if="currentStep === 1 && (paymentOption == 'Card' && existingCreditCard == 'No')">Next</v-btn>
                    <button type="submit" :class="cardSubmitted || (paymentOption !== 'Card' || existingCreditCard !== 'No') ? 'button button--normal' : 'button--disabled'">
                        {{ submitting ? 'Submitting' : 'Submit' }}
                    </button>
                </form>
            </ValidationObserver>
            <vue-html2pdf :pdf-quality="2" pdf-content-width="100%" :html-to-pdf-options="htmlToPdfOptions('wesi-coc', selectedJobId)"
                          :paginate-elements-by-height="900" :manual-pagination="false" :show-layout="false"
                          :enable-download="false" @beforeDownload="beforeDownloadNoSave($event, `wesi-coc-${selectedJobId}`, selectedJobId)"
                          @hasDownloaded="uploadPdf($event, `wesi-coc-${selectedJobId}`, selectedJobId)" :preview-modal="true" :ref="`html2Pdf0`">
                <LazyPdfCertificateContent :jobid="selectedJobId" :cardsImages="cardImages" :certificate="postedData" :reportType="'wesi-coc'" slot="pdf-content"
                    abbreviation="WESI" company="Water Emergency Services Incorporated" />
            </vue-html2pdf>
        </div>
</template>
<script>
import useReports from "@/composable/reports"
import genericFuncs from "@/composable/utilityFunctions"
import { defineComponent, ref, computed, watch, useStore, useContext } from "@nuxtjs/composition-api"

export default defineComponent({
    props: {
        company: String,
        abbreviation: String
    },
    setup(props) {
        const store = useStore()
        const { formatDate, formatTime } = genericFuncs()
        const { htmlToPdfOptions, beforeDownloadNoSave, uploadPdf, getReportPromise } = useReports()
        const { $gcs, $api } = useContext()
        const fetchReports = () => { store.dispatch("reports/fetchReports") }
        const currentStep = ref(1)
        const message = ref('')
        const errorMessage = ref([])
        const submitted = ref(false)
        const submitting = ref(false)
        const subjectProperty = ref('')
        const deductible = ref(null)
        const insuredEndDateModal = ref(false)
        const insuredEndDateFormatted = ref("")
        const insuredPayment = ref({
            day1Modal: false,
            day5Modal: false,
            firstStep: null,
            secondStep:null,
            day1DateFormatted: formatDate(new Date().toISOString().substring(0, 10)),
            day5Date: new Date().toISOString().substring(0, 10),
            day5DateFormatted: formatDate(new Date().toISOString().substring(0, 10))
        })
        const nonInsuredPayment = ref({
            endDateModal: false,
            day1Modal: false,
            day5Modal: false,
            endDate: new Date().toISOString().substring(0, 10),
            endDateFormatted: formatDate(new Date().toISOString().substring(0, 10)),
            day1DateFormatted: formatDate(new Date().toISOString().substring(0, 10)),
            day5Date: new Date().toISOString().substring(0, 10),
            day5DateFormatted: formatDate(new Date().toISOString().substring(0, 10)),
        })
        const ratings = [
            "A+", "A", "A-", "B+", "B", "B-", "C+", "C", "C-"
        ]
        const selectedRating = ref("")
        const repPrint = ref("")
        const repSign = ref({
            data: '',
            isEmpty: true
        })
        const repTimeModal = ref(false)
        const repPrintTime = ref(null)
        const repPrintTimeFormatted = ref(formatTime(new Date().toTimeString().substring(0, 5)))
        const repSignModal = ref(false)
        const repSignDateFormatted = ref("")
        const teamMemberSig = ref({
            data: '',
            isEmpty: true
        })
        const empSig = ref("")
        const teamSignModal = ref(false)
        const teamSignDateFormatted = ref("")
        const testimonial = ref("")
        const usingCreditCard = ref(false)
        const cusSig = ref({
            data: '',
            isEmpty: true
        })
        const cusSigModal = ref(false)
        const cusSigDateFormatted = ref("")
        const selectedJobId = ref("")
        const paymentOptions = ["Cash", "Card"]
        const paymentOption = ref("")
        const errorDialog = ref(false)
        const existingCreditCard = ref("")
        const cardToUse = ref("")
        const cardObj = ref({})
        const cardSubmitted = ref(false)
        const html2Pdf0 = ref(null)

        const user = computed(() => store.getters["users/getUser"])
        const reports = computed(() => store.getters["reports/getReports"])
        const creditCards = computed(() => store.getters["reports/getCards"])
        const certificates = computed(() => {
            return reports.value.filter((v) => {
                return v.formType === "coc"
            })
        })
        const cardNumbers = computed(() => {
            return creditCards.value.map((v) => {
                return v.cardNumber
            })
        })
        const cardImages = ref([])
        const form = ref(null)
        const postedData = ref({})

        function cardSubmittedValue(...params) {
            const {isSubmit, cardNumber} = params[0]
            cardObj.value = params
            cardToUse.value = cardNumber
            cardSubmitted.value = isSubmit
        }
        function currencyFormat($event) {
            let keyCode = ($event.keyCode ? $event.keyCode : $event.which);
            // only allow number and one dot
            if ((keyCode < 48 || keyCode > 57) && (keyCode !== 46 || deductible.value.indexOf('.') != -1)) { // 46 is dot
                $event.preventDefault();
            }
            // restrict to 2 decimal places
            if(deductible.value!=null && deductible.value.indexOf(".")>-1 && (deductible.value.split('.')[1].length > 1)){
                $event.preventDefault();
            }
        }
        function maskDate() {
            var x = expirationDate.value.replace(/\D/g, '').match(/(\d{0,2})(\d{0,2})/)
            expirationDate.value = !x[2] ? x[1] : x[1] + '/' + x[2]
        }
        async function submitForm() {
            errorMessage.value = []
            const certificatesArr = certificates.value.map((v) => {
                return v.JobId
            })
            if (!certificatesArr.includes(selectedJobId.value)) {
                await form.value.validate().then(success => {
                    if (!success) {
                        errorDialog.value = true
                        return
                    }
                    if ((currentStep.value === 1 && paymentOption.value !== 'Card' || existingCreditCard.value !== 'No') ||
                        currentStep.value === 2) {
                        
                        onSubmit().then(() => {
                            getCardImages(cardToUse.value).then(() => {
                                getReportPromise(`wesi-coc/${selectedJobId.value}`).then((res) => {
                                    postedData.value = res
                                    submitted.value = true
                                    html2Pdf0.value.generatePdf()
                                })
                            })
                        }).catch(err => {
                            errorMessage.value.push(err.response.data)
                            submitting.value = false
                        })
                        return;
                    }
                    currentStep.value++;
                })
            }
        }
        function onSubmit() {
            message.value = ''
            errorMessage.value = []
            let insuredPayment1Arr = {
                insuredPay: insuredPayment.value.firstStep,
                day1Date: insuredPayment.value.day1DateFormatted
            };
            let insuredPayment2Arr = {
                insuredPay: insuredPayment.value.secondStep,
                day5Date: insuredPayment.value.day5DateFormatted
            };
            const post = {
                JobId: selectedJobId.value,
                ReportType: "wesi-coc",
                formType: "coc",
                contractingCompany: "Water Emergency Services",
                companyAbbreviation: "WESI",
                subjectProperty: subjectProperty.value,
                deductible: parseFloat(deductible.value),
                insuredMinEndDate: insuredEndDateFormatted.value,
                insuredPayment1: insuredPayment1Arr,
                insuredPayment2: insuredPayment2Arr,
                nonInsuredMinEndDate: nonInsuredPayment.value.endDateFormatted,
                nonInsuredPayment1: nonInsuredPayment.value.day1DateFormatted,
                nonInsuredPayment2: nonInsuredPayment.value.day5DateFormatted,
                rating: selectedRating.value,
                representative: repPrint.value,
                repSignTime: repPrintTimeFormatted.value,
                representativeSign: repSign.value.data,
                repSignDate: repSignDateFormatted.value,
                teamSign: Object.keys(empSig.value).length !== 0,
                teamSignDate: teamSignDateFormatted.value,
                testimonial: testimonial.value,
                paymentOption: paymentOption.value,
                teamMember: user.value,
                cardNumber: cardToUse.value
            };
            postedData.value = post
            submitting.value = true
            return new Promise((resolve, reject) => {
                $api.$post("/api/reports/wesi-coc/new", post, {
                    params: {
                        jobid: selectedJobId.value
                    }
                }).then((res) => {
                    message.value = res
                    fetchReports()
                    resolve(res)
                }).catch((err) => {
                    errorMessage.push(err)
                    errorDialog.value = true
                    this.$refs.form.setErrors({
                        JobId: [err.response.data.message]
                    })
                    reject(err)
                })
            })
        }
        function getCardImages(card) {
            return new Promise((resolve, reject) => {
                $gcs.$get("/list/creditCard", {
                    params: {
                        folder: 'creditCard',
                        subfolder: card,
                        delimiter: '',
                    }
                }).then((res) => {
                    cardImages.value = res.images
                    resolve(res.images)
                }).catch(err => {
                    reject(err)
                })
            })
        }
        function settingSubjectProperty(params) {
            subjectProperty.value = params.address
        }

        watch(repPrintTime, (val) => {
            repPrintTimeFormatted.value = formatTime(val)
        })
        watch(deductible, (val) => {
            insuredPayment.value.firstStep = val * .50
            insuredPayment.value.secondStep = val * .50
        })
        watch(selectedJobId, (val) => {
            errorMessage.value = []
            $api.$get(`/api/reports/details/dispatch/${val}`).then((res) => {
                subjectProperty.value = res.location.address + ", " + res.location.cityStateZip
            }).catch(err => {
                errorMessage.value.push(err.response.data.title)
            })
        })

        return {
            currentStep,
            message,
            errorMessage,
            submitted,
            submitting,
            subjectProperty,
            deductible,
            insuredEndDateModal,
            insuredEndDateFormatted,
            insuredPayment,
            nonInsuredPayment,
            ratings,
            selectedRating,
            repPrint,
            repSign,
            repTimeModal,
            repPrintTime,
            repPrintTimeFormatted,
            repSignModal,
            repSignDateFormatted,
            teamMemberSig,
            empSig,
            teamSignModal,
            teamSignDateFormatted,
            testimonial,
            usingCreditCard,
            cusSig,
            cusSigModal,
            cusSigDateFormatted,
            selectedJobId,
            paymentOptions,
            paymentOption,
            errorDialog,
            existingCreditCard,
            cardToUse,
            cardObj,
            cardSubmitted,
            cardSubmittedValue,
            cardNumbers,
            postedData,
            submitForm,
            currencyFormat,
            beforeDownloadNoSave,
            uploadPdf,
            htmlToPdfOptions,
            form,
            html2Pdf0,
            settingSubjectProperty,
            cardImages
        }
    }
})
</script>