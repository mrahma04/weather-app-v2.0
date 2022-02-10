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

// todays weather section
var todaysWeatherDivEl = document.querySelector('#todays-weather')

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
                getWeather(cityLat, cityLon, cityName)
                saveCities()
                renderHistoryBtn(cityList)
            })
        } else {
            alert('Unable to find City')
        }
    }).catch(function (error) {
        alert('Unable to connect to openweathermap.org')
    })
}

var getWeather = function (lat, lon, name) {
    var apiUrl = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&units=imperial&appid=${apiKey}`
    fetch(apiUrl).then(function (response) {
        if (response.ok) {
            response.json().then(function (data) {
                renderTodaysWeather(data, name)
            })
        } else {
            alert('Unable to get weather data')
        }
    })
}

var renderTodaysWeather = function(weatherData, city) {
    console.log(weatherData)

    todaysWeatherDivEl.textContent = ''

    var cityEl = document.createElement('h3')
    cityEl.textContent = city
    todaysWeatherDivEl.append(cityEl)

    var temp = weatherData.daily[0].temp.day
    var tempEl = document.createElement('p')
    tempEl.textContent = `Temp: ${temp}`
    todaysWeatherDivEl.append(tempEl)

    var wind = weatherData.daily[0].wind_speed
    var windEl = document.createElement('p')
    windEl.textContent = `Wind: ${wind}`
    todaysWeatherDivEl.append(windEl)

    var humidity = weatherData.daily[0].humidity
    var humidityEl = document.createElement('p')
    humidityEl.textContent = `Humidity: ${humidity}`
    todaysWeatherDivEl.append(humidityEl)

    var uvi = weatherData.daily[0].uvi
    var uviSpanEl = document.createElement('span')
    uviSpanEl.textContent = uvi
    uviSpanEl.setAttribute('style', 'padding: 5px')

    if (uvi < 2) {
        uviSpanEl.classList.add('bg-success')
    } else if (uvi <= 7) {
        uviSpanEl.classList.add('bg-warning')
    } else {
        uviSpanEl.classList.add('bg-danger')
    }
    

    var uviEl = document.createElement('p')
    uviEl.textContent = `UV Index: `
    uviEl.append(uviSpanEl)
    
    todaysWeatherDivEl.append(uviEl)
}

var renderHistoryBtn = function (cityList) {

    historyDivEl.textContent = ''

    if (cityList.length > 8) {
        for (let i = 0; i < 8; i++) {
            var cityBtn = document.createElement('button')
            cityBtn.classList.add('btn', 'btn-outline-primary', 'btn-block', 'mb-2')
            cityBtn.textContent = cityList[i].city
            cityBtn.setAttribute('data-city-id', cityList[i].id)
            cityBtn.setAttribute('data-city-name', cityList[i].city)
            historyDivEl.append(cityBtn)
        }
    } else {
        cityList.forEach(function (element) {
            var cityBtn = document.createElement('button')
            cityBtn.classList.add('btn', 'btn-outline-primary', 'btn-block', 'mb-2')
            cityBtn.textContent = element.city
            cityBtn.setAttribute('data-city-id', element.id)
            cityBtn.setAttribute('data-city-name', element.city)
            historyDivEl.append(cityBtn)
        })
    }
}

var getHistory = function(event) {
    var city = event.target.dataset.cityName
    getCityInfo(city)
}

loadCities()
renderHistoryBtn(cityList)

cityFormEl.addEventListener('submit', formSubmitHandler)
historyDivEl.addEventListener('click', getHistory)