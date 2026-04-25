import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { DefaultApolloClient } from '@vue/apollo-composable'
import { apolloClient } from './apollo'

const app = createApp(App)

app.use(router)
app.provide(DefaultApolloClient, apolloClient)

app.mount('#app')
