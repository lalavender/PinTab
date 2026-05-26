import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createVuetify } from 'vuetify'
import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'
import './css/styles.css'
import App from './App.vue'

const vuetify = createVuetify({
  defaults: {
    global: {
      ripple: false,
    },
  },
  theme: {
    defaultTheme: 'light',
    themes: {
      light: {
        dark: false,
        colors: {
          background: '#FFFFFF',
          surface: '#FFFFFF',
          'surface-variant': '#F5F5F5',
          primary: '#0BA665',
          secondary: '#424242',
          'on-background': '#212121',
          'on-surface': '#212121',
        },
      },
      dark: {
        dark: true,
        colors: {
          background: '#121212',
          surface: '#1E1E1E',
          'surface-variant': '#2C2C2C',
          primary: '#4CAF50',
          secondary: '#B0BEC5',
          'on-background': '#E0E0E0',
          'on-surface': '#E0E0E0',
        },
      },
      sakura: {
        dark: false,
        colors: {
          background: '#FFF0F5',
          surface: '#FFFFFF',
          'surface-variant': '#FFE4EC',
          primary: '#E84393',
          secondary: '#FDA7DF',
          'on-background': '#4A1942',
          'on-surface': '#4A1942',
        },
      },
      midnight: {
        dark: true,
        colors: {
          background: '#0D0D2B',
          surface: '#1A1A3E',
          'surface-variant': '#25255A',
          primary: '#7C83FD',
          secondary: '#A78BFA',
          'on-background': '#E0E7FF',
          'on-surface': '#E0E7FF',
        },
      },
      amber: {
        dark: false,
        colors: {
          background: '#FFF8E7',
          surface: '#FFFFFF',
          'surface-variant': '#FFF0CC',
          primary: '#D97706',
          secondary: '#F59E0B',
          'on-background': '#451A03',
          'on-surface': '#451A03',
        },
      },
      nebula: {
        dark: true,
        colors: {
          background: '#0B0B1A',
          surface: '#15152E',
          'surface-variant': '#1F1F42',
          primary: '#F472B6',
          secondary: '#22D3EE',
          'on-background': '#E2E8F0',
          'on-surface': '#E2E8F0',
        },
      },
    },
  },
})

const app = createApp(App)
app.use(createPinia())
app.use(vuetify)
app.mount('#app')
