import {provide} from '@nuxtjs/composition-api'
import useCerts from '@/composable/useCerts'
import userReports from '@/composable/userReports'

export default ({app}, inject) => {
    app.setup = () => {
        provide(useCerts, 'certs')
        provide(userReports, 'userReports')
    }
    inject('certs', useCerts)
    inject('userReports', userReports)
}