<template>
  <v-layout column justify-center class="section-wrapper">
    <LazyHydrate v-if="slice === 'dispatch-report'">
      <LazyFormsDispatchReport :slice="slice" :company="company" />
    </LazyHydrate>
    <LazyHydrate v-if="slice === 'rapid-response'">
      <LazyFormsRapidResponse :slice="slice" :company="company" />
    </LazyHydrate>
    <LazyHydrate v-if="slice === 'daily-containment-report'">
      <LazyFormsDailyContainment :company="company" />
    </LazyHydrate>
    <LazyHydrate v-if="slice === 'daily-technician-report'">
      <LazyFormsDailyTechnician :company="company" />
    </LazyHydrate>
    <LazyHydrate v-if="slice === 'atmospheric-readings'">
      <LazyFormsAtmosphericReadings :company="company" />
    </LazyHydrate>
    <LazyHydrate v-if="slice === 'inventory-log'">
      <LazyFormsInventoryLog :company="company" />
    </LazyHydrate>
    <LazyHydrate v-if="slice === 'moisture-readings'">
      <LazyFormsMoistureReadings :company="company" />
    </LazyHydrate>
    <LazyHydrate v-if="slice === 'psychrometric-charting'">
      <LazyFormsPsychrometricCharting :company="company" />
    </LazyHydrate>
    <LazyHydrate v-if="slice === 'aob-contract-form'">
      <LazyFormsAOBContract company="Water Emergency Services Incorporated" abbreviation="WESI" />
    </LazyHydrate>
    <LazyHydrate v-if="slice === 'certificate-of-completion'">
      <LazyFormsCertificate company="Water Emergency Services Incorporated" abbreviation="WESI" />
    </LazyHydrate>
    <LazyHydrate v-if="slice === 'credit-card'">
      <LazyFormsCreditCard :company="company" abbreviation="" />
    </LazyHydrate>
    <LazyHydrate v-if="slice === 'upholstery-form'">
      <LazyFormsUpholsteryForm company="Water Emergency Services Incorporated" />
    </LazyHydrate>
    <LazyHydrate v-if="slice === 'quality-control-report'">
      <LazyFormsQCEvalReport company="Water Emergency Services Incorporated" />
    </LazyHydrate>
    <LazyHydrate v-if="slice === 'guardian-aob-form'">
      <LazyFormsGuardianAOBContract company="Guardian Restoration Incorporated" abbreviation="GUARD" />
    </LazyHydrate>
    <LazyHydrate v-if="slice === 'guardian-contracting'">
      <LazyFormsGuardianContractService company="Guardian Restoration Incorporated" abbreviation="Guardian" />
    </LazyHydrate>
    <LazyHydrate v-if="slice === 'guardian-scope-of-work'">
      <LazyFormsGuardianScopeOfWork company="Guardian Restoration Incorporated" abbreviation="Guardian" />
    </LazyHydrate>
    <LazyHydrate v-if="slice === 'content-inventory'">
      <LazyFormsContentInventory company="Water Emergency Services Incorporated" abbreviation="WESI" />
    </LazyHydrate>
    <LazyHydrate v-if="slice == 'general-history'">
      <LazyFormsGeneralHistory company="Water Emergency Services Incorporated" abbreviation="WESI" />
    </LazyHydrate>
  </v-layout>
</template>
<script>
import LazyHydrate from 'vue-lazy-hydration'
export default {
  name: 'SlicesBlock',
  props: ['slice', 'abbreviation'],
  components: {
    LazyHydrate
  },
  data() {
    return {
      company: ""
    }
  }
}
</script>
