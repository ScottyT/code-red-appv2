import Vuetify from 'vuetify/lib'

export default defineNuxtPlugin((nuxtApp) => {
    const vuetify = new Vuetify({
        customVariables: ['~/assets/scss/variables/variables.scss'],
        treeShake: true,
        theme: {
            dark: true,
            themes: {
                dark: {
                    primary: '#b10e0e',
                }
            },
        },
        breakpoint: {
            thresholds: {
                xs: 320,
                sm: 520,
                md: 750,
                lg: 991
            }
        }
    })
    nuxtApp.provide('vuetify', vuetify.framework);
});