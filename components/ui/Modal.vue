<template>
    <transition name="modal-fade">
        <div class="modal" role="dialog" v-show="modalDisplay">
            <div class="modal__content" :style="{ 'width': width }" v-if="modalDisplay" v-click-outside="close">
                <slot name="body"></slot>
            </div>
        </div>
    </transition>
</template>
<script>
import { computed, defineComponent, ref, toRefs } from '@nuxtjs/composition-api'

export default defineComponent({
    props: {
        width: String,
        modalOpen: Boolean
    },
    setup(props, { emit }) {
        const { modalOpen } = toRefs(props)

        const modalDisplay = computed({
            get: () => modalOpen.value,
            set: (v) => { return v }
        })
        function close() {
            emit('close', !modalOpen.value)
        }

        return {
            close,
            modalDisplay
        }
    },
})
</script>
<style lang="scss" scoped>
.modal {
    position:fixed;
    top:0;
    bottom:0;
    left:0;
    right:0;
    background-color: rgba($color-black, .46);
    display:flex;
    justify-content:center;
    align-items:center;
    z-index:200;
    &__content {
        box-shadow:0px 0px 20px 10px rgba($color-black, .46);
    }
}
.modal-fade-enter,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.5s ease;
}
</style>