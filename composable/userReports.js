import axios from 'axios';
import firebase from "firebase/app";
import "firebase/auth"

const state = ref({
    reports: [],
    loading: false
})
const setReports = function(r) {
    state.value.reports = r
}
const fetchReports = async function(user) {
    if (user === null) return
    state.value.loading = true
    await firebase.auth().currentUser.getIdToken().then((idToken) => {
        axios.get(`${process.env.serverUrl}/api/employee/${user}/reports`, {headers: {authorization: `Bearer ${idToken}`}}).then((res) => {
            setReports(res.data)
            state.value.loading = false
        })
    })
}
export default {
    state: readonly(state.value),
    fetchReports
}