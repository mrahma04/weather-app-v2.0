// https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}
// https://api.openweathermap.org/data/2.5/weather?id=${id}&appid=${apiKey}
// https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&appid=${apiKey}
// http://openweathermap.org/img/wn/${weatherIcon}.png
// a08a76e0b432a1339ec48baaa41272b8

// get City name from user input

var cityFormEl = document.querySelector('#city-form')
var cityInputEl = document.querySelector('#city-input')

// history section
var historyDivEl = document.querySelector('#history')

var apiKey = 'a08a76e0b432a1339ec48baaa41272b8'

var cityList = []

// save cityList to localStorage
var saveCities = function () {
    localStorage.setItem('savedCities', JSON.stringify(cityList))
}

// load cityList from localStorage
var loadCities = function () {
    // if there's no data in LocalStorage, it'll return 'null'
    var getFromLocalStorage = localStorage.getItem('savedCities')
    if (getFromLocalStorage) {
        cityList = JSON.parse(getFromLocalStorage)
    }
}

var formSubmitHandler = function (event) {
    event.preventDefault()
    var cityInput = cityInputEl.value.trim()
    getCityInfo(cityInput)
}

// get Weather data from API call using city name
// first get lat, lon and city id
// second use lat, lon to get weather data
var getCityInfo = function (city) {
    var apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`
    fetch(apiUrl).then(function (response) {
        if (response.ok) {
            response.json().then(function (data) {
                var cityLat = data.coord.lat
                var cityLon = data.coord.lon
                var cityName = data.name
                var cityId = data.id
                // if cityId does not exist, save cityName and cityId to cityList
                var findCity = cityList.findIndex((element) => element.id === cityId)

                if (findCity === -1) {
                    cityList.unshift({
                        city: cityName,
                        id: cityId
                    })
                }
                // console.log(cityList)
                console.log(data)
                // use lat lon to get fetch weather forecast, sinc the first API call does not
                // include UVI or forecast data
                getWeather(cityLat, cityLon)
                saveCities()
                renderHistory(cityList)
            })
        } else {
            alert('Unable to find City')
        }
    }).catch(function (error) {
        alert('Unable to connect to openweathermap.org')
    })
}

var getWeather = function (lat, lon) {
    var apiUrl = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&appid=${apiKey}`
    fetch(apiUrl).then(function (response) {
        if (response.ok) {
            response.json().then(function (data) {
                console.log(data)
            })
        } else {
            alert('Unable to get weather data')
        }
    })
}

var renderHistory = function (cityList) {

    historyDivEl.textContent = ''

    if (cityList.length > 8) {
        for (let i = 0; i < 8; i++) {
            var cityBtn = document.createElement('button')
            cityBtn.classList.add('btn', 'btn-outline-primary', 'btn-block', 'mb-2')
            cityBtn.textContent = cityList[i].city

            historyDivEl.append(cityBtn)
        }
    } else {
        cityList.forEach(function (element) {
            var cityBtn = document.createElement('button')
            cityBtn.classList.add('btn', 'btn-outline-primary', 'btn-block', 'mb-2')
            cityBtn.textContent = element.city

            historyDivEl.append(cityBtn)
        })
    }
}

loadCities()
renderHistory(cityList)

cityFormEl.addEventListener('submit', formSubmitHandler)