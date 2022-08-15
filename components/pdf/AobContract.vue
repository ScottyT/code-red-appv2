<template>
<div>
            <section slot="pdf-content">
                <h2 class="text-center">{{company}}</h2>
                <div class="text-left pdf-first-section">
                    <p>
                        This Assignment of Claim Agreement (hereinafter referred to as “Assignment” and/or “Agreement”)
                        and Restoration Contract
                        (hereinafter referred to as “Contract”) is entered into by and between:
                    </p>
                    <p style="padding-top:10px;">
                        {{company}} (hereinafter referred to as “{{abbreviation}}” and/or “Insured”) and The
                        Owner/Persons of legal authority (hereinafter referred to as “Customer”)
                        of the property more commonly known as and identified by the following address:
                    </p>
                    <h4 class="text-decoration-underline pdf-detail">{{contracts.subjectProperty}}</h4><br />
                    <label>(hereinafter referred to as “Subject Property”)</label>
                </div>
                <div class="pdf-item report-details__section">
                    <ol class="report-details__listing">
                        <li>
                            <span class="font-weight-bold">Assignment of Benefits to {{company}}:</span>
                            <ol>
                                <li>
                                    Customer understands and agrees to assign all insurance rights, benefits, proceeds and any causes of action under 
                                    applicable insurance policies to {{abbreviation}} for services rendered or to be rendered for said Subject Property identified 
                                    As Part 1 and Part 2, Contracting Agreement & Scope of Work and Betterments. Both parties understand and agree 
                                    that {{abbreviation}} will replace the Customer as the Insured on the applicable insurance policies and as such will be 
                                    entitled to all insurance rights, benefits, proceeds, and any causes of action thereunder in its capacity as the legally 
                                    recognized Insured.
                                </li>
                                <li>
                                    By executing this document Customer agrees and intends for all rights, benefits, and proceeds for services for said 
                                    Subject Property identified above to be assigned solely and exclusively to {{abbreviation}} in its capacity as the Insured.
                                </li>
                                <li>
                                    In this regard, Customer waives all privacy rights if any related to all insurance information and agrees to provide 
                                    any and all such reasonable and necessary information and documents to {{abbreviation}} to assist {{abbreviation}} in receiving 
                                    payment for all services performed pursuant to this Agreement including but not limited to insurance policies, 
                                    insurance policy numbers, endorsements, riders, correspondence, invoices, proof of coverage, full disclosure of any 
                                    previous insurance claims if any and/or any other insurance policy information that {{abbreviation}} may need to establish, 
                                    pursue and perfect its rights as the Insured and so as to exercise its rights thereunder to any benefits, proceeds, 
                                    payments, causes of actions and/or any other related rights. Section III. of this Agreement is hereby incorporated by 
                                    reference.
                                </li>
                                <li>
                                    The Property Representative makes this Assignment in consideration of and for {{abbreviation}}’s agreement to perform 
                                    labor, provide services, supply materials and perform such services under this Contract and including the additional 
                                    consideration of and for {{abbreviation}}’s not requiring full payment at the time of service.
                                </li>
                                <li>
                                    Property Representative hereby unequivocally directs the insurance carrier(s) to release all information requested by 
                                    {{abbreviation}} in its capacity as the Insured, its representatives, and/or its attorney for the purpose of obtaining actual 
                                    benefits to be paid by the insurance carrier(s) for services rendered or to be rendered for the Subject Property 
                                    identified above.
                                </li>
                            </ol>
                        </li>
                    </ol>
                </div>
                <div class="pdf-item report-details__section">
                    <div class="grid grid--two-column">
                        <div class="report-details__data">
                            <h3>Customer Signature</h3>
                            <div class="report-details__signature"><img :src="contracts.cusSign1" /></div>
                        </div>
                        <div class="report-details__data">
                            {{contracts.cusSignDate1}}
                        </div>
                    </div>
                </div>
                <div class="pdf-item report-details__section">
                    <div class="grid grid--two-column">
                        <div class="report-details__data">
                            <h3>Customer Signature</h3>
                            <div class="report-details__signature" v-if="contracts.cusSign2 !== ''"><img :src="contracts.cusSign2" /></div>
                            <p v-else>N/A</p>
                        </div>
                        <div class="report-details__data">
                            {{contracts.cusSignDate2}}
                        </div>
                    </div>
                </div>
                <div class="pdf-item report-details__section">
                    <div class="grid grid--two-column">
                        <div class="report-details__data">
                            <h3>Witness</h3>
                            <span>{{contracts.witness}}</span>
                        </div>
                        <div class="report-details__data">
                            {{contracts.witnessDate}}
                        </div>
                    </div>
                </div>
            </section>
</div>
</template>
<script>
import { defineComponent, watch, ref, toRefs, onMounted } from "@nuxtjs/composition-api"
import useReports from '@/composable/reports'
export default defineComponent({
    name: "AobContractContent",
    props: {
        jobid: String,
        reportType: String,
        contracts: Object,
        cardsInfo: Object,
        images: Array,
        company: String,
        abbreviation: String,
        onForm: Boolean
    },
    setup(props) {
        const { images, cardsInfo, onForm, contracts } = toRefs(props)
        const { getReportPromise } = useReports()
        const cards = ref([])
        const cardImages = ref([])

        
        if (onForm) {
            watch(() => contracts.value, (val) => {
                
            })
        }

        onMounted(() => {
            cardImages.value = []
        })

        return {
            cardImages,
            cards
        }
    }
});
</script>
<style lang="scss">
.bold-text {
    font-weight:700;
}
.underline-text {
    display:inline-block;
    border-bottom:1px solid black;
    line-height:15px;
}
.report-details__data-field {
    float:right;
}
.data-section {
    margin: 20px 0;
    display:grid;
    grid-template-columns: 1fr;
    &__heading {
        font-size:1.4em;
        font-weight:bold;
        text-align:center;
    }
    &__subheading {
        font-size:1.2em;
        font-weight:bold;
        grid-row:1/2;
        text-decoration: underline;
    }
    &__data {
        width:100%;
        padding:5px;
        margin-top:5px;
        font-size:14px!important;
        display:grid;
        grid-column:1 span;
        grid-template-columns:1fr;
        grid-template-rows:1fr 1fr 150px 210px;
        &--group {
            padding-bottom:20px;
            display:grid;
            grid-template-rows:50px 1fr;
            grid-template-columns:repeat(auto-fill, minmax(150px, 1fr));
        }
        &--group-item {
            height:100%;
            &:not(:last-child) {
                padding-bottom:5px;
            }
        }
    }
    &__signature {
        grid-template-columns:1fr;
    }
    &__card-images {
        position:relative;
        display:inline-flex;
        flex-direction:row;
        justify-content:space-between;
        height:200px;
        div:nth-child(2) {
            left:400px;
        }
    }
}
.card-image {
    max-width:300px;
    height:200px;
    position:absolute;
    top:0;
    display:inline-block;
}
.pdf-content {
    /* max-width:750px;
    margin:auto; */
    .report-details__listing-num {
        list-style-position: inside;
        padding-left:30px;
        & > li {
            text-indent: -15px;
        }
    }
    .report-details {
        &__listing {
            list-style-type:upper-roman;
            list-style-position: inside;
            & > li {
                font-size:16px;
            }

            &--sublist {
                list-style-type:lower-alpha;
                padding-left:30px;
                & > li {
                    padding-bottom: 10px;
                    text-indent:-15px;
                }
            }
        }
    }
}
.pdf-item {
    .detail-margin-top {
        margin-top:10px;
    }
    .pdf-detail {
        margin-top:20px;
        &:not(:last-child) {
          margin-bottom: 10px;
        }
    }
    .pdf-first-section {
        text-align:center;
        margin-bottom:10px;
    }
    .pdf-sig {
        width:500px;
        height:295px;
    }
    &.sig-row {
        height:400px;
    }
}
</style>