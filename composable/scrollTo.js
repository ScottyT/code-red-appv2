import { ref } from "@nuxtjs/composition-api"

export default function useScrollTo() {
    const x = ref(0)
    const y = ref(0)

    function scroll() {
        window.scrollTo({
            top: 0,
            left: 0,
            behavior: 'smooth'
        })
        y.value = window.scrollY
    }

    return { 
        scroll,
        y
    }
}