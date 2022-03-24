<template>
    <div class="form-wrapper form-wrapper__prop-inventory">
        <v-overlay :value="loading" v-show="loading" light>
            <v-progress-circular
                indeterminate
                size="64"
            ></v-progress-circular>
        </v-overlay>
        <h1 class="text-center">{{company}}</h1>
        <h2 class="text-center">Personal Content Inventory</h2>
        <ValidationObserver ref="form" v-slot="{ errors, handleSubmit }">
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
            <form class="form" @submit.prevent="handleSubmit(submitForm)" v-if="!submitted">
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
                    <ValidationProvider name="Customer" rules="required" v-slot="{errors, ariaMsg}" class="form__input-group form__input-group--normal">
                        <label class="form__label">Customer</label>
                        <input type="text" class="form__input" readonly v-model="customerName" />
                        <span class="form__input--error" v-bind="ariaMsg">{{ errors[0] }}</span>
                    </ValidationProvider>
                    <ValidationProvider name="Claim Number" rules="required" v-slot="{errors, ariaMsg}" class="form__input-group form__input-group--normal">
                        <label class="form__label">Claim Number</label>
                        <input type="text" class="form__input" readonly v-model="claimNum" />
                        <span class="form__input--error" v-bind="ariaMsg">{{ errors[0] }}</span>
                    </ValidationProvider>
                    <ValidationProvider name="Insurance Company" rules="required" v-slot="{errors, ariaMsg}" class="form__input-group form__input-group--normal">
                        <label class="form__label">Insurance</label>
                        <input type="text" class="form__input" readonly v-model="insuranceCompany" />
                        <span class="form__input--error" v-bind="ariaMsg">{{ errors[0] }}</span>
                    </ValidationProvider>
                    <ValidationProvider name="Complete Date" rules="required|length:10" v-slot="{errors, ariaMsg}" class="form__input-group form__input-group--short">
                        <label for="completeDate" class="form__label">Date Completed</label>
                        <input type="hidden" v-model="completionDate" />
                        <imask-input id="completeDate" :lazy="false" :blocks="dateMask.blocks" 
                                    :mask="dateMask.mask" :format="dateMask.format" :parse="dateMask.parse" :pattern="dateMask.pattern" class="form__input" v-model="completionDate" />
                        <span class="form__input--error" v-bind="ariaMsg">{{ errors[0] }}</span>
                    </ValidationProvider>
                </div>
                <div class="form__form-group inventory-list">
                    <div class="d-flex">
                        <h3 class="pr-5">Inventory</h3>
                        <button type="button" class="button button--normal" @click="addRow(inventoryList.length)">Add row</button>
                        <button type="button" class="button button--normal p1-5" v-show="selectedItems.length > 0" @click="deleteRow">Delete row(s)</button>
                        <button type="button" class="button button--normal" v-show="selectedItems.length > 0" @click="selectedItems = []">Clear selection</button>
                    </div>
                    <div class="form__form-group flex-column inventory-list__table">
                        <div class="inventory-list__heading inventory-list__row">
                            <div :id="`inventory-list__${item.id}`" class="inventory-list__col" v-for="item in inventoryList[0].cols" :key="`${item.id}`" v-uppercase>{{item.label}}</div>
                        </div>
                        <div class="inventory-list__rows">
                            <div class="inventory-list__row" v-for="(row, i) in inventoryList" :key="`row-${i}`" :ref="`row-${i}`"
                                v-on="(selectedItems.findIndex(o => o.item_num === row.item_num) > -1) ? { click: ($event) => selectRow(row.item_num) } : {}"
                                @touchstart="!editing ? pressingDown($event, i) : null" @touchend="notPressingDown($event)"
                                :class="selectedItems.findIndex(o => o.item_num === row.item_num) > -1 ? 'selected':''" >
                                <span class="inventory-list__checkbox" @click="selectRow(row.item_num)">
                                    <input type="checkbox" class="form__input" :checked="selectedItems.findIndex(o => o.item_num === row.item_num) > -1" />
                                </span>
                                <div class="inventory-list__col">
                                    <input :id="`${i}-itemnumber`" type="number" class="form__input" v-model="inventoryList[i].item_num" />
                                </div>
                                <div class="inventory-list__col">
                                    <input :id="`${i}-description`" type="text" class="form__input" v-model="row.cols[1].value" />
                                </div>
                                <div class="inventory-list__col">
                                    <UiImageUpload @getFiles="addFilesToInventory($event[0], i)" errorText="an error happened" :email="user.email" :maxSize="2048"
                                        name="item-image" :additionalData="{itemNum: inventoryList[i].item_num}">
                                        <template v-slot:activator>
                                            <button v-show="row.cols[2].value == ''" type="button" class="button button--normal">Add image</button>
                                        </template>
                                        <template v-slot:imagePreview="slotProps">
                                            <img v-show="slotProps.image !== ''" class="file-listing__preview" :src="slotProps.image" />
                                        </template>
                                    </UiImageUpload>
                                    <div class="inventory-list__item-image--preview" v-if="row.cols[2].value !== ''">
                                        <img :src="row.cols[2].value" />
                                    </div>
                                </div>
                                <div class="inventory-list__col" id="inventory-list__restored">
                                    <input type="checkbox" :disabled="editing" class="form__input" v-model="row.cols[3].value" />
                                </div>
                                <div class="inventory-list__col" id="inventory-list__disposed">
                                    <input type="checkbox" :disabled="editing" class="form__input" v-model="row.cols[4].value" />
                                </div>
                                <div class="inventory-list__col" id="inventory-list__stored">
                                    <input type="checkbox" :disabled="editing" class="form__input" v-model="row.cols[5].value" />
                                </div>
                                <div class="inventory-list__col" id="inventory-list__qty">
                                    <input :ref="`${i}-qty`" :min="0" type="number" class="form__input" v-model="row.cols[6].value" @change="setSubtotalValue(i)" />
                                </div>
                                <div class="inventory-list__col">
                                    <span class="d-inline-flex align-center"><span>$</span>
                                    <imask-input :id="`${i}-rcv`" :ref="`${i}-rcv`" class="form__input" :value="row.cols[7].value" :mask="Number" :signed="false" :scale="2" radix="."
                                        :mapToRadix="['.']" :unmask="true" thousandsSeparator="," :max="1000000" @change="setSubtotalValue(i)"
                                        @keypress="currencyFormat(row.cols[7].value, $event)" @complete="row.cols[7].value = $event" /></span>
                                </div>
                                <div class="inventory-list__col">
                                    <span class="d-inline-flex align-center"><span>$</span>
                                    <input :id="`${i}-subtotal`" type="text" class="form__input" readonly v-model="row.cols[8].value" /></span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="form__form-group">
                    <div class="form__input-group">
                        <label class="form__label">Total inventory $</label>
                        <input type="text" class="form__input" v-model="total" />
                    </div>
                    <div class="form__input-group">
                        <LazyUiSignaturePadModal v-if="!hasTechSig" v-model="empSig" width="700px" height="219px" dialog :initial="false" sigType="employee" inputId="techSig" :sigData="techSig" sigRef="techSig" 
                            name="Technician signature" />
                        <img v-else style="object-fit: contain;" :src="$store.state.users.signature" />
                    </div>
                    <div class="form__input-group">
                        <LazyUiSignaturePadModal v-if="!reportFetched" width="700px" height="219px" dialog :initial="false" sigType="customer" inputId="cusSig" 
                            :sigData="customerSign" sigRef="cusSig" name="Customer Signature" />
                        <img v-else style="object-fit:contain;" :src="customerSign.data" />
                    </div>
                </div>
                <button type="submit" class="button button--normal">{{ submitting ? 'Submitting' : 'Submit' }}</button>
            </form>
        </ValidationObserver>
    </div>
</template>
<script>
import { computed, defineComponent, ref, useContext, useStore, watch, onMounted } from '@nuxtjs/composition-api'
import { dateMask } from "@/data/masks";
import useReports from '@/composable/reports'
import axios from 'axios'
import {compress, compressAccurately} from 'image-conversion';
export default defineComponent({
    props: {
        company: String,
        abbreviation: String
    },
    setup(props, { emit, refs }) {
        const { $api, $auth } = useContext()
        const { getReportPromise, loading } = useReports()
        const store = useStore()
        const editing = ref(false)
        const hasTechSig = ref(false)
        const errorDialog = ref(false)
        const message = ref([])
        const submitted = ref(false)
        const submitting = ref(false)
        const selectedJobId = ref("")
        const customerName = ref("")
        const claimNum = ref("")
        const insuranceCompany = ref("")
        const completionDate = ref("")
        const images = ref([])
        const generalErrorMessages = ref([])
        const inventoryList = ref([
            {
                item_num: 1,
                label: "Item #",
                cols: [{
                        id: "item_num",
                        label: "Item #"
                    },
                    {
                        id: "desc",
                        label: "Description",
                        value: ""
                    },
                    {
                        id: "image",
                        label: "Image",
                        value: ""
                    },
                    {
                        id: "restored",
                        label: "Restored?",
                        value: false
                    },
                    {
                        id: "disposed",
                        label: "Disposed?",
                        value: false
                    },
                    {
                        id: "stored",
                        label: "Stored?",
                        value: false
                    },
                    {
                        id: "qty",
                        label: "QTY",
                        value: 0
                    },
                    {
                        id: "rcv",
                        label:"RCV",
                        value: ""
                    },
                    {
                        id: "subtotal",
                        label: "Subtotal",
                        value: ""
                    }
                ]
            }
        ])
        const empSig = ref("")
        const techSig = ref({
            data: '',
            isEmpty: true
        })
        const customerSign = ref({
            data: '',
            isEmpty: true
        })
        const reportId = ref("");
        const inventoryImagesList = ref([]);
        const reportFetched = ref(false)
        const total = ref(0)
        const selectedItems = ref([])
        const user = computed(() => store.getters["users/getUser"])
        const reports = computed(() => store.getters["reports/getReports"])
        let timerID;
        let counter = 0;
        let pressHoldDuration = 50;
        
        const addFilesToInventory = (file, row) => {
            images.value.push(file)
            inventoryList.value[row].cols[2].value = file.image.imageName
        }
        const compressing = async (upload) => {
            var compressedFiles = []
            var images = []
            var formData = new FormData()
            
            await Promise.all(upload.map(async (file) => {
                const res = await compress(file.image.image, {
                    quality: .7,
                    scale: .8
                })
                let compressedImg = new File([res], file.image.imageName, {
                    type: res.type
                })
                formData.append("img", compressedImg)
                
                images.push({
                    image: compressedImg,
                    ItemNumber: file.itemNum
                })
            }))
            
            //Object.assign(compressedFile, {formData, imageName: upload.image.imageName, image: compressedImg, imageUrl: upload.image.imageUrl})
            compressedFiles.push({formData, images})
            return compressedFiles
        }
        const uploadFile = async (uploadarr) => {
            return new Promise((resolve, reject) => {
                compressing(uploadarr).then((result) => {
                    result[0].formData.append("JobId", selectedJobId.value)
                    axios.post(`${process.env.serverUrl}/api/image/upload/content-inventory-image`, result[0].formData, {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                            'Authorization': `${$auth.strategy.token.get()}`
                        }
                    }).then((res) => {
                        resolve(res.data)
                        setTimeout(() => {
                            message.value = []
                        }, 3000)
                    })
                }).catch((err) => {
                    if (err.response) {
                        reject(err.response.data)
                    }
                })
            })
        }
        async function submitForm() {
            submitting.value = true
            message.value = []
            
            const post = {
                JobId: selectedJobId.value,
                ReportType: "personal-content-inventory",
                formType: "logs-report",
                customer: customerName.value,
                claimNumber: claimNum.value,
                insurance: insuranceCompany.value,
                dateCompleted: completionDate.value,
                inventory: inventoryList.value,
                teamMember: user.value,
                cusSig: customerSign.value.data,
                techSig: empSig.value !== '',
                totalAmount: total.value,
                image_ids: inventoryImagesList.value
            }

            await refs.form.validate().then(success => {          
                if (!success) {
                    submitting.value = false
                    errorDialog.value = true
                    return
                }
                Promise.all([uploadFile(images.value)]).then((result) => {
                    console.log(result)
                    $api.$put(`/api/reports/${post.ReportType}/${selectedJobId.value}/update`, post).then((res) => {
                        submitted.value = true
                        submitting.value = false
                        message.value.push(result[0], res)
                        generalErrorMessages.value = []
                        setTimeout(() => {
                            window.location = "/"
                        }, 3000)
                    }).catch((err) => {
                        errorDialog.value = true
                        submitting.value = false
                        if (err.response) {
                            generalErrorMessages.value.push(err.response.data)
                        }
                    })
                }).catch((err) => {
                    if (err.response) {
                        generalErrorMessages.value.push(err.response.data)
                    }
                })
            })
        }
        function pressingDown(e, i) {
            requestAnimationFrame(function() {
                timer(i)
            })
            
        }
        function notPressingDown(e) {
            // stop the timer
            cancelAnimationFrame(timerID)
            counter = 0
        }
        function timer(i) {
            if (counter < pressHoldDuration) {
                timerID = requestAnimationFrame(function() {
                    timer(i)
                })
                counter++
            } else {
                editing.value = true
                selectRow(i+1)
                refs["row-"+index][0].removeEventListener("touchstart", pressingDown, false)
                refs["row-"+index][0].removeEventListener("touchend", notPressingDown, false)
            }
        }
        function selectRow(itemNum) {
            let selectedItem = selectedItems.value.findIndex(obj => {
                return obj.item_num === itemNum
            })
            if (selectedItem > -1) {
                selectedItems.value.splice(selectedItem, 1)
                return
            } else {
                selectedItems.value.push({item_num: itemNum})
            }
        }
        function deleteRow() {
            var firstItem = selectedItems.value.findIndex(e => e.item_num === 1)
            if (firstItem > -1) {
                inventoryList.value[0].cols.forEach((item, i) => {
                    if (item.hasOwnProperty('value')) {
                        item.value = ""
                    }
                })
            } else {
                selectedItems.value.forEach(item => {
                    let index = inventoryList.value.findIndex(o => o.item_num === item.item_num)
                    inventoryList.value.splice(index, 1)
                })
            }
            selectedItems.value = []
        }
        const addRow = (index) => {
            inventoryList.value.push({item_num: index+1, label: "Item #", cols: [{
                        id: "item_num",
                        label: "Item #"
                    },
                    {
                        id: "desc",
                        label: "Description",
                        value: ""
                    },
                    {
                        id: "image",
                        label: "Image",
                        value: ""
                    },
                    {
                        id: "restored",
                        label: "Restored?",
                        value: false
                    },
                    {
                        id: "disposed",
                        label: "Disposed?",
                        value: false
                    },
                    {
                        id: "stored",
                        label: "Stored?",
                        value: false
                    },
                    {
                        id: "qty",
                        label: "QTY",
                        value: 0
                    },
                    {
                        id: "rcv",
                        label:"RCV",
                        value: ""
                    },
                    {
                        id: "subtotal",
                        label: "Subtotal",
                        value: ""
                    }
                ]})
        }
        // This is on keypress
        const currencyFormat = (field, $event) => {
            let keyCode = ($event.keyCode ? $event.keyCode : $event.which);
            
            // only allow number and one dot
            if ((keyCode < 48 || keyCode > 57) && (keyCode !== 46 || [field].indexOf('.') != -1)) { // 46 is dot
                $event.preventDefault();
            }
            // restrict to 2 decimal places
            if([field]!=null && [field].indexOf(".")>-1 && ([field].split('.')[1].length > 1)){
                $event.preventDefault();
            }
        }
        const setSubtotalValue = (rowIndex) => {
            var subtotalArr = []
            const qty = refs[rowIndex + "-qty"][0].value
            const price = refs[rowIndex + "-rcv"][0].value.replace('$', '')
            const subtotalIndex = inventoryList.value[0].cols.findIndex(item => item.label === 'Subtotal')
            const curSubtotal = parseInt(qty) * parseFloat(price)
            if (!isNaN(curSubtotal)) {
                inventoryList.value[rowIndex].cols[subtotalIndex].value = curSubtotal
                for (let i = 0; i < inventoryList.value.length; i++) {
                    subtotalArr.push(inventoryList.value[i].cols[subtotalIndex].value)
                    total.value = inventoryList.value[i].cols[subtotalIndex].value
                }
                total.value = subtotalArr.reduce((a, b) => {
                    return a + b
                }, 0)
            }
        }
        
        watch(selectedItems, (val) => {
            if (val.length === 0) {
                editing.value = false
            } else {
                editing.value = true
            }
        })
        watch(selectedJobId, (val) => {
            loading.value = false
            var existingInv = reports.value.find(obj => {
                return obj.JobId === val && obj.ReportType === 'personal-content-inventory'
            })
            if (existingInv !== undefined) {
                getReportPromise(`personal-content-inventory/${val}`).then((result) => {
                    const { claimNumber, customer, dateCompleted, insurance, inventory, cusSig, techSig, totalAmount, Id } = result
                    customerName.value = customer
                    claimNum.value = claimNumber
                    insuranceCompany.value = insurance
                    completionDate.value = dateCompleted
                    inventoryList.value = inventory
                    customerSign.value.data = cusSig
                    hasTechSig.value = techSig
                    loading.value = false
                    total.value = totalAmount
                    reportId.value = Id

                    result.inventoryImages.forEach((image) => {
                        var row = result.inventory.findIndex(i => i.cols[2].value === image.img.filename)
                        if (row > 0) {
                            inventoryList.value[row].cols[2].value = `data:${image.img.contentType};base64,${image.img.data}`
                        }
                    })
                })
            } else {
                hasTechSig.value = false
                customerSign.value = { data: "", isEmpty: true }
                completionDate.value = ""
                total.value = 0
                inventoryList.value.forEach((item, i) => {
                    //item.item_num = ""
                    item.cols.forEach(c => {
                        c.value = ""
                    })
                })
                getReportPromise(`rapid-response/${val}`).then((result) => {
                    if (result.error) {
                        loading.value = false
                        customerName.value = ""
                        claimNum.value = ""
                        insuranceCompany.value =""
                    }
                    const { ClaimNumber, cusFirstName, cusLastName, InsuranceCompany } = result
                    customerName.value = cusFirstName + " " + cusLastName
                    claimNum.value = ClaimNumber
                    insuranceCompany.value = InsuranceCompany
                    loading.value = false
                    reportFetched.value = false
                })
            }
        })
        
        watch(hasTechSig, (val) => {
            if (val) {
                empSig.value = store.state.users.signature
            }
        })
        return {
            pressingDown,
            notPressingDown,
            timer,
            editing,
            selectRow,
            deleteRow,
            selectedItems,
            selectedJobId,
            errorDialog,
            generalErrorMessages,
            message,
            submitted,
            submitting,
            customerName,
            claimNum,
            insuranceCompany,
            completionDate,
            techSig,
            customerSign,
            submitForm,
            dateMask,
            loading,
            inventoryList,
            addRow,
            dateMask,
            currencyFormat,
            setSubtotalValue,
            empSig,
            hasTechSig,
            reportFetched,
            uploadFile,
            user,
            images,
            total,
            loading,
            addFilesToInventory
        }
    },
})
</script>
<style lang="scss" scoped>
.inventory-list {
    display:flex;
    flex-direction:column;
    justify-content: space-between;
    max-width:750px;
    
    @include respond(mobileLarge) {
        overflow-x:unset;
    }
    overflow-x:scroll;
    &__table {
        height:auto;
        position: relative;
        left:10px;
    }
    &__row {
        position:relative;
        display:grid;
        @include respond(mobileLargeMax) {
            grid-template-columns: 59px 107px 1fr 81px 86px 68px 53px 1fr 1fr;
        }
        grid-template-columns:60px 130px 1fr 81px 81px 77px 70px 1fr 1fr;
        border-top:1px solid $color-black;
        &:last-child {
            border-bottom:1px solid $color-black;
        }
        &--total {
            grid-template-areas:". . . . . . . total";
        }
        &.selected {
            box-shadow: inset 0px 0px 8px 0px black;
        }
    }
    &__col {
        border-right:1px solid $color-black;
        padding:5px;
        position:relative;
        &:last-child {
            border-left:none;
            //border-right:none
        }
        &:nth-of-type(1) {
            border-left:1px solid $color-black;
        }
        input {
            padding:2px;
            box-shadow:none;
            &[type=checkbox] {
                width:100%;
                height:100%;
            }
            &[type=file] {
                display:block;
                top:0;
            }
        }
        &--total {
            grid-area: total;
        }
    }
    &__item-image {
        &--preview {
            width:100%;
        }
    }
    &__checkbox {
        input {
            position:absolute;
            left:0;
            height:100%;
            width:13px;
            box-shadow:none;
        }
        position:absolute;
        height:100%;
        width:250px;
        left:-15px;
        //z-index:4;
    }
}
</style>