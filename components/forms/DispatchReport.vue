<!-- eslint-disable -->
<template>
  <div class="form-wrapper form-wrapper__dispatch-form">
    <h1 class="text-center">{{company}}</h1>
    <h2 class="text-center">Dispatch Service Evaluation Report</h2>
    <ValidationObserver ref="form" v-slot="{errors}">
      <v-dialog width="400px" v-model="errorDialog">
        <div class="modal__error">
          <div v-for="(error, i) in errors" :key="`error-${i}`">
            <h3 class="form__input--error">{{ error[0] }}</h3>
          </div>
        </div>
      </v-dialog>
      <h2>{{ message }}</h2>
      <p class="alert alert--error">{{errorMessage}}</p>
      <form class="form" @submit.prevent="submitForm" v-if="!submitted">
        <div class="form__form-group">
          <!-- <ValidationProvider
            v-slot="{ errors }"
            name="timeofCall"
            class="form__input--input-group"
          >
            <label class="form__label">Time of Call</label>
            <input v-model="timeOfCall" class="form__input" type="text" />
            <span class="form__input--error">{{ errors[0] }}</span>
          </ValidationProvider>-->
          <ValidationProvider  vid="JobId" v-slot="{ errors, ariaMsg, ariaInput }" name="Job Id" class="form__input-group form__input-group--short">
            <label class="form__label">Job ID Number</label>
            <input name="jobId" v-model="jobId" class="form__input" type="text" v-bind="ariaInput" />
            <span class="form__input--error" v-bind="ariaMsg">{{ errors[0] }}</span>
          </ValidationProvider>
          <div class="form__input-group form__input-group--short">
            <label for="timeOfCall" class="form__label">Time of Call</label>
            <v-dialog ref="timeDialog" v-model="timeModal" :return-value.sync="timeOfCall" persistent max-width="290px">
              <template v-slot:activator="{ on, attrs }">
                <input id="timeOfCall" v-model="timeFormatted" class="form__input" readonly v-bind="attrs" v-on="on" />
              </template>
              <v-time-picker v-if="timeModal" v-model="timeOfCall" full-width format="ampm" light>
                <v-spacer></v-spacer>
                <v-btn text color="#fff" @click="timeModal = false">Cancel</v-btn>
                <v-btn text color="#fff" @click="$refs.timeDialog.save(timeOfCall)">OK</v-btn>
              </v-time-picker>
            </v-dialog>
          </div>
          <div class="form__input-group form__input-group--short">
            <label for="dateOfCall" class="form__label">Date of Call</label>
            <UiDatePicker dateId="dateOfCall" dialogId="dialog" @date="dateFormatted = $event" />
          </div>
          <ValidationProvider class="form__input-group form__input-group--very-long">
            <label for="location" class="form__label">Location</label>
            <input type="hidden" v-model="location.address" />
            <UiGeoCoder @sendAddress="setLocation($event)" :mapView="false" geocoderid="geocoder" geocoderef="geocoderProperty" />
          </ValidationProvider>
        </div>
        <div class="form__form-group form__form-group--info-box">
          <div class="form__form-group--left-side">
            <label class="form__label">Caller Name</label>
            <div class="form__input-group--name-group">
              <ValidationProvider name="Caller First name" rules="required" v-slot="{errors, ariaMsg}" vid="callerFirstName">
                <input v-model="callerName.first" name="First name" placeholder="First" type="text" class="form__input capitalize" />
                <span class="form__input--error" v-bind="ariaMsg">{{ errors[0] }}</span>
              </ValidationProvider>
              <ValidationProvider name="Last name" rules="required_if:callerFirstName" v-slot="{errors, ariaMsg}">
                <input v-model="callerName.last" name="Last name" placeholder="Last" type="text" class="form__input capitalize" />
                <span class="form__input--error" v-bind="ariaMsg">{{ errors[0] }}</span>
              </ValidationProvider>
            </div>
            
            <label class="form__label">Arrival Contact Name</label>
            <div class="form__input-group--name-group">
              <ValidationProvider name="Arrival First name" rules="required" v-slot="{errors, ariaMsg}" vid="arrivalFirstName">
                <input v-model="arrivalContactName.first" placeholder="First" name="Arrival First name" type="text" class="form__input capitalize" />
                <span class="form__input--error" v-bind="ariaMsg">{{ errors[0] }}</span>
              </ValidationProvider>
              <ValidationProvider name="Last name" rules="required_if:arrivalFirstName" v-slot="{errors, ariaMsg}">
                <input v-model="arrivalContactName.last" placeholder="Last" name="Arrival Last name" type="text" class="form__input capitalize" />
                <span class="form__input--error" v-bind="ariaMsg">{{ errors[0] }}</span>
              </ValidationProvider>
            </div>
            <label class="form__label">Address</label>
            <input v-model="location.address" name="Address" type="text" class="form__input form__input--long" />
            <label class="form__label">City, State, Zip</label>
            <input v-model="location.cityStateZip" name="cityStateZip" type="text" class="form__input form__input--long" />
            <label class="form__label" for="phone">Phone Number</label>
            <input id="phone" v-model="phone" name="Phone" class="form__input form__input--short" type="phone" @input="acceptNumber" />
            <ValidationProvider v-slot="{ errors }" name="Email" vid="email">
              <label for="email" class="form__label">Email Address</label>
              <br />
              <input id="email" v-model="email" type="email" class="form__input form__input--normal" name="Email" />
              <span class="form__input--error">{{ errors[0] }}</span>
            </ValidationProvider>
          </div>
          <div class="form__form-group--right-side">
            <h2>Check all that apply</h2>
            <div v-for="propertyDesc in property" :key="propertyDesc.id" class="form__input-wrapper--checkboxes">
              <input :id="propertyDesc.id" v-model="selectedCheckboxes" type="checkbox" :value="propertyDesc.text" />
              <label :for="propertyDesc.id">{{ propertyDesc.text }}</label>
            </div>
          </div>
          <div class="form__form-group--block form__section">
            <h3>Intrusion Logs</h3>
            <div class="form__input-wrapper">
              <div class="form__input--input-group">
                <label for="dateOfIntrusion" class="form__label">Date of Intrusion</label>
                <UiDatePicker dateId="dateOfIntrusion" dialogId="dateOfIntrusion" @date="dateIntrusionFormatted = $event" />
              </div>
              <div class="form__input--input-group">
                <label for="timeIntrusionBegan" class="form__label">Time Intrusion Began</label>
                <v-dialog ref="timeIntrusionBegan" v-model="intrusionLogsDialog.timeIntBegan" persistent
                  :return-value.sync="timeIntBegan" transition="scale-transition" max-width="290px" light>
                  <template v-slot:activator="{ on, attrs }">
                    <input type="text" id="timeIntrusionBegan" v-model="timeIntBeganFormatted" class="form__input" v-bind="attrs"
                      v-on="on" />
                    <span class="button" @click="timeIntBegan = ''">clear</span>
                  </template>
                  <v-time-picker v-if="intrusionLogsDialog.timeIntBegan" v-model="timeIntBegan" format="ampm" full-width>
                    <v-spacer></v-spacer>
                    <v-btn text color="#fff" @click="intrusionLogsDialog.timeIntBegan = false">Cancel</v-btn>
                    <v-btn text color="#fff" @click="$refs.timeIntrusionBegan.save(timeIntBegan)">OK</v-btn>
                  </v-time-picker>
                </v-dialog>
              </div>
              <div class="form__input--input-group">
                <label for="timeIntrusionEnd" class="form__label">Time Intrusion End</label>
                <v-dialog ref="timeIntrusionEnd" v-model="intrusionLogsDialog.timeIntEnd" persistent
                  :return-value.sync="timeIntEnd" transition="scale-transition" max-width="290px" light>
                  <template v-slot:activator="{ on, attrs }">
                    <input type="text" id="timeIntrusionEnd" v-model="timeIntEndFormatted" class="form__input" v-bind="attrs"
                      v-on="on" />
                    <span class="button" @click="timeIntEnd = ''">clear</span>
                  </template>
                  <v-time-picker v-if="intrusionLogsDialog.timeIntEnd" v-model="timeIntEnd" format="ampm" full-width>
                    <v-spacer></v-spacer>
                    <v-btn text color="#fff" @click="intrusionLogsDialog.timeIntEnd = false">Cancel</v-btn>
                    <v-btn text color="#fff" @click="$refs.timeIntrusionEnd.save(timeIntEnd)">OK</v-btn>
                  </v-time-picker>
                </v-dialog>
              </div>
              <div class="form__input--input-group" v-for="(intrusion, i) in intrusionSection" :key="`intrusion-${i}`">
                <label :for="intrusion.label" class="form__label">{{intrusion.label}}</label>
                <input :id="intrusion.label" :type="intrusion.type" v-model="intrusion.value" class="form__input" />
              </div>
            </div>
          </div>
          <div class="form__form-group--full-width">
            <div class="form__input-group form__input-group--normal">
              <label for="appointment" class="form__label">Appointment time set for</label>
              <v-dialog content-class="time-pickers__range" max-width="700px" light ref="appointmentTimeDialog"
                        v-model="appointmentTimeModal" :return-value.sync="appointmentTimeFormatted" persistent>
                <template v-slot:activator="{ on, attrs }">
                  <input type="text" id="appointment" v-model="appointmentTimeFormatted" class="form__input" readonly
                         v-bind="attrs" v-on="on" />
                </template>
                <v-time-picker class="time-picker time-picker-start" v-if="appointmentTimeModal" v-model="appointmentTimeStart" format="ampm" :max="appointmentTimeEnd">
                  <v-spacer></v-spacer>
                  <!-- <v-btn text color="#fff" @click="appointmentTimeModal = false">Cancel</v-btn>
                  <v-btn text color="#fff" @click="$refs.appointmentTimeDialog.save(appointmentTimeStart)">OK</v-btn> -->
                </v-time-picker>
                <v-time-picker class="time-picker time-picker--end" v-if="appointmentTimeModal" v-model="appointmentTimeEnd" :min="appointmentTimeStart">
                  <v-spacer></v-spacer>
                  <v-btn text color="#fff" @click="appointmentTimeModal = false">Cancel</v-btn>
                  <v-btn text color="#fff" @click="$refs.appointmentTimeDialog.save(appointmentTimeEnd)">OK</v-btn>
                </v-time-picker>
              
              </v-dialog>
            </div>
            <div class="form__input-group form__input-group--normal">
              <label for="appointmentDate" class="form__label">Date of Appointment</label>
              <UiDatePicker dateId="appointmentDate" dialogId="dialogAppointment" @date="appointmentDateFormatted = $event" />
            </div>
            <div class="form__input-group form__input-group--long">
              <label for="updateTimeCall" class="form__label">(15-Min) ETA Verification Call Time</label>
              <v-dialog ref="updateCallTime" v-model="verificationTime.callTime" light :return-value.sync="callTime"
                        persistent width="400px">
                <template v-slot:activator="{ on, attrs }">
                  <input id="updateTimeCall" v-model="callTimeFormatted" class="form__input" readonly v-bind="attrs"
                         v-on="on" />
                  <span class="button d-block" @click="callTime = ''">clear</span>
                </template>
                <v-time-picker v-if="verificationTime.callTime" v-model="callTime" full-width format="ampm">
                  <v-spacer></v-spacer>
                  <v-btn text color="#fff" @click="verificationTime.callTime = false">Cancel</v-btn>
                  <v-btn text color="#fff" @click="$refs.updateCallTime.save(callTime)">OK</v-btn>
                </v-time-picker>
              </v-dialog>
            </div>
            <div class="form__input-group form__input-group--long">
              <label for="textVerificationTime" class="form__label">Text ETA Verification Time</label>
              <v-dialog ref="textVerificationTime" v-model="verificationTime.textEtaTime" light :return-value.sync="textEtaTime"
                        persistent max-width="290px">
                <template v-slot:activator="{ on, attrs }">
                  <input id="textVerificationTime" v-model="textEtaTimeFormatted" class="form__input" readonly
                         v-bind="attrs" v-on="on" />
                  <span class="button d-block" @click="textEtaTime = ''">clear</span>
                </template>
                <v-time-picker v-if="verificationTime.textEtaTime" v-model="textEtaTime" full-width format="ampm" light>
                  <v-spacer></v-spacer>
                  <v-btn text color="#fff" @click="verificationTime.textEtaTime = false">Cancel</v-btn>
                  <v-btn text color="#fff" @click="$refs.textVerificationTime.save(textEtaTime)">OK</v-btn>
                </v-time-picker>
              </v-dialog>
            </div>
          </div>
          <div class="form__form-group--full-width">
            <label for="notes" class="form__label">Notes</label>
            <textarea id="notes" class="form__input--textarea form__input" v-model="notes"></textarea>
          </div>
          <div class="form__form-group">
            <div class="form__input-group form__input-group--normal">
              <label class="form__label">Team Member</label>
              <p>{{getUser ? getUser.name : null}}</p>
            </div>
            <LazyUiSignaturePadModal v-model="empSig" width="650px" height="219px" inputId="teamMemberSig" :sigData="teamMemberSig" name="Team member signature" dialog :initial="false"
              sigRef="teamSignaturePad" sigType="employee" />
            <ValidationProvider name="Sign Date" rules="required" v-slot="{errors, ariaMsg}" class="form__input-group form__input-group--short">
                <label for="signDate" class="form__label">Sign date</label>
                <input type="hidden" v-model="signDate" />
                <imask-input id="signDate" @complete="signDate = $event" :lazy="false" :blocks="dateMask.blocks"
                              :mask="dateMask.mask" :format="dateMask.format" :parse="dateMask.parse"
                              :pattern="dateMask.pattern" class="form__input" />
                <span class="form__input--error" v-bind="ariaMsg">{{ errors[0] }}</span>
            </ValidationProvider>
            <ValidationProvider name="Time Sign" rules="required" v-slot="{errors, ariaMsg}" class="form__input-group form__input-group--short">
              <label for="timeSign" class="form__label">Sign Time</label>
              <imask-input v-model="signTime" :lazy="false" :mask="timeMask.mask" :blocks="timeMask.blocks" class="form__input" />
              <span class="form__input--error" v-bind="ariaMsg">{{ errors[0] }}</span>
            </ValidationProvider>
          </div>
        </div>
        <button class="button form__button-wrapper--submit" type="submit">{{ submitting ? 'Submitting' : 'Submit' }}</button>
      </form>
    </ValidationObserver>
    <div>
      <client-only>
         <vue-html2pdf :pdf-quality="2" pdf-content-width="100%" :html-to-pdf-options="htmlToPdfOptions('dispatch', jobId)" :paginate-elements-by-height="800" :manual-pagination="false"
                    :show-layout="false" :preview-modal="true" :enable-download="false" @beforeDownload="beforeDownloadNoSave($event, `dispatch-${jobId}`, jobId)"
                    @hasDownloaded="uploadPdf($event, `dispatch-${jobId}`, jobId)" ref="html2Pdf0">
          <LazyLayoutReportDetails :notPdf="false" reportName="Dispatch Report" :report="postedReport" slot="pdf-content" />
        </vue-html2pdf>
      </client-only>
    </div>
  </div>
</template>
<script>
  /* eslint-disable */
  import { computed, defineComponent, ref, useContext, useStore, watch, watchEffect } from '@nuxtjs/composition-api'
  import {
    mapGetters,
    mapState,
    mapActions
  } from 'vuex'
  /* import goTo from 'vuetify/es5/services/goto' */
  import { dateMask, timeMask } from "@/data/masks"
  import useReports from '@/composable/reports'
  import genericFuncs from '@/composable/utilityFunctions'
  export default defineComponent({
    props: {
      slice: String,
      company: String,
      abbreviation: String
    },
    setup(props, { refs }) {
      const store = useStore()
      const { $api } = useContext()
      const { formatDate, formatTime } = genericFuncs()
      const { htmlToPdfOptions, beforeDownloadNoSave, uploadPdf } = useReports()
      const id = ref("")
      const name = ref("")
      const jobId = ref("")
      const timeOfCall = ref(new Date().toTimeString().substr(0, 5))
      const timeFormatted = ref(formatTime(new Date().toTimeString().substr(0, 5)))
      const timeOfDay = ref('')
      const dateOfCall = ref('')
      const dateBoxSelected = ref(false)
      const date = ref(new Date().toISOString().substr(0, 10))
      const dateFormatted = ref(formatDate(new Date().toISOString().substr(0, 10)))
      const appointmentDateSelected = ref(false)
      const appointmentDate = new Date().toISOString().substr(0, 10)
      const appointmentDateFormatted = formatDate(
        new Date().toISOString().substr(0, 10)
      )
      const appointmentTimeSelected = ref(false)
      const appointmentTime = ref(new Date().toTimeString().substr(0, 5))
      const appointmentTimeFormatted = ref(formatTimeRange(
        new Date().toTimeString().substr(0, 5), new Date().toTimeString().substr(0, 5)
      ))
      const appointmentTimeStart = ref(null)
      const appointmentTimeEnd = ref(null)
      const modal = ref(false) //Binded to Date of call
      const modalAppointment = ref(false)
      const timeModal = ref(false)
      const appointmentTimeModal = ref(false)
      const verificationTime = ref({
        callTime: false,
        textEtaTime: false,
      })
      const callTime = ref(new Date().toTimeString().substr(0, 5))
      const callTimeFormatted = ref(formatTime(new Date().toTimeString().substr(0, 5)))
      const textEtaTime = ref(null)
      const textEtaTimeFormatted = ref(formatTime(new Date().toTimeString().substring(0, 5)))
      const location = ref({
        address: null,
        city: null,
        cityStateZip: null,
      })
      const callerName = ref({
        first: '',
        last: ''
      })
      const arrivalContactName = ref({
        first:'',
        last: ''
      })
      const email = ref('')
      const phone = ref('')
      const selectedCheckboxes = ref([])
      const notes = ref('')
      const message = ref('')
      const errorMessage =ref("")
      const submitted = ref(false)
      const submitting = ref(false)
      const property = ref([{
          id: 1,
          text: 'The property owner is the caller',
          checked: false
        },
        {
          id: 2,
          text: 'The property is insured properly',
          checked: false
        },
        {
          id: 3,
          text: 'The property is a residential building',
          checked: false
        },
        {
          id: 4,
          text: 'The property is a commercial building',
          checked: false
        },
        {
          id: 5,
          text: 'The property is an apartment/condo building',
          checked: false,
        },
        {
          id: 6,
          text: 'The property is currently wet',
          checked: false
        },
        {
          id: 7,
          text: 'The property has standing water',
          checked: false
        },
        {
          id: 8,
          text: 'The property has wet carpet',
          checked: false
        },
        {
          id: 9,
          text: 'The property has been wet longer than 72 hours',
          checked: false,
        },
        {
          id: 10,
          text: 'The property will require water pumps for extraction',
          checked: false,
        },
        {
          id: 11,
          text: 'The property has requested the use of PPE products by on-site personnel'
        }
      ])
      const intrusionLogsDialog = ref({
        dateIntrusion: false,
        timeIntBegan: false,
        timeIntEnd: false
      })
      const intrusionSection = ref([
        { label: 'Source of Intrusion', value: '', type: 'text' },
        { label: 'Age of Structure', value: '', type: 'text' },
        { label: 'Approximate sqft', value: '', type: 'number' },
        { label: 'Number of Rooms', value: '', type: 'number' },
        { label: 'Number of Floors', value: '', type: 'text' }
      ])
      const dateIntrusion = new Date().toISOString().substring(0, 10)
      const dateIntrusionFormatted = formatDate(new Date().toISOString().substring(0, 10))
      const timeIntBegan = ref(null)
      const timeIntBeganFormatted = ref(formatTime(new Date().toTimeString().substring(0, 5)))
      const timeIntEnd = ref(null)
      const timeIntEndFormatted = ref(formatTime(new Date().toTimeString().substring(0, 5)))
      const teamMemberSig = ref({
        data: '',
        isEmpty: true
      })
      const empSig = ref("")
      const signDate = ref("")
      const signTime = ref("")
      const sigDialog = ref(false)
      const errorDialog = ref(false)
      const errorArr = ref([])
      const postedReport = ref({})

      const getReports = computed(() => store.getters["reports/getReports"])
      const getUser = computed(() => store.getters["users/getUser"])
      
      const fetchReports = () => { store.dispatch("reports/fetchReports") }
      function formatTimeRange(timeStart, timeEnd) {
        if (!timeStart && !timeEnd) return null
        if (timeStart> timeEnd) return "Invalid time range"
        const startPieces = timeStart.split(':')
        const endPieces = timeEnd.split(':')
        let starthours, startminutes, endhours, endminutes
        if (startPieces.length === 2) {
          starthours = parseInt(startPieces[0], 10)
          startminutes = parseInt(startPieces[1], 10)
        }
        const newFormat1 = starthours >= 12 ? 'PM' : 'AM'
        starthours = starthours % 12
        // To display "0" as "12"
        starthours = starthours || 12
        startminutes = startminutes < 10 ? '0' + startminutes : startminutes
        if (endPieces.length === 2) {
          endhours = parseInt(endPieces[0], 10)
          endminutes = parseInt(endPieces[1], 10)
        }
        const newFormat2 = endhours >= 12 ? 'PM' : 'AM'
        endhours = endhours % 12
        // To display "0" as "12"
        endhours = endhours || 12
        endminutes = endminutes < 10 ? '0' + endminutes : endminutes
        return `${starthours}:${startminutes} ${newFormat1}-${endhours}:${endminutes} ${newFormat2}`
      }
      function acceptNumber() {
        var x = phone.value.replace(/\D/g, '').match(/(\d{0,3})(\d{0,3})(\d{0,4})/)
        phone.value = !x[2] ?
          x[1] :
          '(' + x[1] + ') ' + x[2] + (x[3] ? '-' + x[3] : '')
      }
      function setLocation(...params) {
        const { address, street, cityStateZip } = params[0]
        location.value.cityStateZip = cityStateZip
        location.value.address = street
      }
      function clear() {
        refs.signaturePad.clearSignature();
        cusSignature.value.isEmpty = true
        cusSignature.value.data = null
      }
      function save() {
        const {
          data,
          isEmpty
        } = refs.signaturePad.saveSignature();
        cusSignature.value.data = data;
        cusSignature.value.isEmpty = isEmpty
      }
      async function submitForm() {
        var dispatchRep = getReports.value.filter((v) => {
          return v.ReportType === 'dispatch'
        })
        const reports = dispatchRep.map((v) => {
          return v.JobId
        })
        await refs.form.validate().then(success => {
          if (!success) {
            errorDialog.value = true
            submitted.value = false
            submitting.value = false
            return
          }
          if (!reports.includes(jobId.value)) {
            Promise.all([onSubmit()]).then((result) => {
              message.value = result[0]
              refs.html2Pdf0.generatePdf()
            }).catch(error => console.log(`Error in promises ${error}`))
          } else {
            submitting.value = false
            errorDialog.value = true
            refs.form.setErrors({
              JobId: ["Duplicate Job ID can't exist"]
            })
            return;
          }
        })
      }
      function onSubmit() {
        message.value = ""
        const post = {
          JobId: jobId.value,
          callerName: callerName.value,
          ArrivalContactName: arrivalContactName.value,
          phoneNumber: phone.value,
          emailAddress: email.value,
          location: location.value,
          timeFormatted: timeFormatted.value,
          dateFormatted: dateFormatted.value,
          appointmentDate: appointmentDateFormatted,
          appointmentTime: appointmentTimeFormatted.value,
          callTimeUpdate: callTimeFormatted.value,
          textTimeUpdate: textEtaTimeFormatted.value,
          propertyChkList: selectedCheckboxes.value,
          intrusion: intrusionSection.value,
          dateOfIntrusion: dateIntrusionFormatted,
          timeIntrusionBegan: timeIntBeganFormatted.value,
          timeIntrusionEnded: timeIntEndFormatted.value,
          summary: notes.value,
          ReportType: 'dispatch',
          formType: 'initialForms',
          teamMember: getUser.value,
          id: getUser.value.id,
          teamMemberSig: Object.keys(empSig.value).length !== 0,
          signDate: signDate.value,
          signTime: signTime.value
        };
        postedReport.value = post
        submitting.value = true
        return new Promise((resolve, reject) => {
          $api.$post("/api/reports/dispatch/new", post, {
            params: {
                jobid: post.JobId
            }
          }).then((res) => {
              submitted.value = true
              submitting.value = false
              fetchReports()
              resolve(res)
          }).catch(err => {
              errorDialog.value = true
              refs.form.setErrors({
                JobId: [err.response.data.message]
              })
          })
        })
      }

      watch(() => appointmentTimeFormatted.value, (val) => {
        appointmentTimeFormatted.value = formatTimeRange(appointmentTimeStart.value, appointmentTimeEnd.value)
      })
      watch(() => timeOfCall.value, (val) => {
        timeFormatted.value = formatTime(val)
      })
      watch(() => timeIntBegan.value, (val) => {
        timeIntBeganFormatted.value = formatTime(val)
      })
      watch(() => timeIntEnd.value, (val) => {
        timeIntEndFormatted.value = formatTime(val)
      })
      watch(() => callTime.value, (val) => {
        callTimeFormatted.value = formatTime(val)
      })
      watch(() => textEtaTime.value, (val) => {
        textEtaTimeFormatted.value = formatTime(val)
      })

      return {
        id, name, jobId, timeOfCall, timeFormatted, timeOfDay, dateOfCall, dateBoxSelected, date, dateFormatted, appointmentDateSelected, appointmentDate,
        appointmentDateFormatted, appointmentDateSelected, appointmentTime, appointmentTimeFormatted, appointmentTimeStart, appointmentTimeEnd, modal, modalAppointment,
        timeModal, appointmentTimeModal, verificationTime, callTime, callTimeFormatted, textEtaTime, textEtaTimeFormatted, location, callerName, arrivalContactName,property,
        email, phone, selectedCheckboxes, appointmentTime, notes, message, errorMessage, submitted, submitting, intrusionLogsDialog, intrusionSection, dateIntrusion, dateIntrusionFormatted,
        timeIntBegan, timeIntBeganFormatted, timeIntEnd, timeIntEndFormatted, teamMemberSig, empSig, signDate, signTime, sigDialog, errorDialog, errorArr, dateMask, timeMask, postedReport,
        acceptNumber, getUser,
        setLocation,
        save,
        clear,
        submitForm,
        htmlToPdfOptions,
        beforeDownloadNoSave,
        onSubmit,
        uploadPdf
      }
    }
  })
  
</script>