// Constantes de la page HTML
const weatherDisplay = document.getElementsByClassName('weather-display')
const weatherImage = document.getElementsByClassName('weather-image')
const weatherText = document.getElementsByClassName('weather-main')
const weatherDay = document.getElementsByClassName('weather-day')
const submitBtn = document.getElementsByTagName('button')[0]
const inputField = document.getElementsByTagName('input')[0]
const selectField = document.getElementsByTagName('select')[0]

/* -------------------- Dark Mode -------------------- */

let lightMode = "d"

//Promise qui traite le timezone_offset
const setTime = (arg) => {
    return new Promise (resolve => {
        let timeHere = Math.round((Date.now() / 1000)) //Heure du moment à Paris (+ conversion en secondes pour coller à la DB)
        let timeThere = parseInt(timeHere) + parseInt(arg.timezone_offset) - 3600 //Heure d'ici + offset API - 1h (cause: GMT+1)
        if ((timeThere > arg.daily[0].sunrise) && (timeThere < arg.daily[0].sunset)) {
            document.body.classList.remove('dark-mode')
            resolve("d")
        } else {
            document.body.classList.add('dark-mode')
            resolve("n")
        }
    })
}

/* -------------------- OpenCage and OpenWeather API Request -------------------- */

/* ----- Constantes des API's ----- */
// OpenCage
const cage_key = "0cf8ff533c404738a82298f6a2a013db" //process.env.OPENCAGE_API_KEY
const cage_api_url = 'https://api.opencagedata.com/geocode/v1/json'
// OpenWeather
const weather_key = "d0fcc00c02efe5b8355fa57156f79f2b" //process.env.OPENWEATHER_API_KEY
const weather_api_url = 'https://api.openweathermap.org/data/2.5/onecall'

/* ----- Déclaration des variables ----- */
let inputValue
let city
let cage_request_url
let lat
let lon
let weather_request_url
let daysSelected = selectField.value


/* ----- Fonctions / Fetch / Et autres scripts ----- */

//Mise à jour du nombre de jours à display
selectField.onchange = () => {
    daysSelected = selectField.value
}

//Mise à jour de la première URL
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
inputField.oninput = () => {
    getValue()
}

//Première promise qui retourne les coordonées
const getCoord = () => {
    return fetch(cage_request_url)
            .then(resp => resp.json())
            .then(json => {return json.results[0].geometry})
            .catch(err => {
                console.error('Problème avec l\'opération fetch: ' + err.message)
                alert('Woops! Please check your spelling.')
            })
}
//Deuxième promise qui utilisera la première pour retourner la météo
const getWeather = (arg) => {
    weather_request_url = weather_api_url //construction de l'URL
        + '?'
        + 'lat=' + arg.lat
        + '&lon=' + arg.lng
        + '&exclude=hourly,minutely,current,alerts'
        + '&appid=' + weather_key
    return fetch(weather_request_url)
            .then(resp => resp.json())
            .then(json => {return json})
            .catch(err => {
                console.error('Problème avec l\'opération fetch: ' + err.message)
                alert('Woops! Please check your spelling.')
            })
}

//Convertir le dt en jour de la semaine
const stampToDate = (timeStamp) => {
    let a = new Date(timeStamp * 1000);
    const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    let dayOfWeek = days[a.getDay()]
return dayOfWeek
}

//Fonction async avec les deux promises et l'itération
const asyncRequests = async () => {
    const resOne = await getCoord()
    const resTwo = await getWeather(resOne)
    lightMode = await setTime(resTwo)
    //on clear le display
    for(let i=0; i<weatherDisplay.length; i++) {
        weatherDisplay[i].classList.add('hidden')
        let toClear = weatherDisplay[i].children
        for(let j=0; j<=2; j++) {
            if(j<2){
                toClear[j].innerText = ""
            } else {
                toClear[j].innerHTML = ""
            }
        }
    }
    //on boucle dans le tableau daily de la rep JSON
    for(let day=0; day<daysSelected; day++) {
        weatherDisplay[day].classList.remove('hidden')
        weatherDay[day].innerText = stampToDate(resTwo.daily[day].dt)
        weatherText[day].innerText = `${resTwo.daily[day].weather[0].description}`
        weatherImage[day].innerHTML = `<img alt="${resTwo.daily[day].weather[0].description} icon" />`
        weatherImage[day].lastElementChild.setAttribute('src', `https://openweathermap.org/img/wn/${(resTwo.daily[day].weather[0].icon).slice(0, -1)}${lightMode}@2x.png`)
    }
}

/* -------------------- Animation accordéon -------------------- */

const deployAccordion = () => {
    let thisAccordion = document.getElementsByClassName('weather-container')[0]
    thisAccordion.style.maxHeight = "0px"
    setTimeout(() => {
        thisAccordion.style.maxHeight &&
        (thisAccordion.style.maxHeight = "2000px")
    }, 550)
}

submitBtn.onclick = async (e) => {
    e.preventDefault()
    asyncRequests()
    deployAccordion()
}