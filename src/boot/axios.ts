import Vue from 'vue'
import axios from 'axios'
const api = "https://jsonplaceholder.typicode.com/"
const axiosInstance = axios.create({
    baseURL: api
})

Vue.prototype.$axios = axiosInstance
