<template>
<!-- Signature for both employee AND customer at the bottom of this form -->
    <div class="form-wrapper form-wrapper__upholstery">
        <h1 class="text-center">{{company}}</h1>
        <h2 class="text-center">Upholstery Cleaning Pre-Inspection Form</h2>
        <ValidationObserver ref="form" v-slot="{handleSubmit}">
            <h2 v-if="message !== ''">{{message}}</h2>
            <ul>
                <li v-for="(error, i) in errors" :key="`listing-${i}`">{{error}}</li>
            </ul>
            <v-dialog width="400px" v-model="errorDialog">
                <div class="modal__error">
                    <div v-for="(error, i) in errors" :key="`error-${i}`">
                        <h3 class="form__input--error">{{ error }}</h3>
                    </div>
                </div>
            </v-dialog>
            <form class="form" @submit.prevent="handleSubmit(submitForm)" v-if="!submitted">
                <div class="form__form-group">
                    <ValidationProvider rules="required" v-slot="{errors, ariaMsg}" vid="JobId" name="Job ID" class="form__input-group form__input-group--normal">
                        <input type="hidden" v-model="selectedJobId" />
                        <label class="form__label">Job ID:</label>
                        <i class="form__select--icon icon--angle-down mdi" aria-label="icon"></i>
                        <select class="form__input" v-model="selectedJobId">
                            <option disabled value="">Please select a Job ID</option>
                            <option v-for="(item, i) in $store.state.reports.jobids" :key="`jobids-${i}`">{{item}}</option>
                        </select>
                        <span class="form__input--error" v-bind="ariaMsg">{{ errors[0] }}</span>
                    </ValidationProvider>
                    <ValidationProvider rules="required" v-slot="{errors, ariaMsg}" name="Customer" class="form__input-group form__input-group--long">
                        <label for="customer" class="form__label">Customer</label>
                        <input id="customer" class="form__input" type="text" v-model="customer" />
                        <span class="form__input--error" v-bind="ariaMsg">{{ errors[0] }}</span>
                    </ValidationProvider>
                    <div class="form__input-group form__input-group--long">
                        <label class="form__label">Date</label>
                        <UiDatePicker dateId="date" dialogId="dateDialog" @date="dateFormatted = $event" />
                    </div>
                    <div class="form__input-group form__input-group--long">
                        <label for="location" class="form__label">Location</label>
                        <UiGeoCoder @sendAddress="settingLocation($event)" :mapView="false" geocoderid="geocoder" geocoderef="geocoder" />
                    </div>
                    <ValidationProvider vid="address" name="Address" rules="required" v-slot="{errors, ariaMsg}" class="form__input-group form__input-group--very-long">
                        <label for="address" class="form__label">Address</label>
                        <input id="address" v-model="location.address" name="Address" type="text" class="form__input" />
                        <span class="form__input--error" v-bind="ariaMsg">{{ errors[0] }}</span>
                    </ValidationProvider>
                    <div class="form__input-group form__input-group--short">
                        <label for="phoneNumber" class="form__label">Phone</label>
                        <input type="text" class="form__input" v-imask="phoneMask" :value="phoneNumber" @complete="onComplete($event, 'phoneNumber')" />
                    </div>
                    <ValidationProvider vid="Technician" v-slot="{errors, ariaMsg}" name="Technician" class="form__input-group form__input-group--long">
                        <label for="technician" class="form__label">Technician</label>
                        <input id="technician" class="form__input" type="text" v-model="technician" />
                        <span class="form__input--error" v-bind="ariaMsg">{{ errors[0] }}</span>
                    </ValidationProvider>
                    <ValidationProvider name="Age of fabrics" class="form__input-group form__input-group--long">
                        <label for="age" class="form__label">Age of Fabrics</label>
                        <input id="age" class="form__input" type="text" v-model="ageOfFabrics" />
                    </ValidationProvider>
                </div>
                <div class="form__form-group grid grid--default">
                    <div class="form__form-group--listing form__form-group--info-box" v-for="(group, i) in formData" :key="`group-${i}`">
                        <h3>{{group.label}}</h3>                        
                        <ul class="form__form-group--listing">
                            <li v-for="(item, j) in group.data" :key="`listitem-${j}`">
                                <span v-if="selectedData.hasOwnProperty(group.id)">
                                    <input :id="item" type="checkbox" v-model="selectedData[group.id].checked" :value="item" />
                                </span>
                                <label :for="item" class="form__label">{{item}}</label>
                            </li>
                        </ul>
                        <div v-if="group.hasOwnProperty('other') && selectedData.hasOwnProperty(group.id)">
                            <label class="form__label">Other</label>
                            <input v-model="selectedData[group.id].other" class="form__input" />
                        </div>
                        <div v-if="group.hasOwnProperty('method') && selectedData.hasOwnProperty(group.id) && selectedData['prevCleaning'].checked.includes('Yes')">
                            <label class="form__label">Method</label>
                            <input v-model="selectedData['prevCleaning'].method" class="form__input" />
                        </div>
                    </div>
                </div>
                <div class="form__form-group authorization-group">
                    <div class="form__input-group">
                        <label class="form__label" for="limitations">Limitations and Authorization Limitations</label>
                        <textarea cols="50" class="form__input form__input--textarea" v-model="limitations"></textarea>
                    </div>
                    <div class="form__input-group">
                        <label class="form__label">Acknowledgement</label>
                        <p class="red--text">I am aware of the above limitations regarding the furniture noted. I authorize Company Name to clean my furniture subject to the above limitations.</p>
                        <div class="grid grid--two-column">
                            <LazyUiSignaturePadModal width="700px" height="219px" dialog :initial="false" sigType="customer" inputId="cusSig" :sigData="cusSig" 
                                sigRef="cusSig" name="Customer signature" />
                        </div>
                        <div class="form__input-group form__input-group--normal">
                            <label class="form__label">Customer Sign Date</label>
                            <UiDatePicker dateId="cusSignDate" dialogId="cusSignDateDialog" @date="cusSignDate = $event" />
                        </div>
                    </div>
                    <div class="form__input-group">
                        <LazyUiSignaturePadModal v-model="empSig" width="700px" height="219px" dialog :initial="false" sigType="employee" inputId="techSig" :sigData="techSig" sigRef="techSig" 
                            name="Technician signature" />
                    </div>
                </div>
                <button type="submit" class="button button--normal">{{ submitting ? 'Submitting' : 'Submit' }}</button>
            </form>
        </ValidationObserver>
        <div>
            <client-only>
                <vue-html2pdf :pdf-quality="2" pdf-content-width="100%" :html-to-pdf-options="htmlToPdfOptions('upholstery-form', selectedJobId)" :paginate-elements-by-height="1000" :manual-pagination="false"
                    :show-layout="false" :preview-modal="true" :enable-download="false" @hasDownloaded="uploadPdf($event, `upholstery-form-${selectedJobId}`, selectedJobId)" 
                    @beforeDownload="beforeDownloadNoSave($event, `upholstery-form-${selectedJobId}`, selectedJobId)" ref="html2Pdf0">
                    <LazyLayoutUpholsteryDetails slot="pdf-content" :report="postedData" :notPdf="false" />
                </vue-html2pdf>
            </client-only>
        </div>
    </div>
</template>
<script>
import { computed, defineComponent, onMounted, reactive, ref, useContext, useStore, watch } from '@nuxtjs/composition-api'
import { dateMask } from "@/data/masks";
import genericFuncs from '@/composable/utilityFunctions'
import useReports from '@/composable/reports';
export default defineComponent({
    props: {
        company: String,
        abbreviation: String
    },
    setup(props) {
        const { formatDate, groupByKey } = genericFuncs()
        const { htmlToPdfOptions, beforeDownloadNoSave, uploadPdf } = useReports()
        const { $api } = useContext()
        const store = useStore()
        const fetchReports = () => { store.dispatch("reports/fetchReports") }
        const errorDialog = ref(false)
        const errors = ref([])
        const form = ref(null)
        const html2Pdf0 = ref(null)
        const submitted = ref(false)
        const submitting = ref(false)
        const customer = ref("")
        const technician = ref("")
        const message = ref("")
        const location = ref({address: "", cityStateZip: ""})
        const phoneNumber = ref("")
        const selectedJobId = ref("")
        const formData = ref([
            {
                id: "furnitureCleaned",
                label: "Furniture to be Cleaned",
                data: ["Sofa", "Sectional Sofa", "Chair", "Reclinder Chair", "Ottoman", "Dining Room Chair"],
                other: ""
            },
            {
                id: "fabricType",
                label: "Fabric Type",
                data: ["Synthetic", "Decorator/Specialty", "Velvet Weave", "Haitian Cotton", "Cotton", "Cotton/Synthetic Blend", "Jacquard Weave", "Glazed Fabric/Chintz", "Microfiber"],
                other: ""
            },
            {
                id: "fabricBacking",
                label: "Fabric Backing",
                data: ["No Back Coating Evident", "Coating in Good Condition", "Coating Deteriorated"]
            },
            {
                id: "zipper",
                label: "Zipper",
                data: ["Good Condition", "Stuck/Broken"]
            },
            {
                id: "cushions",
                label: "Cushions",
                data: ["Foam in Good Condition", "Deterioration Noted", "Replacement Recommended"]
            },
            {
                id: "fabricConditions",
                label: "General Fabric Conditions",
                data: ["Rips and Tears", "Split or Weakened Fabric", "Open or Loose Seam(s)", "Frayed Welting or Piping", "Evidence of Shrinkage", "Loose or Missing Trim", "Loose or Missing Buttons", "Loss of Finish or Glaze", "Texture change or Damage"]
            },
            {
                id: "colorCondition",
                label: "Color Condition",
                data: ["Evidence of Pre-Existing Bleeding", "Areas of Color Loss or Fading"]
            },
            {
                id: "soilingConditions",
                label: "Stain and Soiling Conditions",
                data: ["Heavy Soil Areas", "Water Stains", "Pet Accident Stains", "Yellow or Brown Stains", "Oily Type Stains", "Rust Stains", "Ink Stains"],
                other: ""
            },
            {
                id: "cleanabilityCode",
                label: "Cleanability Code",
                data: ["W", "S", "W/S", "X (Dry Vacuum Only)"]
            },
            {
                id: "prevCleaning",
                label: "Previous Cleaning",
                data: ["No", "Yes", "Home Spotters", "Home Deodorizers"],
                method: ""
            },
            {
                id: "colorFastness",
                label: "Color Fastness Test Results",
                data: ["Color Stable", "Color Unstable"]
            },
            {
                id: "afterCareTreatments",
                label: "Upholstery After Care Treatments",
                data: ["Fabric/upholstery Protector", "Hydrocide Odor Neutralizer", "Organic Deodorizer - spice air"]
            },
            {
                id: "additionalServices",
                label: "Additional Services",
                data: ["Carpet Cleaning", "Tile and Grout Cleaning", "Marble and Stone Restoration/Cleaning", "Area Rug Cleaning", "Area Rug Repairs", "Padding"]
            }
        ])
        const selectedData = ref({})
        const ageOfFabrics = ref("")
        const dateFormatted = ref("")
        const cusSignDate = ref("")
        const limitations = ref("")
        const empSig = ref("")
        const cusSig = ref({
            data: '',
            isEmpty: true
        })
        const techSig = ref({
            data: '',
            isEmpty: true
        })
        const phoneMask = ref({
            mask: '(000) 000-0000'
        })
        const postedData = ref({})

        const user = computed(() => store.getters['users/getUser'])
        const groupedData = () => {
            var groupData = groupByKey(formData.value, "id")
            var selectedGroupData = {}
            for (const key in groupData) {
                var obj = { id: key, checked: [], other: "", label: groupData[key][0].label}
                if (key === "prevCleaning") {
                    selectedGroupData["prevCleaning"] = {...obj, method: ""}
                } else {
                    selectedGroupData[key] = obj
                }
            }
            selectedData.value = selectedGroupData
        }
        const onComplete = (e, property) => {
            const maskRef = e.detail;
            if (property === "phoneNumber") phoneNumber.value = maskRef.value
        }
        async function submitForm() {
            errors.value = []
            Promise.all([onSubmit()]).then((result) => {
                message.value = result[0]
                html2Pdf0.value.generatePdf()
            }).catch(error => console.log(`Error in promises ${error}`))
        }
        function onSubmit() {
            message.value = ""
            const post = {
                JobId: selectedJobId.value,
                Customer: customer.value,
                ReportType: "upholstery-form",
                formType: "pre-inspection",
                address: location.value.address,
                phoneNumber: phoneNumber.value,
                date: dateFormatted.value,
                Technician: technician.value,
                teamMember: user.value,
                groupedData: selectedData.value,
                ageOfFabric: ageOfFabrics.value,
                limitations: limitations.value,
                customerSig: cusSig.value.data,
                customerSignDate: cusSignDate.value,
                techSig: empSig.value !== ''
            }
            postedData.value = post
            return new Promise((resolve, reject) => {
                $api.$post(`/api/reports/upholstery-form/new`, post, {
                    params: {
                        jobid: selectedJobId.value
                    }
                }).then((res) => {
                    submitted.value = true
                    submitting.value = false
                    fetchReports()
                    resolve(res)
                }).catch((err) => {
                    errorDialog.value = true
                    errors.value.push(err.response.data.message)
                    reject(err)
                })
            })
            
        }
        function settingLocation(params) {
            location.value.address = params.address
            location.value.cityStateZip = params.cityStateZip
        }

        onMounted(groupedData)

        return {
            errorDialog, submitted, submitting, customer, location, message, technician, selectedJobId, formData, ageOfFabrics, limitations, cusSig, techSig, phoneNumber,
            selectedData,
            phoneMask,
            submitForm,
            settingLocation,
            onComplete,
            dateMask,
            empSig,
            cusSignDate,
            dateFormatted,
            beforeDownloadNoSave,
            htmlToPdfOptions,
            uploadPdf,
            postedData,
            form,
            html2Pdf0,
            errors
        }
    },
})
</script>
<style lang="scss">
.authorization-group {
    display:grid;
    @include respond(tabletLarge) {
        grid-template-columns:440px 1fr;
    }
}
</style>