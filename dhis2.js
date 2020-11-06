const axios = require('axios');
const config = require('config')

const dhis2 = axios.create({
    baseURL: config.get('dhis2.baseUrl')
});

dhis2.interceptors.request.use((request) => {
    request.headers = {
        Authorization: config.get('dhis2.token'),
        "Content-Type": "application/json"
    }
    return request;
}, (error) => { return Promise.reject(error) });


exports.dhis2 = dhis2;