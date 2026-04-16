// https://nuxt.com/docs/api/configuration/nuxt-config
import { fileURLToPath } from 'node:url'

const isDev = process.env.NODE_ENV === 'development'
const appManifestStub = fileURLToPath(new URL('./app-manifest.stub.ts', import.meta.url))

export default defineNuxtConfig({
  devtools: { enabled: false },
  
  modules: [],

  vite: {
    logLevel: 'silent',
    resolve: {
      alias: isDev ? { '#app-manifest': appManifestStub } : {},
    },
  },
  
  nitro: {
    preset: 'cloudflare-module',
  },

  app: {
    head: {
      title: 'What Do They Make?',
      htmlAttrs: { lang: 'en' },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        {
          name: 'description',
          content: 'Anonymous salary sharing. No accounts. No paywalls. No BS. Just spill the tea.'
        },
        {
          name: 'robots',
          content: 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1'
        },

        // Open Graph
        { property: 'og:title', content: 'What Do They Make?' },
        {
          property: 'og:description',
          content: 'See what people ACTUALLY make. No gatekeeping. No accounts. Just salaries.'
        },
        { property: 'og:type', content: 'website' },
        { property: 'og:site_name', content: 'What Do They Make?' },
        { property: 'og:image', content: 'https://whatdotheymake.com/logo.png' },
        { property: 'og:image:alt', content: 'What Do They Make logo' },

        // Twitter
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: 'What Do They Make?' },
        {
          name: 'twitter:description',
          content: 'See what people ACTUALLY make. No gatekeeping. No accounts. Just salaries.'
        },
        { name: 'twitter:image', content: 'https://whatdotheymake.com/logo.png' },
        { name: 'twitter:image:alt', content: 'What Do They Make logo' },

        { name: 'theme-color', content: '#16a34a' }
      ],
      link: [
        { rel: 'icon', type: 'image/png', href: '/logo.png' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600&display=swap'
        }
      ]
    }
  },

  css: ['~/assets/css/main.css'],

  runtimeConfig: {
    // Server-only keys
    d1Database: '',

    // LLM routing (server-only)
    // We call the Anthropic-compatible Messages endpoint on this host (e.g. a LiteLLM proxy).
    llmBaseUrl: '',

    // API keys (server-only)
    // - llmAutomodApiKey: used for content moderation
    // - llmSalaryApiKey: used for salary scoring
    // - llmFailoverApiKey: optional direct Anthropic fallback if proxy is unavailable
    llmAutomodApiKey: '',
    llmSalaryApiKey: '',
    llmFailoverApiKey: '',
    // Utility behavior knobs (server-only)
    currencyRatesTtlMs: 30 * 60 * 1000,
    currencyFetchTimeoutMs: 5000,
    currencyProviderUrl: 'https://open.er-api.com/v6/latest/USD',
    mapGeocodeCacheTtlMs: 1000 * 60 * 60 * 24 * 30,
    mapGeocodeConcurrency: 4,
    mapGeocodeUserAgent: 'whatdotheymake-map/1.0 (opensource@whatdotheymake.com)',
    salaryEstimateCacheTtlMs: 1000 * 60 * 60 * 24,


    // Model names (server-only)
    // These are passed through to your proxy.
    anthropicBaseUrl: 'https://api.anthropic.com',
    anthropicModel: 'claude-haiku-4-5',
    anthropicModerationMaxTokens: 300,
    anthropicModerationTimeoutMs: 8000,

    // Claude salary estimation (server-only)
    anthropicSalaryModel: '', // falls back to anthropicModel
    anthropicSalaryMaxTokens: 350,
    anthropicSalaryTimeoutMs: 8000,

    // Public keys exposed to client
    public: {
      siteUrl: 'https://whatdotheymake.com'
    }
  },

  compatibilityDate: '2024-01-01'
})
