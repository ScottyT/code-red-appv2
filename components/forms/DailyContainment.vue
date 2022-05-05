<template>
  <div class="form-wrapper form-wrapper__case-file">
    <h1 class="text-center">{{company}}</h1>
    <h2 class="text-center">Daily Containement Case File Report</h2>
    <ValidationObserver ref="form">
      <h2>{{message}}</h2>
      <ul v-if="errors.length > 0">
        <li v-for="(error, i) in errors" :key="`listing-${i}`">{{error}}</li>
      </ul>
      <v-dialog width="400px" v-model="errorDialog">
        <div class="modal__error">
          <div v-for="(error, i) in errors" :key="`error-${i}`">
            <h3 class="form__input--error">{{ error[0] }}</h3>
          </div>
        </div>
      </v-dialog>
      <form ref="form" class="form" @submit.prevent="submitForm" v-if="!submitted">
        <div class="form__form-group">
          <ValidationProvider rules="required" vid="JobId" v-slot="{ errors, ariaMsg }" name="Job Id" class="form__input-group form__input-group--normal">
            <input type="hidden" v-model="selectedJobId" />
            <label class="form__label">Job ID Number</label>
            <i class="form__select--icon icon--angle-down mdi" aria-label="icon"></i>
            <select class="form__input" v-model="selectedJobId">
              <option disabled value="">Please select a Job ID</option>
              <option v-for="(item, i) in $store.state.reports.jobids" :key="`jobid-${i}`">{{item}}</option>
            </select>
            <span class="form__input--error" v-bind="ariaMsg">{{ errors[0] }}</span>
          </ValidationProvider>
          <div class="form__input-group form__input-group--short">
            <label class="form__label">Team Lead ID #</label>
            <input type="text" @click="$refs.teamLeadError.textContent = 'You are not allowed to edit your ID number'" readonly v-model="getUser.id" name="teamLeadId" class="form__input" />
            <span class="error--text" ref="teamLeadError"></span>
          </div>
          <div class="form__input-group form__input-group--short">
            <label for="date" class="form__label">Date</label>
            <UiDatePicker dateId="date" dialogId="dateDialog" @date="dateFormatted = $event" @unformattedDate="date = $event" />
          </div>
          <div class="form__input-group form__input-group--long">
            <label for="location" class="form__label">Location</label>
            <UiGeoCoder @sendAddress="settingLocation($event)" :mapView="false" geocoderid="geocoder" geocoderef="geocoder" />
          </div>
        </div>
        <div class="form__form-group">
          <ValidationProvider rules="required" v-slot="{errors, ariaMsg}" class="form__input-group form__input-group--long">
            <label for="address" class="form__label">Street Address</label>
            <input id="address" v-model="location.address" name="Address" type="text" class="form__input" />
            <span class="form__input--error" v-bind="ariaMsg">{{ errors[0] }}</span>
          </ValidationProvider>
          <ValidationProvider rules="required" v-slot="{errors, ariaMsg}" class="form__input-group form__input-group--long">
            <label for="cityStateZip" class="form__label">City, State, and Zip</label>
            <input id="cityStateZip" v-model="location.cityStateZip" name="City, State, and Zip" type="text" class="form__input" />
            <span class="form__input--error" v-bind="ariaMsg">{{ errors[0] }}</span>
          </ValidationProvider>
        </div>
        <div class="form__form-group--listing form__section form__form-group--info-box">
          <h3>1) TMP REPAIR</h3>    
          <ol class="form__form-group--block" v-for="(item, i) in tmpRepairSection" :key="`item-${i}`">
            <li>
              {{item.subheading}}
            </li>
            <ol class="form__form-group form__form-group--sublisting">
              <li v-for="(subitem, i) in item.sublist" :key="`sub-${i}`">
                <input :id="`subitem${i}`" type="checkbox" v-model="selectedTMPRepairs" :value="subitem.label" />
                <label :for="`subitem${i}`" class="form__label">{{subitem.label}}</label>               
              </li>
            </ol>
          </ol>
        </div>
        <div class="form__form-group--listing form__form-group--info-box">
          <h3>2) CONTENT</h3>
          <ol class="">                
              <li v-for="(item, i) in contentSection" :key="`content-${i}`">                
                  <span>{{item.subheading}}</span>
                  <ol class="form__form-group form__form-group--sublisting">
                      <li v-for="(subitem, i) in item.sublist" :key="`content-sublist-${i}`">
                          <input :id="subitem.label" type="checkbox" v-model="selectedContent" :value="subitem" />
                          <label class="form__label" :for="subitem.label">{{subitem.label}}</label>                        
                      </li>
                  </ol>
              </li>
          </ol>
        </div>
        <div class="form__form-group--listing form__form-group--info-box">
          <h3>3) STRUCTURAL DRYING</h3>
          <ol class="form__form-group--listing">
            <li v-for="(item, i) in structualDryingSection" :key="`structure-${i}`">
              <span>{{item.subheading}}</span>
              <ol class="form__form-group form__form-group--sublisting">
                <li v-for="(subitem, i) in item.sublist" :key="`structure-sublist${i}`">
                  <input :id="subitem.label" type="checkbox" v-model="selectedStructualDrying" :value="subitem" />
                  <label class="form__label" :for="subitem.label">{{subitem.label}}</label>
                </li>
              </ol>
            </li>
          </ol>
        </div>
        <div class="form__form-group--listing form__form-group--info-box">
          <h3>4) STRUCTURAL CLEANING</h3>
          <ol class="form__form-group--listing">
            <li v-for="(item, i) in structualCleaningSection" :key="`cleaning-${i}`">
              <span>{{item.subheading}}</span>
              <ol class="form__form-group form__form-group--sublisting">
                <li v-for="(subitem, i) in item.sublist" :key="`cleaning-sublist${i}`">
                  <input :id="subitem.label" type="checkbox" v-model="selectedStructualCleaning" :value="subitem" />
                  <label class="form__label" :for="subitem.label">{{subitem.label}}</label>
                </li>
              </ol>
            </li>
          </ol>
        </div>
        <div class="form__form-group--block form__section">
          <h3>Evaluation Logs</h3>
          <div class="d-flex">
            <div class="form__input-group form__input-group--normal">
              <label for="dispatchToProperty" class="form__label">Dispatch to Property</label>
              <v-dialog ref="dispatchDialog" v-model="evalLogsDialog.dispatchToProperty" light persistent
                  :return-value.sync="dispatchToProperty" transition="scale-transition" max-width="290px">
                  <template v-slot:activator="{ on, attrs }">
                    <input type="text" id="dispatchToProperty" v-model="dispatchPropertyFormatted" class="form__input"
                      v-bind="attrs" v-on="on" />
                    <span class="button" @click="dispatchToProperty = ''">clear</span>
                  </template>
                  <v-time-picker v-if="evalLogsDialog.dispatchToProperty" v-model="dispatchToProperty" format="ampm"
                    full-width>
                    <v-spacer></v-spacer>
                    <v-btn text color="#fff" @click="evalLogsDialog.dispatchToProperty = false">Cancel</v-btn>
                    <v-btn text color="#fff" @click="$refs.dispatchDialog.save(dispatchToProperty)">OK</v-btn>
                  </v-time-picker>
              </v-dialog>
            </div>
            <div class="form__input-group form__input-group--normal">
              <label for="startTime" class="form__label">Start Time</label>
              <v-dialog ref="dialogEvalStart" v-model="evalLogsDialog.evalStart" light persistent
                  :return-value.sync="evalStart" transition="scale-transition" max-width="290px">
                  <template v-slot:activator="{ on, attrs }">
                    <input type="text" id="startTime" v-model="evalStartFormatted" class="form__input"
                      v-bind="attrs" v-on="on" />
                    <span class="button" @click="evalStart = ''">clear</span>
                  </template>
                  <v-time-picker v-if="evalLogsDialog.evalStart" v-model="evalStart" format="ampm"
                    full-width>
                    <v-spacer></v-spacer>
                    <v-btn text color="#fff" @click="evalLogsDialog.evalStart = false">Cancel</v-btn>
                    <v-btn text color="#fff" @click="$refs.dialogEvalStart.save(evalStart)">OK</v-btn>
                  </v-time-picker>
              </v-dialog>
            </div>
            <div class="form__input-group form__input-group--normal">
              <label for="endTime" class="form__label">End Time</label>
              <v-dialog ref="dialogEvalEnd" v-model="evalLogsDialog.evalEnd" light persistent
                  :return-value.sync="evalEnd" transition="scale-transition" max-width="290px">
                  <template v-slot:activator="{ on, attrs }">
                    <input type="text" id="endTime" v-model="evalEndFormatted" class="form__input"
                      v-bind="attrs" v-on="on" />
                    <span class="button" @click="evalEnd = ''">clear</span>
                  </template>
                  <v-time-picker v-if="evalLogsDialog.evalEnd" v-model="evalEnd" format="ampm"
                    full-width>
                    <v-spacer></v-spacer>
                    <v-btn text color="#fff" @click="evalLogsDialog.evalEnd = false">Cancel</v-btn>
                    <v-btn text color="#fff" @click="$refs.dialogEvalEnd.save(evalEnd)">OK</v-btn>
                  </v-time-picker>
              </v-dialog>
            </div>
            <div class="form__input--input-group">
              <label for="totalTime" class="form__label">Total Time</label>
              <input type="text" readonly v-model="duration" />
            </div>
          </div>
          <div class="form__form-group">
            <LazyUiSignaturePadModal v-model="empSig" width="700px" sigType="employee" height="219px" inputId="verifySigRef" :initial="false" :sigData="verifySig" 
              sigRef="verifySignaturePad" name="Sign for Verification" />
            <ValidationProvider ref="jobimages" name="Job images" class="upload-group upload-group--lg">
              <label class="form__label">Containment job images</label>
              <UiFilesUpload :singleImage="false" subDir="" path="containment-images" delimiter="/" :rootPath="selectedJobId" @sendDownloadUrl="uploadedImages = $event" />
            </ValidationProvider>
          </div>
        </div>
        <div class="form__button-wrapper"><button class="button form__button-wrapper--submit" type="submit">{{ submitting ? 'Submitting' : 'Submit' }}</button></div>
      </form>
    </ValidationObserver>
    <div>
      <client-only>
          <vue-html2pdf :pdf-quality="2" pdf-content-width="100%" :html-to-pdf-options="htmlToPdfOptions('case-file-containment', selectedJobId)"
                        :paginate-elements-by-height="800" :manual-pagination="false" :show-layout="false"
                        :preview-modal="true" :enable-download="false" @hasDownloaded="uploadPdf($event, `case-file-containment-${selectedJobId}`, selectedJobId)"
                        @beforeDownload="beforeDownloadNoSave($event, `case-file-containment-${selectedJobId}`, selectedJobId)" ref="html2Pdf0">
              <LazyLayoutCaseFileDetails form_name="Case File Containment" :notPdf="false" :report="postedData" slot="pdf-content" />
          </vue-html2pdf>
      </client-only>
    </div>
  </div>
</template>
<script>
  import moment from 'moment';
  import { defineComponent, ref, useStore, computed, useContext, watch } from '@nuxtjs/composition-api';
  import genericFuncs from '@/composable/utilityFunctions'
  import useReports from '@/composable/reports'
  export default defineComponent({
    props: {
      slice: String,
      company: String,
      abbreviation: String
    },
    setup(props) {
      const store = useStore()
      const { $api } = useContext()
      const { formatTime, formatDate, parseDate } = genericFuncs()
      const { htmlToPdfOptions, beforeDownloadNoSave, uploadPdf } = useReports()
      const fetchReports = () => { store.dispatch("reports/fetchReports") }
      const date = new Date().toISOString().substr(0, 10)
      const dateFormatted = formatDate(new Date().toISOString().substr(0, 10))
      const location = ref({
        address: null,
        city: null,
        cityStateZip: null
      })
      const message = ref('')
      const tmpRepairSection = ref([{
        subheading: "Temporary Repairs",
        sublist: [{
            label: "Temporary Board-Up"
          },
          {
            label: "Temporary Tarp"
          },
          {
            label: "Temporary Power/Generator"
          }
        ]
      }])
      const selectedTMPRepairs = ref([])
      const contentSection = ref([
          {
              subheading: "Content - (On-site)",
              sublist: [
                  {label: "Content Manipulation", group:"Content - (On-site)"},
                  {label: "Brick & Stack", group:"Content - (On-site)"},
                  {label: "Furniture Dolly & Blankets", group:"Content - (On-site)"}
              ]
          },
          {
              subheading: "Content - (Off-site)",
              sublist: [
                  {label: "Inventory", group: "Content - (Off-site)"},
                  {label: "Storage Pod", group: "Content - (Off-site)"},
                  {label: "Storage Warehouse", group: "Content - (Off-site)"},
                  {label: "Small Box", group: "Content - (Off-site)"},
                  {label: "Medium Box", group: "Content - (Off-site)"},
                  {label: "Large Box", group: "Content - (Off-site)"},
                  {label: "Moving Van", group: "Content - (Off-site)"},
                  {label: "Truck Load of Debris", group: "Content - (Off-site)"},
                  {label: "Warehouse Clean Technician", group: "Content - (Off-site)"}
              ]
          }
      ])
      const selectedContent = ref([])
      const structualDryingSection = ref([
        {
          subheading: "Water Removal Services (Multiple Extractions may be required)",
          sublist: [
            {label:"H-Surface Extraction", group: "Water Removal Services (Multiple Extractions may be required)"},
            {label: "Carpet Extraction", group: "Water Removal Services (Multiple Extractions may be required)"},
            {label:"Lifted Carpet & Air", group: "Water Removal Services (Multiple Extractions may be required)"}
          ]
        },
        {
          subheading: "Protection - Plastic/Paper",
          sublist: [
            {label: "Containment Barrier", group: "Protection - Plastic/Paper"},
            {label: "Temporary Posts", group: "Protection - Plastic/Paper"},
            {label: "Cover Content", group: "Protection - Plastic/Paper"},
            {label: "Floor Protection", group: "Protection - Plastic/Paper"}
          ]
        },
        {
          subheading: "Material Removal",
          sublist: [
            {label: "Cut Caulk Lines", group:"Material Removal"},
            {label: "Baseboard", group: "Material Removal"},
            {label: "Trim/Casing", group: "Material Removal"},
            {label: "Doors", group: "Material Removal"},
            {label: "Floor Pad/Moisture B", group: "Material Removal"},
            {label: "Flooring", group: "Material Removal"},
            {label: "Tack Strip", group: "Material Removal"},
            {label: "Flooring Glue", group: "Material Removal"},
            {label: "Drywall Air-Wholes", group: "Material Removal"},
            {label: "Drywall Four Inch", group: "Material Removal"},
            {label: "Drywall Twenty Inch", group: "Material Removal"},
            {label: "Drywall Forty Inch", group: "Material Removal"},
            {label: "Wall Moisture B.", group: "Material Removal"},
            {label: "Paper-back Insulation", group: "Material Removal"},
            {label: "Blown-in Insulation", group: "Material Removal"},
            {label: "2” Wall Plaster/Lath", group: "Material Removal"}
          ]
        },
        {
          subheading: "Material Detach",
          sublist: [
            {label: "Toe-Kick", group: "Material Detach"},
            {label: "Cabinet", group: "Material Detach"},
            {label: "Vanity", group: "Material Detach"},
            {label: "Counter", group: "Material Detach"},
            {label: "Tub/Base", group: "Material Detach"},
            {label: "Shower/Surround", group: "Material Detach"},
            {label: "Shower Doors", group: "Material Detach"},
            {label: "Curtain Rod", group: "Material Detach"},
            {label: "Toilet", group: "Material Detach"},
            {label: "Medicine Cabinet", group: "Material Detach"},
            {label: "Sink/Faucet", group: "Material Detach"},
            {label: "P-Trap", group: "Material Detach"},
            {label: "Stovetop", group: "Material Detach"},
            {label: "Refrigerator", group: "Material Detach"},
            {label: "Oven", group: "Material Detach"},
            {label: "Dish Washer", group: "Material Detach"},
          ]
        }
      ])
      const selectedStructualDrying = ref([])
      const structualCleaningSection = ref([
        {
          subheading: "Cleaning (Initial Clean) - (Bulk Clean) - (Final Clean)",
          sublist: [
            {label: "Clean Floors", group: "Cleaning (Initial Clean) - (Bulk Clean) - (Final Clean)"},
            {label: "Clean Studs", group: "Cleaning (Initial Clean) - (Bulk Clean) - (Final Clean)"},
            {label: "Clean Walls", group: "Cleaning (Initial Clean) - (Bulk Clean) - (Final Clean)"},
            {label: "Clean Ceiling", group: "Cleaning (Initial Clean) - (Bulk Clean) - (Final Clean)"},
            {label: "HEPA Vac Walls", group: "Cleaning (Initial Clean) - (Bulk Clean) - (Final Clean)"},
            {label: "HEPA Vac Ceilings", group: "Cleaning (Initial Clean) - (Bulk Clean) - (Final Clean)"},
            {label: "HEPA Studs", group: "Cleaning (Initial Clean) - (Bulk Clean) - (Final Clean)"},
            {label: "HEPA Horizontal", group: "Cleaning (Initial Clean) - (Bulk Clean) - (Final Clean)"},
            {label: "Clean Horizontal", group: "Cleaning (Initial Clean) - (Bulk Clean) - (Final Clean)"},
            {label: "Clean Vertical", group: "Cleaning (Initial Clean) - (Bulk Clean) - (Final Clean)"},
            {label: "Clean Rafters/Joists", group: "Cleaning (Initial Clean) - (Bulk Clean) - (Final Clean)"},
            {label: "Clean Heavy", group: "Cleaning (Initial Clean) - (Bulk Clean) - (Final Clean)"}
          ]
        },
        {
          subheading: "Agents & Sealants",
          sublist: [
            {label: "Anti-Microbial Agent", group: "Agents & Sealants"},
            {label: "Odor Control Agent", group: "Agents & Sealants"},
            {label: "Mold Agent", group: "Agents & Sealants"},
            {label: "Biological Agent", group: "Agents & Sealants"},
            {label: "Anti-Micro Sealant", group: "Agents & Sealants"},
            {label: "Odor Shellac", group: "Agents & Sealants"},
            {label: "Mold Sealant", group: "Agents & Sealants"},
            {label: "Encapsulate Sealant", group: "Agents & Sealants"}
          ]
        }
      ])
      const selectedStructualCleaning = ref([])
      const evalLogsDialog = ref({
        dispatchToProperty: false,
        evalStart: false,
        evalEnd: false,
        evalTotalTime: false
      })
      const dispatchToProperty = ref(null)
      const dispatchPropertyFormatted = ref(formatTime(new Date().toTimeString().substring(0, 5)))
      const evalStart = ref(new Date().toTimeString().substring(0, 5))
      const evalStartFormatted = ref(formatTime(new Date().toTimeString().substring(0, 5)))
      const evalEnd = ref(new Date().toTimeString().substring(0, 5))
      const evalEndFormatted = ref(formatTime(new Date().toTimeString().substring(0, 5)))
      const verifySig = ref({
        data: '',
        isEmpty: true
      })
      const empSig = ref("")
      const submitting = ref(false)
      const submitted = ref(false)
      const selectedJobId = ref("")
      const errorDialog = ref(false)
      const errors = ref([])
      const uploadedImages = ref([])
      const form = ref(null)
      const html2Pdf0 = ref(null)
      const postedData = ref({})

      const getUser = computed(() => store.getters["users/getUser"])
      const getReports = computed(() => store.getters["reports/getReports"])
      const duration = computed(() => {
        let start = moment(`${date} ${evalStart.value}`, "YYYY-MM-DD hh:mm")
        let end = moment(`${date} ${evalEnd.value}`, "YYYY-MM-DD hh:mm")
        let duration = moment.duration(end.diff(start)).asMinutes()
        return duration + ' minutes'
      })
      const parsedDate = computed(() => {
        return moment(dateFormatted, "MM-DD-YYYY").format("MM-DD-YYYY")
      })

      async function submitForm() {
        const reports = getReports.value.filter((v) => {
          return v.ReportType === 'case-file-containment'
        })
        const dates = reports.map((v) => {
          return v.date
        })
        
        await form.value.validate().then(success => {
          if (!success) {
            submitting.value = false
            submitted.value = false
            return
          }
          if (!dates.includes(dateFormatted.value)) {
            Promise.all([onSubmit()]).then((result) => {
              console.log(result)
              message.value = result[0]
              html2Pdf0.value.generatePdf()
            })
          } else {
              submitted.value = false
              submitting.value = false
              errorDialog.value = true
              errors.value.push('Cannot have two containment reports with the same date')
              return
          }
        })
      }
      function onSubmit() {
        message.value = ''
        submitting.value = true
        const user = getUser.value;
        
        const evaluationLogs = [{
            label: 'Dispatch to Property',
            value: `${parsedDate.value} ${dispatchPropertyFormatted.value}:00`
          },
          {
            label: 'Start Time',
            value: `${parsedDate.value} ${evalStart.value}:00`
          },
          {
            label: 'End Time',
            value: `${parsedDate.value} ${evalEnd.value}:00`
          },
          {
            label: 'Total Time',
            value: duration.value
          }
        ]
        const post = {
          JobId: selectedJobId.value,
          id: user.id,
          date: dateFormatted.value,
          location: location.value,
          selectedTMPRepairs: selectedTMPRepairs.value,
          selectedContent: selectedContent.value,
          selectedStructualCleaning: selectedStructualCleaning.value,
          selectedStructualDrying: selectedStructualDrying.value,
          selectedStructualCleaning: selectedStructualCleaning.value,
          evaluationLogs: evaluationLogs.value,
          verifySig: Object.keys(empSig.value).length !== 0,
          ReportType: 'case-file-containment',
          formType: 'case-report',
          teamMember: getUser.value,
          afterHoursWork: 'N/A',
          date: parsedDate.value,
          evaluationLogs: evaluationLogs
        };
        postedData.value = post
        return new Promise((resolve, reject) => {
          $api.$post("/api/reports/case-file-containment/new", post, {
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
              submitting.value = false
              errors.value.push(err.response.data.message)
              reject(err)
          })
        })
      }
      function settingLocation(params) {
        location.value.address = params.address
        location.value.cityStateZip = params.cityStateZip
      }

      watch(() => dispatchToProperty.value, (val) => {
        dispatchPropertyFormatted.value = formatTime(val)
      })
      watch(() => evalStart.value, (val) => {
        evalStartFormatted.value = formatTime(val)
      })
      watch(() => evalEnd.value, (val) => {
        evalEndFormatted.value = formatTime(val)
      })

      return {
        date,
        dateFormatted,
        location,
        tmpRepairSection,
        selectedTMPRepairs,
        contentSection,
        selectedContent,
        structualDryingSection,
        selectedStructualDrying,
        structualCleaningSection,
        selectedStructualCleaning,
        evalLogsDialog,
        dispatchToProperty,
        dispatchPropertyFormatted,
        evalStart,
        evalStartFormatted,
        evalEnd,
        evalEndFormatted,
        verifySig,
        empSig,
        submitting,
        submitted,
        selectedJobId,
        errorDialog,
        uploadedImages,
        form,
        html2Pdf0,
        getUser,
        submitForm,
        htmlToPdfOptions,
        beforeDownloadNoSave,
        onSubmit,
        uploadPdf,
        duration,
        postedData,
        message,
        errors,
        settingLocation,
        parsedDate
      }
    }
  })
  
</script>