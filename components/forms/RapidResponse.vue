<template>
  <div class="form-wrapper form-wrapper__rapid-form">
    <h1 class="text-center">{{company}}</h1>
    <h2 class="text-center">Rapid Response Evaluation Report</h2>
    <ValidationObserver ref="form" v-slot="{ errors }">
      <v-dialog width="600px" v-model="errorDialog">
        <div class="modal__error">
          <div v-for="(error, i) in errors" :key="`error-${i}`">
            <h3 class="form__input--error">{{ error[0] }}</h3>
          </div>
        </div>
      </v-dialog>
      <h2 class="alert alert--success">{{ successMessage }}</h2>
      <form v-if="!submitted" class="form" enctype="multipart/form-data" @submit.prevent="submitForm">
        <div class="form__form-group">
          <ValidationProvider v-slot="{ errors }" vid="JobId" name="Job ID" rules="required" class="form__input-group form__input-group--normal">
            <label for="jobId" class="form__label">Job ID</label>
            <input v-model="jobId" id="jobId" name="jobId" class="form__input" @keydown.space.prevent type="text" />
            <span class="form__input--error">{{ errors[0] }}</span>
          </ValidationProvider>
          <div class="form__input-group form__input-group--normal">
            <label for="dateOfLoss" class="form__label">Date of Loss</label>
            <UiDatePicker dateId="dateOfLoss" dialogId="dolDialog" @date="dolFormatted = $event" />
          </div>
          <div class="form__input-group form__input-group--normal">
            <label for="timeOfDispatch" class="form__label">Time of Dispatch</label>
            <v-dialog ref="todDialog" v-model="todModal" :return-value.sync="timeOfDispatch" persistent max-width="290px">
              <template v-slot:activator="{ on, attrs }">
                <input id="timeOfDispatch" v-model="timeOfDispatchFormatted" v-bind="attrs" class="form__input" v-on="on" readonly />
              </template>
              <v-time-picker v-model="timeOfDispatch" scrollable full-width format="ampm" light>
                <v-spacer></v-spacer>
                <v-btn text color="#fff" @click="todModal = false">Cancel</v-btn>
                <v-btn text color="#fff" @click="$refs.todDialog.save(timeOfDispatch)">OK</v-btn>
              </v-time-picker>
            </v-dialog>
          </div>
          <div class="form__input-group form__input-group--normal">
            <label for="dateOfEval" class="form__label">Date of Evaluation</label>
            <UiDatePicker dateId="dateOfEval" dialogId="doeDialog" @date="doeFormatted = $event" />
          </div>
          <ValidationProvider class="form__input-group form__input-group--very-long">
            <label for="location" class="form__label">Address</label>
            <input type="hidden" v-model="location.address" />
            <UiGeoCoder @sendAddress="setLocation($event)" :mapView="false" geocoderid="geocoder" geocoderef="geocoderProperty" />
          </ValidationProvider>
        </div>
        <div class="form__form-group form__form-group--info-box">
          <div class="form__form-group form__form-group--images-upload-section form__section">
            <ValidationProvider ref="idprovider" v-slot="{ errors }" name="Photo ID" class="upload-group upload-group--sm">
              <label class="form__label">Photo ID</label>
              <input type="hidden" v-model="idImage" />
              <UiFilesUpload singleImage path="" subDir="" :changeImageName="`id-photo-${jobId}`" :rootPath="jobId" @sendPreviews="idImage = $event" />
              <span class="form__input--error">{{ errors[0] }}</span>
            </ValidationProvider>
          </div>
          <div class="form__form-group--left-side form__section">
            <label for="contactName" class="form__label">Contact Name</label>
            <div class="form__input-group--name-group">
              <ValidationProvider rules="required" name="Contact first name" v-slot="{errors, ariaMsg}">
                <input v-model="contactName.first" placeholder="First" type="text" class="form__input capitalize" />
                <span class="form__input--error" v-bind="ariaMsg">{{ errors[0] }}</span>
              </ValidationProvider>
              <ValidationProvider rules="required" name="Contact last name" v-slot="{errors, ariaMsg}">
                <input type="text" class="form__input capitalize" v-model="contactName.last" placeholder="Last" />
                <span class="form__input--error" v-bind="ariaMsg">{{ errors[0] }}</span>
              </ValidationProvider>
            </div>
            <label for="PropertyOwner" class="form__label">Property Owner</label>
            <div class="form__input-group--name-group">
              <ValidationProvider rules="required" name="Property owner first name" v-slot="{errors, ariaMsg}">
                <input v-model="propertyOwner.first" placeholder="First" type="text" class="form__input capitalize" />
                <span class="form__input--error" v-bind="ariaMsg">{{ errors[0] }}</span>
              </ValidationProvider>
              <ValidationProvider rules="required" name="Property owner last name" v-slot="{errors, ariaMsg}">
                <input type="text" class="form__input capitalize" v-model="propertyOwner.last" placeholder="Last" />
                <span class="form__input--error" v-bind="ariaMsg">{{ errors[0] }}</span>
              </ValidationProvider>
            </div>
            <label class="form__label">City, State, Zip</label>
            <input v-model="location.cityStateZip" name="cityStateZip" type="text" class="form__input form__input--long" />
            <label class="form__label">Address</label>
            <input
              v-model="location.address"
              name="Address"
              type="text"
              class="form__input form__input--long"
            />
            <!-- <label class="form__label">City, State, Zip</label>
            <input
              v-model="location.cityStateZip"
              name="cityStateZip"
              type="text"
              class="form__input form__input--long"
              readonly
            /> -->
            <label class="form__label" for="phone">Phone Number</label>
            <input id="phone" v-model="phoneNumber" name="Phone" class="form__input form__input--short" type="phone"
              @input="acceptNumber" />
            <ValidationProvider v-slot="{ errors }" name="Email" rules="required">
              <label for="email" class="form__label">Email Address</label>
              <input v-model="emailAddress" id="email" type="text" class="form__input" name="Email" />
              <span class="form__input--error">{{ errors[0] }}</span>
            </ValidationProvider>
          </div>
          <div class="form__form-group--right-side form__section">
            <h4>Inital Response, Inspection, and Preliminary Determination</h4>
            <div v-show="jobId" ref="initResponse">
              <ul class="form__checkbox-wrapper--long">
                <div class="form__input--checkboxes" v-for="item in picturesCheck" :key="item.id">
                  <input type="checkbox" :id="item.id" v-model="selectedPictures" :value="item.text" />
                  <label :for="item.id">{{item.text}}</label>
                  <UiFilesUpload v-if="selectedPictures.includes(item.text)" path="" subDir="" singleImage :changeImageName="`${item.text}__${jobId}`" 
                    :rootPath="jobId" @sendDownloadUrl="item.image = $event" autoUpload fieldName="singleImage" />
                </div>
              </ul>
              <UiFilesUpload :singleImage="false" :isStorage="false" path="rapid-response" subDir="" :rootPath="jobId" buttonName="Add job images" delimiter="/" />
            </div>
            <h3 v-show="jobId === ''">Please put in a Job ID in order to view these fields</h3>
          </div>
          <div class="form__section">
            <h3>Source of Water Intrusion</h3>
            <ul class="form__checkbox-wrapper">
              <div class="form__input-wrapper--checkboxes" v-for="(type, i) in sourceOfIntrustion" :key="`loss-${i+1}`">
                <input type="checkbox" :id="`loss-${i+1}`" v-model="selectedTypes" :value="type.text" />
                <label :for="`loss-${i+1}`">{{type.text}}</label>
              </div>
            </ul>
          </div>
          <div class="form__form-group--block form__section">
            <div class="form__input-wrapper">
              <div class="form__input--input-group">
                <label for="dateOfIntrusion" class="form__label">Date of Intrusion</label>
                <UiDatePicker dateId="dateOfIntrusion" dialogId="dateIntrusionDialog" @date="dateIntrusionFormatted = $event" />
              </div>
              <div class="form__input--input-group">
                <label for="timeIntrusion" class="form__label">Time of Intrusion</label>
                <v-dialog ref="timeIntrusionDialog" v-model="intrusionLogsDialog.timeIntrusion" persistent
                  :return-value.sync="timeIntrusion" transition="scale-transition" max-width="290px" light>
                  <template v-slot:activator="{ on, attrs }">
                    <input type="text" id="timeIntrusion" v-model="timeIntrusionFormatted" class="form__input" readonly v-bind="attrs" v-on="on" />
                    <span class="button" @click="timeIntrusion = ''">clear</span>
                  </template>
                  <v-time-picker v-if="intrusionLogsDialog.timeIntrusion" v-model="timeIntrusion" format="ampm" full-width>
                    <v-spacer></v-spacer>
                    <v-btn text color="#fff" @click="intrusionLogsDialog.timeIntrusion = false">Cancel</v-btn>
                    <v-btn text color="#fff" @click="$refs.timeIntrusionDialog.save(timeIntrusion)">OK</v-btn>
                  </v-time-picker>
                </v-dialog>
              </div>
              <div class="form__input--input-group" v-for="intrusion in intrusionSection" :key="intrusion.label">
                <label :for="intrusion.label" class="form__label">{{intrusion.label}}</label>
                <input :type="intrusion.type" :id="intrusion.label" v-model="intrusion.value" class="form__input" />
              </div>            
            </div>
            <LazyUiSignaturePadModal v-model="cusInitial1" :sigData="initialData" sigRef="initial1Pad" inputId="initial1" name="Initial" width="200px" height="70px" 
              :dialog="false" initial sigType="customer" />
          </div>
          <div class="form__form-group--grid">
            <div class="form__section">
              <h3>Preliminary Determination</h3>
              <div class="form__checkbox-wrapper">
                <div class="form__input-wrapper--checkboxes" v-for="item in preliminaryDetermination" :key="item">
                  <input type="checkbox" :id="item" v-model="selectedPreliminary" :value="item" />
                  <label :for="item">{{item}}</label>
                </div>
              </div>
              <LazyUiSignaturePadModal v-model="cusInitial2" :sigData="initialData" sigRef="initial2Pad" inputId="initial2" name="Initial" width="200px" height="70px"
                :dialog="false" initial sigType="customer" />             
            </div>
            <div class="form__section">
              <h3>Inital Moisture Inspection</h3>
              <div class="form__checkbox-wrapper">
                <div class="form__input-wrapper--checkboxes" v-for="item in moistureInspection" :key="item.label">
                  <input type="checkbox" :id="item.label" v-model="selectedInspection" :value="item" />
                  <label :for="item.label">{{item.label}}</label>
                  <span style="width:71px;" v-if="item.hasOwnProperty('dryStandard') && selectedInspection.findIndex(el => el.label === 'Establish a Dry Standard') >= 0">
                    <imask-input :mask="dryStandardMask.mask" :unmask="true" :lazy="dryStandardMask.lazy" :placeholderChar="'_'"
                    v-model="selectedInspection.find(el => el.hasOwnProperty('dryStandard')).dryStandard" />
                  </span>
                </div>
              </div>
              <LazyUiSignaturePadModal v-model="cusInitial3" :sigData="initialData" sigRef="initial3Pad" inputId="initial3" name="Initial" width="200px" height="70px" 
                :dialog="false" initial sigType="customer" />
            </div>
          </div>
          <div class="form__form-group form__form-group--info-box form__section">
            <label class="form__label">Initial Moisture Map</label>
            <p>An initial moisture inspection should be conducted to identify the full extent of water intrusion, including the
                identification of affected assemblies, building materials, and the edge of water mitigation. Normally, this process
                begins at the source of the water intrusion. The initial inspection process should continue in all directions from the
                source of water intrusion until the restorer identifies and documents the extent of migration. The extent of the
                moisture migration should be documented using one or more appropriate methods including at a minimum a
                moisture map. (i.e., a diagram of the structure indicating the areas affected by migrating water). IICRC S500 Pg 179</p>
            <div class="map-wrapper">
              <div class="map-wrapper__map">
                <div class="map-wrapper__map--row" v-for="n in 37" :key="n">
                  <div class="map-wrapper__map--col" v-for="n in 20" :key="n"></div>
                </div>
              </div>
              <VueSignaturePad width="100%" height="703px" ref="map" class="map-wrapper__canvas" :options="{ onBegin, minWidth: 1.5, maxWidth:3.5, penColor: penColor }" />
              <div class="pt-3 pb-3">
                <button type="button" class="button--normal" :class="`button ${moistureMap.isEmpty ? 'button--disabled': ''}`" 
                  @click="saveMap">{{ moistureMap.data !== '' ? 'Saved' : 'Save' }}</button>
                <button type="button" class="button--normal" @click="undoMap">Undo</button>
                <div class="map-wrapper__pen">
                  <span class="map-wrapper__pen-color" aria-label="black" :class="penColor === '#000'?'active' : ''"
                        @click="changePenColor(0)" style="background:#000"></span>
                  <span class="map-wrapper__pen-color" :class="penColor === '#6c8ce6'?'active' : ''"
                        aria-label="shallow-water" @click="changePenColor(1)" style="background:#6c8ce6"></span>
                  <span class="map-wrapper__pen-color" :class="penColor === '#3047f1'?'active' : ''"
                        aria-label="normal-water" @click="changePenColor(2)" style="background:#3047f1"></span>
                  <span class="map-wrapper__pen-color" :class="penColor === '#0a2177'?'active' : ''"
                        aria-label="deep-water" @click="changePenColor(3)" style="background:#0a2177"></span>
                </div>
              </div>
            </div>
            <LazyUiSignaturePadModal v-model="cusInitial4" :sigData="initialData" sigRef="initial4Pad" inputId="initial4" name="Initial" width="200px" height="70px" initial 
              :dialog="false" sigType="customer" />
          </div>
          <div class="form__form-group form__section">
            <h3>Pre-Restoration Evaluation</h3>
            <div class="d-flex flex-wrap">
              <span class="form__input-group form__input-group--long">
                <label for="emergencyRes" class="form__label">Emergency Response Actions Identified</label>
                <input id="emergencyRes" type="text" class="form__input" v-model="preRestoreEval.emergencyResAct" />
              </span>
              <span class="form__input-group form__input-group--long">
                <label for="buildingMat" class="form__label">Building Material Restorability</label>
                <input id="buildingMat" type="text" class="form__input" v-model="preRestoreEval.buildingMatRestore" />
              </span>
              <span class="form__input-group form__input-group--long">
                <label for="contentEval" class="form__label">Content Evaluation</label>
                <input id="contentEval" type="text" class="form__input" v-model="preRestoreEval.contentEval" />
              </span>
              <span class="form__input-group form__input-group--long">
                <label for="hvacEval" class="form__label">HVAC Evaluation</label>
                <input id="hvacEval" type="text" class="form__input" v-model="preRestoreEval.hvacEval" />
              </span>
              <span class="form__input-group form__input-group--long">
                <label for="substructure" class="form__label">Substructure & Unfinished Spaces</label>
                <input id="substructure" type="text" class="form__input" v-model="preRestoreEval.substructure" />
              </span>
            </div>
          </div>
          <div class="form__section">
            <h3>Develop Initial Project Work Plan & Communicate to Headquarters</h3>
            <div class="form__checkbox-wrapper--long form__checkbox-wrapper">
              <div class="form__input-wrapper--checkboxes" v-for="(step, i) in steps" :key="`steps-${i+1}`">
                <input type="checkbox" :id="`steps-${i+1}`" v-model="selectedSteps" :value="step.text" />
                <label :for="`steps-${i+1}`">{{step.text}}</label>
              </div>
            </div>
          </div>
          <div class="form__form-group form__section">
            <ValidationProvider v-slot="{errors}" name="Insurance" rules="required" class="form__input-group form__input-group--normal">
              <label for="insurance" class="form__label">Insurance Company</label>
              <input type="text" id="insurance" class="form__input" name="insurance" v-model="insuranceCompany" />
              <span class="form__input--error">{{ errors[0] }}</span>
            </ValidationProvider>
            <ValidationProvider v-slot="{errors}" name="claimNumber" class="form__input-group form__input-group--normal">
              <label for="claimNumber" class="form__label">Claim Number</label>
              <input type="text" id="claimNumber" class="form__input" name="claimNumber" v-model="claimNumber" />
              <span class="form__input--error">{{ errors[0] }}</span>
            </ValidationProvider>
            <ValidationProvider v-slot="{errors}" name="policyNumber" class="form__input-group form__input-group--normal">
              <label for="policyNumber" class="form__label">Policy Number</label>
              <input type="text" id="policyNumber" class="form__input" name="policyNumber" v-model="policyNumber" />
              <span class="form__input--error">{{ errors[0] }}</span>
            </ValidationProvider>
            <span class="form__input-group form__input-group--normal">
              <label for="adjusterName" class="form__label">Adjuster Name</label>
              <input id="adjusterName" type="text" class="form__input capitalize" v-model="adjusterName" />
            </span>
            <span class="form__input-group form__input-group--normal">
              <label for="adjusterPhone" class="form__label">Adjuster Phone</label>
              <input id="adjusterPhone" :value="adjusterPhone" class="form__input" v-imask="phoneMask" @accpet="adjusterPhone = $event.detail.value"
                @complete="adjusterPhone = $event.detail.value" />
            </span>
            <ValidationProvider v-slot="{errors}" name="Adjuster email" rules="email" class="form__input-group form__input-group--long">
              <label for="adjusterEmail" class="form__label">Adjuster Email</label>
              <input type="email" id="adjusterEmail" class="form__input" name="policyNumber" v-model="adjusterEmail" />
              <span class="form__input--error">{{ errors[0] }}</span>
            </ValidationProvider>
          </div>
          <div class="form__form-group--block form__section">
            <h3>Evaluation Logs</h3>
            <div class="form__input-wrapper">
              <div class="form__input--input-group">
                <label for="arrivalProperty" class="form__label">Team Arrival at Property</label>
                <v-dialog ref="dialogArrival" v-model="evalLogsDialog.arrivalAtProperty" light persistent
                  :return-value.sync="arrivalAtProperty" transition="scale-transition" max-width="290px">
                  <template v-slot:activator="{ on, attrs }">
                    <input type="text" id="arrivalProperty" v-model="arrivalFormatted" class="form__input" readonly
                      v-bind="attrs" v-on="on" />
                  </template>
                  <v-time-picker v-if="evalLogsDialog.arrivalAtProperty" v-model="arrivalAtProperty" format="ampm"
                    full-width>
                    <v-spacer></v-spacer>
                    <v-btn text color="#fff" @click="evalLogsDialog.arrivalAtProperty = false">Cancel</v-btn>
                    <v-btn text color="#fff" @click="$refs.dialogArrival.save(arrivalAtProperty)">OK</v-btn>
                  </v-time-picker>
                </v-dialog>
              </div>
              <div class="form__input--input-group">
                <label for="evalStart" class="form__label">Evaluation Report Start Time</label>
                <v-dialog ref="dialogEvalStart" v-model="evalLogsDialog.evalStart" light persistent
                  :return-value.sync="evalStart" transition="scale-transition" max-width="290px">
                  <template v-slot:activator="{ on, attrs }">
                    <input type="text" id="evalStart" v-model="evalStartFormatted" class="form__input" v-bind="attrs" readonly
                      v-on="on" />
                  </template>
                  <v-time-picker v-if="evalLogsDialog.evalStart" v-model="evalStart" format="ampm" full-width>
                    <v-spacer></v-spacer>
                    <v-btn text color="#fff" @click="evalLogsDialog.evalStart = false">Cancel</v-btn>
                    <v-btn text color="#fff" @click="$refs.dialogEvalStart.save(evalStart)">OK</v-btn>
                  </v-time-picker>
                </v-dialog>
              </div>
              <div class="form__input--input-group">
                <label for="evalEnd" class="form__label">Evaluation Report End Time</label>
                <v-dialog ref="dialogEvalEnd" v-model="evalLogsDialog.evalEnd" persistent light :return-value.sync="evalEnd"
                  transition="scale-transition" max-width="290px">
                  <template v-slot:activator="{ on, attrs }">
                    <input type="text" id="evalEnd" v-model="evalEndFormatted" class="form__input" v-bind="attrs"
                      v-on="on" />
                  </template>
                  <v-time-picker v-if="evalLogsDialog.evalEnd" v-model="evalEnd" format="ampm" full-width>
                    <v-spacer></v-spacer>
                    <v-btn text color="#fff" @click="evalLogsDialog.evalEnd = false">Cancel</v-btn>
                    <v-btn text color="#fff" @click="$refs.dialogEvalEnd.save(evalEnd)">OK</v-btn>
                  </v-time-picker>
                </v-dialog>
              </div>
              <div class="form__input--input-group">
                <label for="contractSigning" class="form__label">Time of Contract Signing</label>
                <v-dialog ref="dialogContractSigning" v-model="evalLogsDialog.contractSigning" light persistent
                  :return-value.sync="contractSigning" transition="scale-transition" max-width="290px">
                  <template v-slot:activator="{ on, attrs }">
                    <input type="text" id="contractSigning" v-model="contractFormatted" class="form__input"
                      v-bind="attrs" v-on="on" />
                  </template>
                  <v-time-picker v-if="evalLogsDialog.contractSigning" v-model="contractSigning" format="ampm" full-width>
                    <v-spacer></v-spacer>
                    <v-btn text color="#fff" @click="evalLogsDialog.contractSigning = false">Cancel</v-btn>
                    <v-btn text color="#fff" @click="$refs.dialogContractSigning.save(contractSigning)">OK</v-btn>
                  </v-time-picker>
                </v-dialog>
              </div>
              <!-- <div class="form__input--input-group">
                <label for="denialOfServices" class="form__label">Time of Denial of Services</label>
                <v-dialog ref="dialogDos" v-model="evalLogsDialog.denialOfServices" persistent
                  :return-value.sync="denialOfServices" transition="scale-transition" max-width="290px">
                  <template v-slot:activator="{ on, attrs }">
                    <input type="text" id="denialOfServices" v-model="dosformatted" class="form__input" v-bind="attrs"
                      v-on="on" />
                    <span class="button" @click="denialOfServices = ''">clear</span>
                  </template>
                  <v-time-picker v-if="evalLogsDialog.denialOfServices" v-model="denialOfServices" format="ampm"
                    full-width>
                    <v-spacer></v-spacer>
                    <v-btn text color="#fff" @click="evalLogsDialog.denialOfServices = false">Cancel</v-btn>
                    <v-btn text color="#fff" @click="$refs.dialogDos.save(denialOfServices)">OK</v-btn>
                  </v-time-picker>
                </v-dialog>
              </div>
              <div class="form__input--input-group">
                <label for="departureOfProperty" class="form__label">Team Departure of Property</label>
                <v-dialog ref="dialogDepartureTime" v-model="evalLogsDialog.departureTime" persistent
                  :return-value.sync="departureTime" transition="scale-transition" max-width="290px">
                  <template v-slot:activator="{ on, attrs }">
                    <input type="text" id="departureOfProperty" v-model="departureTimeFormatted" class="form__input"
                      v-bind="attrs" v-on="on" />
                    <span class="button" @click="departureTime = ''">clear</span>
                  </template>
                  <v-time-picker v-if="evalLogsDialog.departureTime" v-model="departureTime" format="ampm" full-width>
                    <v-spacer></v-spacer>
                    <v-btn text color="#fff" @click="evalLogsDialog.departureTime = false">Cancel</v-btn>
                    <v-btn text color="#fff" @click="$refs.dialogDepartureTime.save(departureTime)">OK</v-btn>
                  </v-time-picker>
                </v-dialog>
              </div> -->
            </div>
          </div>
          <div class="form__section">
            <h3>Team Lead Document Verification</h3>
            <div class="form__input-wrapper--checkboxes" v-for="item in verificationCheckboxes" :key="`item${item.id+1}`">
              <input type="checkbox" :id="`item${item.id+1}`" v-model="selectedVerification" :value="item.text" />
              <label :for="`item${item.id+1}`">{{item.text}}</label>
            </div>
          </div>
          <div class="d-flex flex-column pt-4 pb-4">
            <label class="form__label">Customer (Print)</label>
            <div class="grid grid--three-column">
              <ValidationProvider v-slot="{ errors }" name="Customer first name" rules="required">
                <input id="firstname" placeholder="First" type="text" class="form__input capitalize" v-model="customerName.first" />
                <span class="form__input--error">{{ errors[0] }}</span>
              </ValidationProvider>
              <ValidationProvider v-slot="{ errors }" name="Customer last name" rules="required">
                <input id="lastname" placeholder="Last" type="text" class="form__input capitalize" v-model="customerName.last" />
                <span class="form__input--error">{{ errors[0] }}</span>
              </ValidationProvider>
              <LazyUiSignaturePadModal width="700px" height="219px" dialog :initial="false" sigType="customer" inputId="cusSignature" :sigData="cusSignature" 
                sigRef="cusSignaturePad" name="Customer signature" />
            </div>
          </div>
          <ValidationProvider v-slot="{ errors }" name="Customer sign date" rules="required" class="form__input-group form__input-group--normal">
            <label for="signDate" class="form__label">Customer Sign Date</label>
            <input type="hidden" v-model="cusSignDate" />
            <imask-input id="signDate" @complete="cusSignDate = $event" :lazy="false" :blocks="dateMask.blocks" :mask="dateMask.mask" :format="dateMask.format" 
                :parse="dateMask.parse" :pattern="dateMask.pattern" class="form__input" />
            <span class="form__input--error">{{ errors[0] }}</span>
          </ValidationProvider>
          <div class="form__form-group">
            <ValidationProvider v-slot="{ errors }" name="Customer sign time" rules="required" class="form__input-group form__input-group--normal">
              <label class="form__label">Sign Time</label>
              <input type="hidden" v-model="cusSignTime" />
              <imask-input v-model="cusSignTime" :lazy="false" :mask="timeMask.mask" :blocks="timeMask.blocks" class="form__input" />
              <span class="form__input--error">{{ errors[0] }}</span>
            </ValidationProvider>
            <ValidationProvider v-slot="{ errors }" name="Customer sign date" rules="required" class="form__input-group form__input-group--normal">
              <label for="signDate" class="form__label">Sign Date</label>
              <input type="hidden" v-model="teamMemberSignDate" />
              <imask-input id="teamsignDate" @complete="teamMemberSignDate = $event" :lazy="false" :blocks="dateMask.blocks" :mask="dateMask.mask" :format="dateMask.format" 
                            :parse="dateMask.parse" :pattern="dateMask.pattern" class="form__input" />
              <span class="form__input--error">{{ errors[0] }}</span>
            </ValidationProvider>
            <LazyUiSignaturePadModal v-model="empSig" width="700px" height="219px" dialog :initial="false" sigType="employee" inputId="teamMemberSig" :sigData="teamMemberSig" 
              sigRef="teamSignaturePad" name="Team member signature" />
          </div>
        </div>
        <div class="form__button-wrapper"><button type="submit" class="button form__button-wrapper--submit">{{ submitting ? 'Submitting' : 'Submit' }}</button></div>
      </form>
    </ValidationObserver>
    <div>
      <client-only>
          <vue-html2pdf :pdf-quality="2" pdf-content-width="800px" :html-to-pdf-options="htmlToPdfOptions('rapid-response', jobId)"
                        :paginate-elements-by-height="1300" :enable-download="false" @beforeDownload="beforeDownloadNoSave($event, `rapid-response-${jobId}`, jobId)"
                        @hasDownloaded="uploadPdf($event, `rapid-response-${jobId}`, jobId)" :manual-pagination="false" :show-layout="false" :preview-modal="true" ref="html2Pdf0">
              <LazyLayoutResponseReportDetails company="Water Emergency Services Incorporated" reportName="Rapid Response Report" slot="pdf-content" :notPdf="false" 
                :report="postData" />
          </vue-html2pdf>
      </client-only>
    </div>
  </div>
</template>
<script>
  import {mapGetters, mapState, mapActions} from 'vuex'
  import 'animate.css'
  import goTo from 'vuetify/es5/services/goto'
  import { timeMask, dateMask } from "@/data/masks";
  import { defineComponent, ref, useStore, computed, nextTick, watch } from '@nuxtjs/composition-api';
  import genericFuncs from '@/composable/utilityFunctions';
  import useReports from '@/composable/reports'
  export default defineComponent({
    props: {
      slice: String,
      company: String,
      abbreviation: String
    },
    setup(props, { refs }) {
      const { formatDate, formatTime } = genericFuncs()
      const { htmlToPdfOptions, beforeDownloadNoSave, uploadPdf } = useReports()
      const store = useStore()
      const map = ref(null)
      const errorDialog = ref(false)
      const sigDialog = ref(false)
      const uploading = ref(false)
      const successMessage = ref('')
      const errorMessage = ref([])
      const uploadSuccess = ref('')
      const submitting = ref(false)
      const submitted = ref(false)
      const jobId = ref("")
      const timeOfDispatch = ref(new Date().toTimeString().substr(0, 5))
      const timeOfDispatchFormatted = ref(formatTime(new Date().toTimeString().substr(0, 5)))
      const dateOfLoss = new Date().toISOString().substring(0, 10)
      const dolFormatted = formatDate(new Date().toISOString().substring(0, 10))
      const dateOfEval = new Date().toISOString().substr(0, 10)
      const doeFormatted = formatDate(new Date().toISOString().substr(0, 10))
      const arrivalAtProperty = ref(new Date().toTimeString().substr(0, 5))
      const arrivalFormatted = ref(formatTime(new Date().toTimeString().substr(0, 5)))
      const evalStart = ref(new Date().toTimeString().substr(0, 5))
      const evalStartFormatted = ref(formatTime(new Date().toTimeString().substr(0, 5)))
      const evalEnd = ref(new Date().toTimeString().substr(0, 5))
      const evalEndFormatted = ref(formatTime(new Date().toTimeString().substr(0, 5)))
      const contractSigning = ref(new Date().toTimeString().substr(0, 5))
      const contractFormatted = ref(formatTime(new Date().toTimeString().substr(0, 5)))
      const denialOfServices = ref(null)
      const dosformatted = ref(formatTime(new Date().toTimeString().substr(0, 5)))
      const departureTime = ref(null)
      const departureTimeFormatted = ref(formatTime(new Date().toTimeString().substr(0, 5)))
      const evalLogsDialog = ref({
        arrivalAtProperty: false,
        evalStart: false,
        evalEnd: false,
        contractSigning: false,
        denialOfServices: false,
        departureTime: false
      })
      const todModal = ref(false)
      const dolModal = ref(false)
      const doeModal = ref(false)
      const contactName = ref({
        first: '',
        last:''
      })
      const propertyOwner = ref({
        first: '',
        last: ''
      })
      const phoneNumber = ref('')
      const emailAddress = ref('')
      const location = ref({
        address: null,
        cityStateZip: null,
      })
      const sourceOfIntrustion = ref([{
          id: 1,
          text: 'Frozen Pipes',
          checked: false
        },
        {
          id: 2,
          text: 'Sump Pump Failure',
          checked: false
        },
        {
          id: 3,
          text: 'Broken Pipe',
          checked: false
        },
        {
          id: 4,
          text: 'Roof Leak',
          checked: false
        },
        {
          id: 5,
          text: 'Sprinkler System',
          checked: false
        },
        {
          id: 6,
          text: 'Outside Spicket',
          checked: false
        },
        {
          id: 7,
          text: 'Washer Line',
          checked: false
        },
        {
          id: 8,
          text: 'Toilet Overflow',
          checked: false
        },
        {
          id: 9,
          text: 'Sink Overflow',
          checked: false
        },
        {
          id: 10,
          text: 'Tub Overflow',
          checked: false
        },
        {
          id: 11,
          text: 'Sewage Backup',
          checked: false
        },
        {
          id: 12,
          text: 'Broken Valve',
          checked: false
        },
        {
          id: 13,
          text: 'Fire',
          checked: false
        },
        {
          id: 14,
          text: 'Hail',
          checked: false
        },
        {
          id: 15,
          text: 'Mold',
          checked: false
        },
        {
          id: 16,
          text: 'Vandalism',
          checked: false
        },
        {
          id: 17,
          text: 'Water',
          checked: false
        },
        {
          id: 18,
          text: 'Other',
          checked: false
        }
      ])
      const intrusionLogsDialog = ref({
        dateIntrusion: false,
        timeIntrusion: false
      })
      const intrusionSection = ref([
        { id:'statusOfIntrusion', label: 'Control Status of Intrusion', value: '', type: 'text' },
        { id:'structureType', label: 'Structure Type', value: '', type: 'text' },
        { id:'use', label: 'Use', value: '', type: 'text' },
        { id:'history', label: 'History', value: '', type: 'text' },
        { id:'age', label: 'Age', value: '', type: 'text' },
        { id:'appxSqft', label: 'Approximate sqft', value: '', type: 'number' },
        { id:'numberOfRooms', label: 'Number of Rooms', value: '', type: 'number' },
        { id:'numberOfFloors', label: 'Number of Floors', value: '', type: 'text' }
      ])
      const dateIntrusion = new Date().toISOString().substr(0, 10)
      const dateIntrusionFormatted = formatDate(new Date().toISOString().substr(0, 10))
      const timeIntrusion = ref(null)
      const timeIntrusionFormatted = ref(formatTime(new Date().toTimeString().substring(0, 5)))
      const preliminaryDetermination = ref([
        "Category 1 Water",
        "Category 2 Water",
        "Category 3 Water",
        "High Risk Occupents",
        "Public Health Issues Exist",
        "Risk of Adverse Health Effects",
        "Occupants Express Contaminates",
        "Believed Aerosolizing",
        "Stop & Determine Contaminates"
      ])
      const moistureInspection = ref([
        {label: "Free Water"},
        {label:"Bound Water"},
        {label:"Water Migration"},
        {label:"Affected Assemblies"},
        {label:"Establish a Dry Standard", dryStandard: ""},
        {label:"Instrument Documentation"},
        {label:"Class 2 (significant)"},
        {label:"Class 3 (more than 40%)"},
        {label:"Class 4 (Deeply Bound)"}
      ])
      const preRestoreEval = ref({
        emergencyResAct: '',
        buildingMatRestore: '',
        contentEval: '',
        hvacEval: '',
        substructure:''
      })
      const selectedPreliminary = ref([])
      const selectedInspection = ref([])
      const selectedTypes = ref([])
      const steps = ref([{
          id: 19,
          text: 'Is a TMP required?',
          checked: false
        },
        {
          id: 20,
          text: 'Is a containment tech required?',
          checked: false
        },
        {
          id: 21,
          text: 'Is a water tech required?',
          checked: false
        },
        {
          id: 23,
          text: 'Is a dumpster required?',
          checked: false
        },
        {
          id: 24,
          text: 'Is a moving truck required?',
          checked: false
        },
        {
          id: 25,
          text: 'Is a power supply required?',
          checked: false
        },
        {
          id: 26,
          text: 'Is a Remediation Tech required?',
          checked: false
        },
        {
          id: 27,
          text: 'Is a content tech required?',
          checked: false
        }
      ])
      const selectedSteps = ref( [])
      const picturesCheck = ref( [
        { id: 23, text: 'Arrival Photo of Entrance', checked: false, image:"" },
        { id: 24, text: 'Address Photo of Property', checked: false, image:"" },
        { id: 25, text: 'Site Specific Safety', checked: false, image:""}
      ])
      const selectedPictures = ref( [])
      const insuranceCompany = ref( '')
      const claimNumber = ref( '')
      const policyNumber = ref( '')
      const adjusterName = ref( '')
      const adjusterPhone = ref( '')
      const adjusterEmail = ref( '')
      const verificationCheckboxes = ref( [{
          id: 226,
          text: 'The Above property is insured properly and fully'
        },
        {
          id: 27,
          text: 'The individual, representative, or contact individual above has the authority to engage Mitigation Services'
        },
        {
          id: 29,
          text: 'Copy or Photo of Customer Photo ID'
        }
      ])
      const uploadedFiles = ref( [])
      const filesUploading = ref( [])
      const selectedVerification = ref( [])
      const cusSignature = ref( {
        data: '',
        isEmpty: true
      })
      const customerName = ref( {
        first: '',
        last: ''
      })
      const uploadMessage = ref('')
      const idImage = ref([])
      const frontCardImage = ref([])
      const backCardImage = ref([])
      const cardImages = ref([])
      const currentUploadStep = ref(1)
      const cardZip = ref("")
      const teamMemberSig = ref({ data: '', isEmpty: true })
      const cusSignTime = ref("")
      const cusSignDate = ref("")
      const phoneMask = ref({
        mask: '(000) 000-0000'
      })
      const initialData = ref({ data: '', isEmpty: true })
      const cusInitial1 = ref(null)
      const cusInitial2 = ref(null)
      const cusInitial3 = ref(null)
      const cusInitial4 = ref(null)
      const empSig = ref('')
      const moistureMap = ref({
        data: "",
        isEmpty: true
      })
      const penColor = ref("#000")
      const dryStandardMask = ref({
        mask: "00{%}",
        lazy: false
      })
      const hasJobid = ref(false)
      const teamMemberSignDate = ref('')
      const penColorArr = ref(["#000", "#6c8ce6", "#3047f1", "#0a2177"])
      const postData = ref({})

      const getReports = computed(() => store.getters["reports/getReports"])
      const getUser = computed(() => store.getters["users/getUser"])
      const date = computed(() => {
        const today = new Date()
        return (today.getMonth() + 1)+'-'+today.getUTCDate()+'-'+today.getFullYear();
      })

      function changePenColor(selectedIndex) {
        penColor.value = penColorArr.value[selectedIndex]
      }
      function undoMap() {
        map.value.undoSignature()
        if (map.value.signaturePad._data.length === 0) {
          map.value.clearSignature();
          moistureMap.value.data = null; moistureMap.value.isEmpty = true
        }
      }
      function saveMap() {
        const { isEmpty, data } = map.value.saveSignature()
        moistureMap.value.data = data
        moistureMap.value.isEmpty = isEmpty
      }
      function onBegin() {
        const { isEmpty } = map.value.saveSignature()
        moistureMap.value = { isEmpty, data: "" }
        nextTick(() => {
          map.value.resizeCanvas()
        })
      }

      watch(() => timeOfDispatch.value, (val) => {
        timeOfDispatchFormatted.value = formatTime(val)
      })
      watch(() => arrivalAtProperty.value, (val) => {
        arrivalFormatted.value = formatTime(val)
      })
      watch(() => evalStart.value, (val) => {
        evalStartFormatted.value = formatTime(val)
      })
      watch(() => evalEnd.value, (val) => {
        evalEndFormatted.value = formatTime(val)
      })
      watch(() => contractSigning.value, (val) => {
        contractFormatted.value = formatTime(val)
      })
      watch(() => denialOfServices.value, (val) => {
        dosformatted.value = formatTime(val)
      })
      watch(() => departureTime.value, (val) => {
        departureTimeFormatted.value = formatTime(val)
      })
      watch(() => timeIntrusion.value, (val) => {
        timeIntrusionFormatted.value = formatTime(val)
      })

      return {
        errorDialog,sigDialog,uploading,successMessage,errorMessage,uploadSuccess,submitting,submitted,jobId,timeOfDispatch,timeOfDispatchFormatted,dateOfLoss,dolFormatted,
        dateOfEval,doeFormatted,arrivalAtProperty,arrivalFormatted,evalStart,evalStartFormatted,evalEnd,evalEndFormatted,contractSigning,contractFormatted,denialOfServices,
        dosformatted,departureTime,departureTimeFormatted,evalLogsDialog,todModal,dolModal,doeModal,contactName,propertyOwner,phoneNumber,emailAddress,location,sourceOfIntrustion,
        intrusionLogsDialog,intrusionSection,dateIntrusion,dateIntrusionFormatted,timeIntrusion,timeIntrusionFormatted,preliminaryDetermination,moistureInspection,
        preRestoreEval,selectedPreliminary,selectedInspection,selectedTypes,steps,selectedSteps,picturesCheck,selectedPictures,insuranceCompany,claimNumber,policyNumber,
        adjusterName,adjusterPhone,adjusterEmail,verificationCheckboxes,uploadedFiles,filesUploading,selectedVerification,cusSignature,customerName,uploadMessage,
        idImage,frontCardImage,backCardImage,cardImages,currentUploadStep,cardZip,teamMemberSig,cusSignTime,cusSignDate,phoneMask,initialData,cusInitial1,cusInitial2,
        cusInitial3,cusInitial4,empSig,moistureMap,penColor,dryStandardMask,hasJobid,teamMemberSignDate,penColorArr,
        getReports,
        getUser,
        date,
        changePenColor,
        undoMap,
        saveMap,
        onBegin,
        dateMask,
        timeMask,
        htmlToPdfOptions,
        beforeDownloadNoSave,
        uploadPdf,
        postData,
        map
      }
    },
    methods: {
      ...mapActions({
          fetchReports: "reports/fetchReports"
      }),
      async submitForm() {
        var rapidRep = this.getReports.filter((v) => {
          return v.ReportType === 'rapid-response'
        })
        const reports = rapidRep.map((v) => { return v.JobId });
        await this.$refs.form.validate().then(success => {
          if (!success) {
            this.errorDialog = true
            this.submitting = false;
            this.submitted = false;
            return;
          }
          if (!reports.includes(this.jobId)) {
            Promise.all([this.onSubmit()]).then((result) => {
              this.successMessage = result[0]
              this.$refs.html2Pdf0.generatePdf()
            }).catch(error => console.log(`Error in promises ${error}`))
          } else {
            this.submitting = false
            this.errorDialog = true
            this.$refs.form.setErrors({
              JobId: ["Duplicate Job ID can't exist"]
            })
            return
          }
        })
      },
      onSubmit() {
        this.successMessage = ""
        const evaluationLogs = []
        const user = this.getUser
        this.submitting = true
        evaluationLogs.push({label: 'Team Arrival at Property', value: `${this.doeFormatted} ${this.arrivalAtProperty}:00`}, 
          {label: 'Evaluation Report Start Time', value: `${this.doeFormatted} ${this.evalStart}:00`}, 
          {label: 'Evaluation Report End Time', value: `${this.doeFormatted} ${this.evalEnd}:00`}, 
          {label: 'Time of Contract Signing', value: `${this.doeFormatted} ${this.contractSigning}:00`});
        const post = {
            JobId: this.jobId,
            DateOfLoss: this.dolFormatted,
            DateOfEvaluation: this.doeFormatted,
            timeOfDispatch: this.timeOfDispatchFormatted,
            ContactName: this.contactName,
            PropertyOwner: this.propertyOwner,
            location: this.location,
            PhoneNumber: this.phoneNumber,
            EmailAddress: this.emailAddress,
            ReportType: 'rapid-response',
            formType: 'initialForms',
            sourceWaterIntrusion: this.selectedTypes,
            Steps: this.selectedSteps,
            InsuranceCompany: this.insuranceCompany,
            ClaimNumber: this.claimNumber,
            PolicyNumber: this.policyNumber,
            adjusterName: this.adjusterName,
            adjusterEmail: this.adjusterEmail,
            adjusterPhone: this.adjusterPhone,
            evaluationLogs: evaluationLogs,
            documentVerification: this.selectedVerification,
            cusFirstName: this.customerName.first,
            cusLastName: this.customerName.last,
            customerSig: this.cusSignature.data,
            PictureTypes: this.selectedPictures,
            id: user.id,
            initials: {
                initial1: this.cusInitial1,
                initial2: this.cusInitial2,
                initial3: this.cusInitial3,
                initial4: this.cusInitial4
            },
            moistureMap: this.moistureMap.data,
            cusSignDate: this.cusSignDate,
            teamMember: this.getUser,
            dateIntrusion: this.dateIntrusionFormatted,
            timeIntrusion: this.timeIntrusionFormatted,
            intrusionInfo: this.intrusionSection,
            selectedPreliminary: this.selectedPreliminary,
            selectedInspection: this.selectedInspection,
            preRestorationEval: this.preRestoreEval,
            teamMemberSig: Object.keys(this.empSig).length !== 0,
            teamMemberSignDate: this.teamMemberSignDate
        };
        this.postData = post
        this.$api.$post("/api/reports/rapid-response/new", post, {
            params: {
                jobid: post.JobId
            }
        }).then((res) => {
            this.successMessage = res
            this.submitting = false
            this.submitted = true
            this.fetchReports()
        }).catch(err => {
            this.errorDialog = true
            this.submitting = false
            this.$refs.form.setErrors({
              JobId: [err.response.data.message]
            })
        })
      },
      acceptNumber() {
        const x = this.phoneNumber
          .replace(/\D/g, '')
          .match(/(\d{0,3})(\d{0,3})(\d{0,4})/)
        this.phoneNumber = !x[2] ?
          x[1] :
          '(' + x[1] + ') ' + x[2] + (x[3] ? '-' + x[3] : '')
      },
      goToStep(step) {
        if (step < 1) {
          return
        }
        if (step > 2) {
          this.submitFiles(this.cardImages)
          return
        }
        this.currentUploadStep = step
      },
      setLocation(...params) {
        const { address, street, cityStateZip } = params[0]
        this.location.cityStateZip = cityStateZip
        this.location.address = street
      },
      animateCSS(element, animation, prefix = 'animate__') {
        new Promise((resolve, reject) => {
            const animationName = `${prefix}${animation}`;
            var node;
            if (this.$refs[element]._isVue) {
                node = this.$refs[element].$el
            } else if (this.$refs[element].length === 1) {
                node = this.$refs[element][0]
            } else {
                node = this.$refs[element]
            }
            node.classList.add(`${prefix}animated`, animationName);

            function handleAnimationEnd(event) {
                node.classList.remove(`${prefix}animated`, animationName);
                resolve('Animation ended');
            }

            node.addEventListener('animationend', handleAnimationEnd);
        });
      }
    }
  })
  
</script>
<style lang="scss">
  .signature-area {
    max-width: 700px;
  }
  
</style>