// const dotenv = require('dotenv').config()

// Constantes de la page HTML
const resultDisplay = document.getElementsByClassName('weather-result')[0]
const submitBtn = document.getElementsByTagName('button')[0]
const inputField = document.getElementsByTagName('input')[0]

/* -------------------- OpenCage and OpenWeather API Request -------------------- */

/* ----- Constantes des API's ----- */
// OpenCage
const cage_key = process.env.OPENCAGE_API_KEY
const cage_api_url = 'https://api.opencagedata.com/geocode/v1/json'
// OpenWeather
const weather_key = process.env.OPENWEATHER_API_KEY
const weather_api_url = 'https://api.openweathermap.org/data/3.0/onecall'

/* ----- Déclaration des variables ----- */
let inputValue
let city
let cage_request_url
let lat
let lon
let weather_request_url

/* ----- Fonctions / Fetch / Et autres scripts ----- */

// Fonction de mise à jour des valeurs input/city/request_url
function getValue() {
    inputValue = inputField.value
    city = inputValue
    cage_request_url = cage_api_url 
        + '?' 
        + 'key=' + cage_key 
        + '&q=' + encodeURIComponent(city)
        + '&pretty=1'
        + '&no_annotations=1'
}

// Aller chercher lat et lon (onChange)
inputField.onchange = () => {
    getValue()
    fetch(cage_request_url)
        .then(response => response.json())
        .then(json => {
            resultDisplay.innerText = `lat: ${json.results[0].geometry.lat} long: ${json.results[0].geometry.lng}`
            lat = json.results[0].geometry.lat
            lon = json.results[0].geometry.lng
            weather_request_url = weather_api_url
                + '?'
                + 'lat=' + lat
                + '&lon=' + lon
                + '&exclude=hourly,daily'
                + '&appid=' + weather_key
            console.log(weather_request_url)
        })
        .catch(err => console.error('Problème avec l\'opération fetch: ' + err.message))
}

// Aller chercher la météo (onSubmit)
submitBtn.onclick = (e) => {
    e.preventDefault()
    console.log(weather_request_url)
    fetch(weather_request_url)
        .then(response => response.json())
        .then(json => console.log(json))
        .catch(err => console.error('Problème avec l\'opération fetch: ' + err.message))
}


/* 


inputField.oninput = () => {
    getValue()
}

//Fonction fetch de fetch
const getCoord = () => {
    fetch(cage_request_url)
        .then(resp => resp.json())
        .then(json => {
            lat = json.results[0].geometry.lat
            lon = json.results[0].geometry.lng
            weather_request_url = weather_api_url
                + '?'
                + 'lat=' + lat
                + '&lon=' + lon
                + '&exclude=hourly,daily'
                + '&appid=' + weather_key
        })
        .catch(err => console.error('Problème avec l\'opération fetch: ' + err.message))
}
const getWeather = () => {
    fetch(weather_request_url)
        .then(resp => resp.json())
        .then(json => console.log(json))
        .catch(err => console.error('Problème avec l\'opération fetch: ' + err.message))
}

submitBtn.onclick = async (e) => {
    e.preventDefault()
    await getCoord()
    await getWeather()
}

 */