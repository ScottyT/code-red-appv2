<template>
    <p v-if="Object.keys(report).length === 0">Fetchting report...</p>
    <div class="pdf-content" slot="pdf-content" v-else>
        <h1 class="text-center">{{company}}</h1>
        <h2 class="text-center" v-uppercase>{{reportName}}</h2>
        <div class="report-details__section">
            <div class="report-details__data" v-for="(item, key) in introSection" :key="key">
                <h4 v-uppercase>{{key}}:</h4>
                <span>{{item}}</span>
            </div>
        </div>
        <h3>Inventory</h3>
        <template v-if="report.inventory.length > 0">
            <div class="content-inventory__row content-inventory__row--first">
                <template v-if="Object.keys(report).length !== 0">
                    <div class="content-inventory__cols" v-for="item in report.inventory[0].cols" :key="item.id">{{item.label}}
                    </div>
                </template>
            </div>
            <div class="content-inventory__row" v-for="(row, i) in report.inventory" :key="`row-${i}`">
                <div class="content-inventory__cols">{{report.inventory[i].item_num}}</div>
                <div class="content-inventory__cols" v-for="(col, j) in row.cols.filter(el => el.id !== 'item_num')"
                    :key="`col${j}-row${i}`">
                    <span v-if="(typeof col.value === 'string') && col.id !== 'image'">{{col.value}}</span>
                    <span v-if="typeof col.value === 'number'">${{col.value}}</span>
                    <span v-if="typeof col.value === 'boolean' && col.value === true">Yes</span>
                    <span v-if="typeof col.value === 'boolean' && col.value === false">No</span>
                    <img :src="col.value" v-if="col.id === 'image'" />
                </div>
            </div>
        </template>
        
        <div class="report-details__section">
            <div class="report-details__data">
                <h4>Total inventory amount</h4>
                <span>${{report ? report.totalAmount : null}}</span>
            </div>
            <div class="report-details__data">
                <h4>Technician Signature</h4>
                <div class="report-details__signature" v-if="report && report.techSig"><img :src="$store.state.users.signature" /></div>
            </div>
            <div class="report-details__data">
                <h4>Customer Signature</h4>
                <div class="report-details__signature"><img :src="report ? report.cusSig : ''" /></div>
            </div>
        </div>
    </div>
</template>
<script>
import { computed, defineComponent, onMounted, ref, toRefs, watch, useContext } from '@nuxtjs/composition-api'

export default defineComponent({
    props: {
        company: String,
        reportName: String,
        report: Object,
        onForm: {
            type: Boolean,
            default: false
        }
    },
    setup(props, { root }) {
        const { report, onForm } = toRefs(props)
        const introSection = computed(() => {
            return Object.fromEntries(Object.entries(report.value).filter(([key]) => 
                key.includes('JobId') || key.includes('customer') || key.includes('claimNumber') || key.includes('insurance') || key.includes('dateCompleted') 
            ))
        })

        watch(() => report.value, (val) => {
            console.log("report changing")
            val.inventoryImages.forEach((image) => {
                var row = val.inventory.findIndex(i => i.cols[2].value === image.img.filename)
                if (row >= 0) {
                    val.inventory[row].cols[2].value = `data:${image.img.contentType};base64,${image.img.data}`
                }
            })
        })
        onMounted(() => {
            if (!onForm.value) {
                report.value.inventoryImages.forEach((image) => {
                    var row = report.value.inventory.findIndex(i => i.cols[2].value === image.img.filename)
                    if (row >= 0) {
                        report.value.inventory[row].cols[2].value = `data:${image.img.contentType};base64,${image.img.data}`
                    }
                })
            }
        })

        return {
            introSection
        }
    },
})
</script>
<style lang="scss" scoped>
.pdf-content {
    .content-inventory {
        display:flex;
        flex-direction: column;
        max-width:750px;
        &__row {
            display:grid;
            grid-template-columns:60px 130px 1fr 81px 81px 77px 70px 1fr 1fr;
            flex-direction: row;
            grid-template-rows:80px;
            padding-top:10px;
            border-top:1px solid $color-black;
            &--first {
                grid-template-rows:30px;
            }
        }
        &__table {
            display:grid;
            row-gap:10px;
        }
    }
}
</style>