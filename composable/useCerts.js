import { computed, ref, reactive, readonly, toRefs, useStore } from "@nuxtjs/composition-api"
import axios from 'axios';
import {mapActions} from 'vuex';
// If image token gets changed you will have to change the image url in the database
const state = ref({
    certifications: [],
    certList: [],
    loading: true,
    submitting: false,
    submitted: false,
    message: ""
})

export default () => {
    const store = useStore()
    const setCerts = cert => 
        new Promise(resolve => 
            setTimeout(() => resolve(cert), 500)
        );
        /* certs.forEach((cert) => {
            state.value.certifications.push(cert)
        }) */
    
    const fetchCerts = async (certs) => {
        state.value.loading = true
        state.value.certifications = []
        console.log("certs:", certs)
        await Promise.all(certs.map(async (cert) => {
            const certInfo = await setCerts(cert)
            state.value.certifications.push(certInfo)
        })).then(() => {
            state.value.loading = false
        })
    }
    const addCert = function(certinfo, userinfo, idtoken) {
        state.value.submitting = true
        state.value.submitted = false
        return new Promise((resolve, reject) => {
            if (state.value.certifications.some(el => el.idNumber === certinfo.idNumber)) {
                state.value.message = "A certification already exists with this ID number."
                state.value.submitting = false
                state.value.submitted = true
            } else {
                axios.post(`${process.env.apiUrl}/api/certifications/create`, certinfo, {
                    headers: {
                        authorization: `Bearer ${idtoken}`
                    }
                }).then((res) => {
                    state.value.message = res.data
                    state.value.submitting = false
                    state.value.submitted = true
                    resolve(res.data)
                    setTimeout(() => {
                        state.value.message = ""
                    })
                }).catch((err) => {
                    reject(err)
                    state.value.message = err
                })
            }
        })
        
    }
    /* const deleteCert = function(cert) {
        state.value.message = ""
        const certToDelete = state.value.certifications.findIndex(obj => obj.idNumber === cert.idNumber)
        
        firebase.auth().currentUser.getIdToken().then((idToken) => {
            axios.delete(`${process.env.apiUrl}/api/certifications/${cert.idNumber}/${firebase.auth().currentUser.email}/delete`, 
                {data: {cert}, headers: {authorization: `Bearer ${idToken}`}}).then((res) => {
                state.value.certifications.splice(certToDelete, 1)
                state.value.message = res.data.message
                setTimeout(() => {
                    state.value.message = ""
                }, 2000)
            })
        })
    } */

    return {
        state: computed(() => state.value),
        fetchCerts,
        addCert
    }
}


/* export default {
    state: readonly(state.value),
    fetchCerts,
    addCert,
    //deleteCert
} */