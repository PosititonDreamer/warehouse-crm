import { createApp } from 'vue'
import "./assets/styles/index.scss"
import App from './App.vue'
import router from './router/router'
import { createPinia } from 'pinia';

window.requst = "http://crm-system" // тестовый локальный домен для запросов на API
const pinia = createPinia();

createApp(App)
    .use(router)
    .use(pinia)
    .mount('#app')
