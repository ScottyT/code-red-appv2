import { defineNuxtConfig } from '@nuxt/bridge'
import { VuetifyLoaderPlugin } from "vuetify-loader";
export default defineNuxtConfig({
  bridge: {
    vite: false,
    nitro: false,
    typescript: false
  },
  // This is an SPA but using a server to show views on the page
  target: 'server',
  ssr: false,
  head: {
    titleTemplate: '%s - Code Red Claims',
    title: process.env.npm_package_name || '',
    meta: [
      {
        charset: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        hid: 'description',
        name: 'description',
        content: process.env.npm_package_description || '',
      },
    ],
    link: [
      {
        rel: 'icon',
        type: 'image/x-icon',
        href: '/favicon.ico',
      },
      { rel: 'stylesheet', href: 'https://cdn.jsdelivr.net/npm/@mdi/font@latest/css/materialdesignicons.min.css' },
    ],
  },
/*   loading: {
    color: '#2a73ae',
  }, */
  env: {
    serverUrl: process.env.NODE_ENV !== 'production' ? 'http://localhost:8082' : process.env.API_URL,
    gsutil: process.env.NODE_ENV !== 'production' ? 'http://localhost:8081' : process.env.GSUTIL_URL,
    apiUrl: process.env.NODE_ENV !== 'production' ? 'http://localhost:8082' : process.env.API_URL,
    functionsUrl: process.env.NODE_ENV !== 'production' ? 'http://192.168.1.117:8080' : process.env.FUNCTIONS_URL,
    mapboxKey: process.env.MAPBOX_API_KEY,
    userStorage: process.env.USER_STORAGE_BUCKET,
    defaultStorage: process.env.DEFAULT_STORAGE_BUCKET,
    authClientID: process.env.AUTH0_CLIENT_ID,
    authDomain: process.env.AUTH0_DOMAIN,
    gcloudApiKey: process.env.GCLOUD_API_KEY,
    authAudience: process.env.AUTH0_AUDIENCE
  },
  publicRuntimeConfig: {
    serverUrl: process.env.NODE_ENV !== 'production' ? 'http://localhost:8080' : process.env.SERVER_URL,
    gsutil: process.env.NODE_ENV !== 'production' ? 'http://localhost:8081' : process.env.GSUTIL_URL,
    mapboxKey: process.env.MAPBOX_API_KEY
  },
  privateRuntimeConfig: {
    serverUrl: process.env.NODE_ENV !== 'production' ? 'http://localhost:8080' : process.env.SERVER_URL,
  },
  /*
   ** Global CSS
   */
  css: ['@/assets/scss/index.scss', '@/assets/scss/transitions.css', '@/assets/scss/global.scss'],
  styleResources: {
    scss: [
      './assets/scss/variables/main.scss'
    ]
  },
  /* vite: {
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: '@import "@/assets/scss/variables/main.scss"',
        }
      }
    }
  }, */
  /*
   ** Plugins to load before mounting the App
   ** https://nuxtjs.org/guide/plugins
   */
  plugins: [
    '~/plugins/axios.js',
    '~/plugins/imask.js',
    '~/plugins/vee-validate.js',
    '~/plugins/signature.js',
    { src: '@/plugins/vue-html2pdf.js', mode: 'client' },
    { src: '~/plugins/vue-chart.js', mode: 'client' },
    '~/plugins/provide-composable.js',
    '~/plugins/directives.js',
    //'~/plugins/vuetify.js'
  ],
  /*
   ** Auto import components
   ** See https://nuxtjs.org/api/configuration-components
   */
  components: {
    global: true,
    dirs: [
      { path: '~/components/forms/', prefix: 'forms' },
      { path: '~/components/ui/', prefix: 'ui' },
      { path: '~/components/pdf/', prefix: 'pdf' },
      { path: '~/components/templates/', prefix: 'layout' },
      '~/components'
    ]
  },
  /*
   ** Nuxt.js dev-modules
   */
  buildModules: [
    // Doc: https://github.com/nuxt-community/eslint-module
    '@nuxtjs/eslint-module',
    //'@nuxtjs/vuetify',
    '@nuxtjs/style-resources'
  ],
  /*
   ** Nuxt.js modules
   */
  modules: [
    '@nuxtjs/axios',
    '@nuxtjs/firebase',
    '@nuxtjs/auth-next',
    '@nuxtjs/pwa'
  ],
  firebase: { 
    config: {
      apiKey: process.env.FIREBASE_API_KEY,
      authDomain: process.env.AUTH_DOMAIN,
      databaseURL: process.env.DATABASE_URL,
      projectId: process.env.PROJECT_ID,
      storageBucket: process.env.DEFAULT_STORAGE_BUCKET,
      messagingSenderId: process.env.MESSAGING_SENDER_ID,
      appId: process.env.APP_ID
    },
    onFirebaseHosting: true,
    services: {
      storage: true,
    }
  },
  axios: {
    baseURL: 'http://localhost:8080'
  },
  auth: {
    localStorage: false,
    redirect: {
      login: '/',
      callback: '/auth/signed-in'
    },
    token: {
      prefix: '_token.',
      global: true
    },
    strategies: {
      local: false,
      auth0: {
        domain: process.env.AUTH0_DOMAIN,
        clientId: process.env.AUTH0_CLIENT_ID,
        audience: process.env.AUTH0_AUDIENCE,
        scope: ['read:users', 'read:reports', 'create:users', 'read:user_idp_tokens', 'offline_access'],
        responseType: 'code',
        grantType: 'authorization_code',
        codeChallengeMethod: 'S256'
      }
    },
    plugins: [ { src: '~/plugins/axios', ssr: false }]
  },
  /*
   ** vuetify module configuration
   ** https://github.com/nuxt-community/vuetify-module
   */
  /*
   ** PWA settings
   */
  /* pwa: {
    manifest: {
      name: 'Code Red',
      short_name: 'Code Red Field Forms',
      lang: 'en',
      display: 'standalone'
    },
    meta: {
      description: 'An app that the field teams fill out.',
      author: 'Scott Tucker',
      viewport: 'width=device-width, initial-scale=1',
      name: 'Code Red Claims',
      theme_color: '#EB1F28' 
    },
    icon: {
      purpose: ['any']
    },
    workbox: {
      runtimeCaching: [
        {
          urlPattern: 'https://fonts.googleapis.com/',
          handler: 'cacheFirst',
          method: 'GET',
          strategyOptions: {
            cacheableResponse: {
              statuses: [0, 200],
            },
          },
        },
        {
          urlPattern: 'https://fonts.gstatic.com/.*',
          handler: 'cacheFirst',
          method: 'GET',
          strategyOptions: { cacheableResponse: { statuses: [0, 200] } }
        },
        {
          urlPattern:
            'https://cdn.jsdelivr.net/npm/vuetify@2.x/dist/vuetify.js',
          handler: 'cacheFirst',
          method: 'GET',
          strategyOptions: {
            cacheableResponse: {
              statuses: [0, 200],
            },
          },
        },
        {
          urlPattern:
            'https://cdn.jsdelivr.net/npm/vuetify@2.x/dist/vuetify.min.css',
          handler: 'cacheFirst',
          method: 'GET',
          strategyOptions: {
            cacheableResponse: {
              statuses: [0, 200],
            },
          },
        },
        {
          urlPattern: 'https://cdn.jsdelivr.net/npm/vue@2.x/dist/vue.js',
          handler: 'cacheFirst',
          method: 'GET',
          strategyOptions: {
            cacheableResponse: {
              statuses: [0, 200],
            },
          },
        }
      ],
    },
  }, */
  /* vuetify: {
    customVariables: ['~/assets/styles/variables.scss'],
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
  }, */
  /*
   ** Build configuration
   ** See https://nuxtjs.org/api/configuration-build/
   */
  build: {
    transpile: ['vee-validate/dist/rules'],
    /* plugins: [new VuetifyLoaderPlugin()],
    loaders: {
      sass: {
        additionalData: "@import '@/assets/scss/variables/variables.scss'",
      }
    }, */
    babel: {
      presets({ envName }) {
        const envTargets = {
          client: { browsers: ["last 2 versions"], ie: 11 },
          server: { node: "current" }
        }
        return [
          ["@nuxt/babel-preset-app", {
            loose: true,
            targets: envTargets[envName]
          }]
        ]
      }
    },
    
  },
  /* server: {
    host: '0'
  }, */
  /* alias: {
    '@vue/composition-api$': '@vue/composition-api/dist/vue-composition-api.mjs',
    '@vue/composition-api/dist/vue-composition-api.mjs': vueCompositionAPIFullpath,
  }, */
  render: {
    resourceHints: true,
    bundleRenderer: {
      shouldPreload: (file, type) => {
        if (type === 'script' || type === 'style') {
          return true
        }
      },
    },
  },
  generate: {
    fallback: '404.html',
    interval: 2000
  }
});