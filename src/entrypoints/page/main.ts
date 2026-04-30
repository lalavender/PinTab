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
      ocean: {
        dark: true,
        colors: {
          background: '#0A1929',
          surface: '#0F2744',
          'surface-variant': '#163861',
          primary: '#42A5F5',
          secondary: '#80DEEA',
          'on-background': '#CFD8DC',
          'on-surface': '#CFD8DC',
        },
      },
      forest: {
        dark: true,
        colors: {
          background: '#0B1A0B',
          surface: '#142814',
          'surface-variant': '#1E3A1E',
          primary: '#66BB6A',
          secondary: '#A5D6A7',
          'on-background': '#C8E6C9',
          'on-surface': '#C8E6C9',
        },
      },
      sunset: {
        dark: false,
        colors: {
          background: '#FFF8F0',
          surface: '#FFFFFF',
          'surface-variant': '#FFF0E0',
          primary: '#E65100',
          secondary: '#FF8A65',
          'on-background': '#3E2723',
          'on-surface': '#3E2723',
        },
      },
      lavender: {
        dark: false,
        colors: {
          background: '#F5F0FF',
          surface: '#FFFFFF',
          'surface-variant': '#EDE7F6',
          primary: '#7B1FA2',
          secondary: '#CE93D8',
          'on-background': '#311B92',
          'on-surface': '#311B92',
        },
      },
    },
  },
})

const app = createApp(App)
app.use(createPinia())
app.use(vuetify)
app.mount('#app')
