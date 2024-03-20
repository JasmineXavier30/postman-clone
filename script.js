import axios from 'axios';
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import prettyBytes from 'pretty-bytes';
//import setupEditors from './setupEditors';

const queryParamsContainer = document.querySelector('[data-query-params]')
const reqHeadersContainer = document.querySelector('[data-req-headers]')
const keyValueTemplate = document.querySelector('[data-key-value-template]')

queryParamsContainer.append(createKeyValuePair())
reqHeadersContainer.append(createKeyValuePair())

document.querySelector('[data-add-query-param-btn]').addEventListener('click', () => {
    queryParamsContainer.append(createKeyValuePair())
})

document.querySelector('[data-add-req-header-btn]').addEventListener('click', () => {
    reqHeadersContainer.append(createKeyValuePair())
})

function createKeyValuePair() {
    const element = keyValueTemplate.content.cloneNode(true)
    element.querySelector('[data-remove-btn]').addEventListener('click', (e) => {
        e.target.closest('[data-key-value-pair]').remove()
    })
    return element
}

const form = document.querySelector('[data-form]')

//const { reqEditor, showResEditor } = setupEditors();

form.addEventListener('submit', (e) => {
    e.preventDefault();
    let json;
    try {
        let textAreaVal = document.querySelector('[data-json]').value;
        json = JSON.parse(JSON.stringify(textAreaVal) || null);
        alert(json)
    } catch(e) {
        alert("JSON Parse Error")
        return
    }

    axios({
        url: document.querySelector('[data-url]').value,
        method: document.querySelector('[data-method]').value,
        params: changeKeyValueToObj(queryParamsContainer),
        headers: changeKeyValueToObj(reqHeadersContainer),
        json
    })
    .catch((e) => e) // not here - handling errors using interceptors
    .then((res) => {
        document.querySelector('[data-res-section]').classList.remove('d-none')
        showResDetails(res)
        showResEditor(res.data) 
        showResHeaders(res.headers)
    })
    
})

//set current time as request start time

axios.interceptors.request.use((req) => {
    req.customData = req.customData || {};
    req.customData.startTime = new Date().getTime()
    return req;
})

axios.interceptors.response.use(updateEndTime, (e) => {
    return Promise.reject(updateEndTime(e.response))
})

function updateEndTime(res) {
    res.customData = res.customData || {};
    res.customData.timeTaken = new Date().getTime() - res.config.customData.startTime;
    return res;
}

function showResDetails(res) {
    //alert(JSON.stringify(res.config.customData.timeTaken))
    document.querySelector('[data-status]').textContent = res.status
    document.querySelector('[data-time]').textContent = res.customData.timeTaken
    document.querySelector('[data-size]').textContent = prettyBytes(JSON.stringify(res.data).length + JSON.stringify(res.headers).length)
}
function showResHeaders(headers) {
    let resHeadersContainer = document.querySelector('[data-res-headers]');
    resHeadersContainer.innerHTML = "";
    for(const [key, value] of headers) {
        let keyEle = document.createElement('div');
        keyEle.textContent = key;
        resHeadersContainer.append(keyEle)
        let valEle = document.createElement('div');
        valEle.textContent = value;
        resHeadersContainer.append(valEle)
    }
}

function showResEditor(data) {
    console.log(JSON.stringify(data))
    let resBodyContainer = document.querySelector('[data-json-res-body]');
    resBodyContainer.innerHTML = "";
    let ele = document.createElement('pre');
    data = JSON.stringify(data, null, 2);
    ele.textContent = data;
    resBodyContainer.append(ele);
}

function changeKeyValueToObj(container) {
    const pairs = container.querySelectorAll('[data-key-value-pair]');
    let obj = [...pairs].reduce((data, pair) => {
        let key = pair.querySelector('[data-key]').value
        let value = pair.querySelector('[data-value]').value
        
        if(key === "") return data;

        return {...pair, [key]: value}
    }, {})
    return obj;
}