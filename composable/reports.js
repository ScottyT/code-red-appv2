import { onMounted, ref, useAsync, useContext, useFetch, computed, useStore } from "@nuxtjs/composition-api";
import axios from 'axios';
import genericFuncs from "./utilityFunctions";
export default function useReports() {
    let reports = ref([])
    let report = ref({})
    let signature = ref("")
    let error = ref(false)
    let errorMessage = ref("")
    let images = ref([])
    let folders = ref([])
    let pdfs = ref([])
    let loading = ref(false)
    let groupedReports = ref({})
    let message = ref([])
    let filters = ref([])
    const { $axios, $fire, $api, $gcs } = useContext()
    const store = useStore()
    const { groupByKey, dataURLtoFile, replaceEmptyFormFields } = genericFuncs()

    function htmlToPdfOptions(reportType, jobid) {
        return {
            margin: [20, 10, 20, 10],
            filename: `${reportType}-${jobid}`,
            image: {
                type: "jpeg",
                quality: 0.95
            },
            html2canvas: {
                scale: 2,
                useCORS: true,
                logging: true,
                removeContainer: true
            },
            jsPDF: {
                unit: 'px',
                format: 'a4',
                orientation: 'portrait',
                hotfixes: ['px_scaling']
            }
        }
    }

    function filterConditions(arr, type) {
        filters.value = arr

        return groupByKey(arr, type)
    }
    function addHeadingToReports(value) {
        return new Promise((resolve) => {
            value.heading = changeFormName(value.ReportType, value.formType)
            resolve(value)
        })
    }
    function getReports(filterRepType = false, filterFormType = false, grouped = false) {
        loading.value = true

        const { fetch: fetchReports, fetchState } = useFetch(async () => {
            const promises = []
            reports.value = await $api.$get(`/api/reports`).then((res) => {
                for (var i = 0; i < res.length; i++) {
                    if (res[i].formType === null && res[i].ReportType === null) {
                        error.value = "Report type and form type are required."
                        return;
                    }
                    promises.push(addHeadingToReports(res[i]))
                }
                
                Promise.all(promises).then((result) => {
                    var formTypeFilter = result.filter(el => filters.value.includes(el.formType))
                    var reportTypeFilter = result.filter(el => filters.value.includes(el.ReportType))

                    if (grouped) {
                        var f = filterConditions(formTypeFilter, "formType")
                        var r = filterConditions(reportTypeFilter, "ReportType")

                        if (filterFormType && !filterRepType) {
                            groupedReports.value = f
                        }
                        if (filterRepType && !filterFormType) {
                            groupedReports.value = r
                        }
                        else {
                            return Object.assign(groupedReports.value, f, r)
                        }
                    } else {
                        reports.value = result
                    }
                    //reports.value = result
                    error.value = false
                    loading.value = false
                }).catch((e) => {
                    error.value = true
                    console.error(e.response.data)
                    errorMessage.value = e.response.data
                })
            })
        })
        return { fetchReports, fetchState, reports, groupedReports }
    }

    const getReportsPromise = () => {
        loading.value = true
        return new Promise((resolve, reject) => {
            $api.$get(`${process.env.apiUrl}/api/reports`).then((res) => {
                reports.value = res.data
                error.value = false
                loading.value = false
                resolve(res)
            }).catch((err) => {
                error.value = true
                errorMessage.value = err.response.data
                loading.value = false
                reject(err)
            })
        })
    }

    const getReport = (path) => {
        loading.value = true
        const { fetch: fetchReport, fetchState } = useFetch(async () => {
            await $api.$get(`/api/reports/details/${path}`).then((res) => {
                res.heading = changeFormName(res.ReportType)
                report.value = res
                loading.value = false
                //store.dispatch("users/getSigOrInitialImage", { signType: "signature.jpg", email: store.getters["reports/getReport"].teamMember.email })

            }).catch((err) => {
                error.value = true
                loading.value = false
                errorMessage.value = err.response.data
            })
        })
        return { fetchReport, fetchState }
    }

    // Use this function when trying to get report from somewhere that isn't inside setup() method. Mainly use this inside a watch() property
    const getReportPromise = (path) => {
        loading.value = true
        return new Promise((resolve, reject) => {
            $api.$get(`/api/reports/details/${path}`).then((res) => {
                replaceEmptyFormFields(res)
                report.value = res
                loading.value = false
                message.value.push("Got report!")
                resolve(res)
            }).catch((err) => {
                errorMessage.value = err.response.data.title
                report.value = []
                reject(err)
                loading.value = false
            })
        })
    }

    const getReportImages = (jobid, folder, subfolder, delimiter) => {
        loading.value = true
        const { fetch: fetchImages, fetchState } = useFetch(async () => {
            $gcs.$get(`/list/${jobid}`, {
                params: { folder: folder, subfolder: subfolder, delimiter: delimiter, bucket: "default" }
            }).then((res) => {
                report.value = res
                images.value = res.images
                folders.value = res.folders
            }).catch(err => {
                error.value = true
                errorMessage.value = err.response.data
            })
        })
        return { fetchImages, fetchState, loading }
    }

    const getReportImagesPromise = (jobid, folder, subfolder, delimiter) => {
        loading.value = true
        return new Promise((resolve, reject) => {
            $gcs.$get(`/list/${jobid}`, {
                params: { folder: folder, subfolder: subfolder, delimiter: delimiter, bucket: "default" }
            }).then((res) => {
                report.value = res
                pdfs.value = res.pdfs
                images.value = res.images
                folders.value = res.folders
                loading.value = false
                resolve(res)
            }).catch(err => {
                error.value = true
                errorMessage.value = err.response.data
                loading.value = false
                reject(err)
            })
        })
    }

    const getCertReport = (path) => {
        loading.value = true
        const { fetch: fetchCertReport, fetchState } = useFetch(async () => {
            $api.$get(`/api/reports/${path}`).then((res) => {
                report.value = res
                loading.value = false
            }).catch(err => {
                loading.value = false
                errorMessage.value = err
            })
        })
        return { fetchCertReport, fetchState, loading }
    }

    const changeFormName = (reportType, formType) => {
        switch (reportType) {
            case "upholstery-form":
                return "Upholstery Form"
            case "quality-control":
                return "Quality Control Evaluation Reports"
            case "case-file-technician":
                return "Daily Technician Report"
            case "moisture-sketch":
                return "Moisture Mapping Location and Sketch"
            case "measurements-sketch":
                return "Measurements and Sketch"
            case "equipment-location-sketch":
                return "Equipment Location and Sketch"
            case "psychrometric-chart":
                return "Psychrometric Chart"
            case "quality-control":
                return "Quality Control Evaluation Report"
        }
        switch (formType) {
            case "initialForms":
                return "Dispatch and Rapid Response Reports"
            case "chart-report":
                return "Charts"
            case "case-report":
                return "Daily Containment and Tech Reports"
            case "logs-report":
                return "Inventory and Atmospheric Readings"
            case "sketch-report":
                return "Sketch Reports"
        }
        switch (true) {
            case reportType.includes("aob"):
                return "AOB & Mitigation Contract"
            case reportType.includes("coc"):
                return "Certificate of Completion"
            case reportType.includes("contracting-agreement"):
                return "Contracting Service Agreement"
            case reportType.includes("scope-of-work"):
                return "Scope of Work"
        }
    }

    async function beforeDownload({ html2pdf, options, pdfContent }) {
        await html2pdf().set(options).from(pdfContent).toPdf().get('pdf').then((pdf) => {
            const totalPages = pdf.internal.getNumberOfPages()
            for (let i = 0; i <= totalPages; i++) {
                pdf.setPage(i)
                pdf.setFontSize(14)
                pdf.text('Page ' + i + ' of ' + totalPages, (pdf.internal.pageSize.getWidth() * 0.88), (pdf.internal.pageSize.getHeight() - 10))
            }
        }).save()
    }
    async function beforeDownloadNoSave({ html2pdf, options, pdfContent }, reportType, jobid) {
        await html2pdf().set(options).from(pdfContent).toPdf().get('pdf').then((pdf) => {
            const totalPages = pdf.internal.getNumberOfPages()
            for (let i = 0; i <= totalPages; i++) {
                pdf.setPage(i)
                pdf.setFontSize(14)
                pdf.text('Page ' + i + ' of ' + totalPages, (pdf.internal.pageSize.getWidth() * 0.88), (pdf.internal.pageSize.getHeight() - 10))
            }
        }).outputPdf().then((result) => {
            var file = dataURLtoFile(`data:application/pdf;base64,${btoa(result)}`, `${reportType}-${jobid}`);
            return Promise.resolve(file)
        })
    }
    function uploadPdf(file, filename, jobId) {
        const finalPdf = new File([file], `${filename}.pdf`, {
            type: file.type
        })
        const formData = new FormData();
        formData.append('path', `${jobId}/pdfs/`)
        formData.append('multiFiles', finalPdf)
        $gcs.$post("/upload", formData, {
            params: {
                folder: 'pdfs',
                subfolder: '',
                delimiter: '/'
            }
        }).then(() => {
            console.log("pdf uploaded")
        })
    }
    return {
        getReports, fetch, reports, report, folders, images, pdfs, error, errorMessage, message, getReport, getReportPromise, getReportImages, loading,
        getReportsPromise, filterConditions, groupedReports, changeFormName, beforeDownload, signature, getCertReport, htmlToPdfOptions, beforeDownloadNoSave, uploadPdf,
        getReportImagesPromise
    }
}

export function fetchReportImages(jobid, folder, subfolder, delimiter) {
    return new Promise((resolve, reject) => {
        axios.get(`${process.env.gsutil}/list/${jobid}`,
            {
                params: { folder: folder, subfolder: folder + "/" + subfolder, delimiter: delimiter }, headers: {
                    authorization: `Bearer ${this.$auth.strategy.token.get().split(' ')[1]}`
                }
            }).then((res) => {
                resolve(res.data)
            })
    }).catch((err) => {
        error.value = err
        reject(err)
    })
}
