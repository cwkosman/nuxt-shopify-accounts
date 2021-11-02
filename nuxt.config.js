// import generateRoutes from './nacelle-routing/generateRoutes'

require('dotenv').config()

export default {
  target: 'static',

  // Global page headers: https://go.nuxtjs.dev/config-head
  head: {
    title: process.env.npm_package_name || '',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      {
        hid: 'description',
        name: 'description',
        content: process.env.npm_package_description || ''
      }
    ],
    link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }]
  },

  // Global CSS: https://go.nuxtjs.dev/config-css
  css: ['@/assets/global.scss'],

  // Auto import components: https://go.nuxtjs.dev/config-components
  components: ['~/components/account', '~/components/nacelle'],

  // Add environment variables to either `publicRuntimeConfig` (exposed to client)
  // or to `privateRuntimeConfig`
  // https://nuxtjs.org/blog/moving-from-nuxtjs-dotenv-to-runtime-config/#introducing-the-nuxtjs-runtime-config
  publicRuntimeConfig: {
    API_PORT: process.env.API_PORT,
    contentAssetStorage: process.env.CONTENT_ASSET_STORAGE || '',
    nacelleId: process.env.NACELLE_SPACE_ID,
    nacelleToken: process.env.NACELLE_GRAPHQL_TOKEN,
    nacelleEndpoint: 'https://hailfrequency.com/v2/graphql',
    myshopifyDomain: process.env.MYSHOPIFY_DOMAIN,
    serverlessEndpoint: process.env.SERVERLESS_ENDPOINT,
    shopifyToken: process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN
  },

  // PWA module configuration: https://go.nuxtjs.dev/pwa
  pwa: {
    manifest: {
      lang: 'en'
    }
  },

  // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
  buildModules: ['@nuxtjs/eslint-module', 'nuxt-purgecss', '@nuxtjs/dotenv'],

  // Modules: https://go.nuxtjs.dev/config-modules
  modules: ['@nuxtjs/pwa', 'cookie-universal-nuxt', '~/modules/nacelle'],

  // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
  plugins: [
    { src: '~/plugins/nuxt-client-init.js', ssr: false },
    { src: '~/plugins/authOnLoad.js', ssr: false }
  ],

  /*
   ** Nacelle Configuration
   * https://docs.getnacelle.com/nuxt/nuxt-config.html
   */
  nacelle: {
    spaceID: process.env.NACELLE_SPACE_ID,
    token: process.env.NACELLE_GRAPHQL_TOKEN,
    myshopifyDomain: process.env.MYSHOPIFY_DOMAIN,
    shopifyCustomDomain: process.env.SHOPIFY_CUSTOM_DOMAIN,

    // Rather than use the same Storefront Access Token
    // that's provided to the Nacelle Dashboard, please create
    // a new Shopify Private App with only `unauthenticated_read_product_listings` scope
    shopifyToken: process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN
  },

  generate: {
    crawler: false,
    concurrency: 25
    // async routes() {
    //   return await generateRoutes()
    // }
  },

  // Customize the progress-bar color
  loading: { color: '#fff' },

  vue: {
    config: {
      devtools: true
    }
  },

  // Build Configuration: https://go.nuxtjs.dev/config-build
  build: {
    extend(config) {
      config.node = {
        Buffer: false
      }
    },
    postcss: {
      preset: {
        features: {
          customProperties: false
        }
      }
    },
    html: {
      minify: {
        collapseBooleanAttributes: true,
        decodeEntities: true,
        minifyCSS: false,
        minifyJS: false,
        processConditionalComments: true,
        removeEmptyAttributes: true,
        removeRedundantAttributes: true,
        trimCustomFragments: true,
        useShortDoctype: true
      }
    }
  }
}
