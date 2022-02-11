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

// forecast section
var forecastDivEl = document.querySelector('#forecast')

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
        getCityInfo(cityList[0].city)
    } else {
        getCityInfo('New York')
    }
}

var formSubmitHandler = function (event) {
    event.preventDefault()

    var cityInput = cityInputEl.value.trim()
    cityInputEl.value = ''
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
                renderForecast(data, name)
            })
        } else {
            alert('Unable to get weather data')
        }
    })
}

var renderTodaysWeather = function (weatherData, city) {
    console.log(weatherData)

    todaysWeatherDivEl.textContent = ''

    // add today's date
    var unixTime = weatherData.daily[0].dt * 1000
    var time = new Date(unixTime).toLocaleDateString('en-US')
    var dateEl = document.createElement('span')
    dateEl.textContent = ` (${time})`

    // add icon
    var icon = weatherData.daily[0].weather[0].icon
    var iconEl = document.createElement('img')
    iconEl.src = `http://openweathermap.org/img/wn/${icon}.png`

    var cityEl = document.createElement('h3')
    cityEl.textContent = city
    cityEl.append(dateEl, iconEl)
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

var renderForecast = function (weatherData, city) {

    console.log(weatherData)

    forecastDivEl.textContent = ''

    for (let i = 1; i < 6; i++) {

        var dayCardEl = document.createElement('div')
        dayCardEl.classList.add('card', 'p-2', 'text-light')
        dayCardEl.setAttribute('style', 'min-width: 11rem')
        dayCardEl.style.backgroundColor = '#023047'

        // add today's date
        var unixTime = weatherData.daily[i].dt * 1000
        var time = new Date(unixTime).toLocaleDateString('en-US')
        var dateEl = document.createElement('span')
        dateEl.textContent = `${time}`

        // add icon
        var icon = weatherData.daily[i].weather[0].icon
        var iconEl = document.createElement('img')
        iconEl.src = `http://openweathermap.org/img/wn/${icon}.png`

        var temp = weatherData.daily[0].temp.day
        var tempEl = document.createElement('p')
        tempEl.textContent = `Temp: ${temp}`

        var wind = weatherData.daily[0].wind_speed
        var windEl = document.createElement('p')
        windEl.textContent = `Wind: ${wind}`

        var humidity = weatherData.daily[0].humidity
        var humidityEl = document.createElement('p')
        humidityEl.textContent = `Humidity: ${humidity}`

        dayCardEl.append(dateEl, iconEl, tempEl, windEl, humidityEl)
        forecastDivEl.append(dayCardEl)
    }
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

var getHistory = function (event) {
    var city = event.target.dataset.cityName
    getCityInfo(city)
}

loadCities()
renderHistoryBtn(cityList)

cityFormEl.addEventListener('submit', formSubmitHandler)
historyDivEl.addEventListener('click', getHistory)