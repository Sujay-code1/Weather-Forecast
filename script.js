// Define constants and API key
const apiKey = '6645c8cc749246748f671148242310'; 
const searchBtn = document.getElementById('search-btn');
const searchInput = document.getElementById('search-input');
const recentCitiesDropdown = document.getElementById('recent-cities');
const forecastCardsContainer = document.getElementById('forecast-cards');

// Event listner for serch button
searchBtn.addEventListener('click', () => {
    const city = searchInput.value.trim();
    if (city) {
        getWeatherByCity(city);
        addCityToRecent(city);
    } else {
        alert('Please enter a valid city name.');
    }
});

// Get weather for the current location
window.onload = function () {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
            const { latitude, longitude } = position.coords;
            getWeatherByCoords(latitude, longitude);
        }, () => {
            alert('Unable to retrieve your location. Please enter a city manually.');
        });
    } else {
        alert('Geolocation is not supported by this browser.');
    }
};

// Function to get weather by the city name
async function getWeatherByCity(city) {
    try {
        const weatherData = await fetchWeatherData(`http://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${city}&aqi=no`);
        displayWeatherData(weatherData);
        get5DayForecast(city);
    } catch (error) {
        displayError('City not found. Please try again.');
    }
}

// Function to get weather by cordinates current location
async function getWeatherByCoords(lat, lon) {
    try {
        const weatherData = await fetchWeatherData(`http://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${lat},${lon}&aqi=no`);
        displayWeatherData(weatherData);
    } catch (error) {
        displayError('Error fetching weather for your location.');
    }
}

// Fetch weather data from the API
async function fetchWeatherData(url) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error('Weather data not available');
    }
    return await response.json();
}

// Display weather data on the main card
function displayWeatherData(data) {
    const mainWeatherCard = document.getElementById('main-weather');
    const weatherIcon = document.getElementById('weather-icon');
    
    mainWeatherCard.innerHTML = `
        <h3>${data.location.name}</h3>
        <img id="weather-icon" src="${data.current.condition.icon}" alt="Weather Icon" style="width: 50px; height: 50px;">
        <p>Temperature: ${data.current.temp_c} °C</p>
        <p>Weather: ${data.current.condition.text}</p>
        <p>Wind Speed: ${data.current.wind_kph} km/h</p>
    `;
    
    document.getElementById('wind-speed').textContent = `${data.current.wind_kph} km/h`;
    document.getElementById('humidity').textContent = `${data.current.humidity} %`;
    document.getElementById('pressure').textContent = `${data.current.pressure_mb} hPa`;
    document.getElementById('visibility').textContent = `${data.current.vis_km} km`;
    document.getElementById('sunrise').textContent = data.astro ? data.astro.sunrise : 'Data not available';
    document.getElementById('sunset').textContent = data.astro ? data.astro.sunset : 'Data not available';
}

// Get 5-day forecast
async function get5DayForecast(city) {
    try {
        const forecastData = await fetchWeatherData(`http://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${city}&days=5&aqi=no&alerts=no`);
        display5DayForecast(forecastData);
    } catch (error) {
        displayError('Error fetching forecast data.');
    }
}

// Display 5-day forecast
function display5DayForecast(data) {
    forecastCardsContainer.innerHTML = '';
    const forecasts = data.forecast.forecastday;
    
    forecasts.forEach(forecast => {
        const forecastCard = document.createElement('div');
        forecastCard.classList.add('forecast-card');
        forecastCard.innerHTML = `
            <p>${new Date(forecast.date).toLocaleDateString()}</p>
            <img src="${forecast.day.condition.icon}" alt="Weather Icon" style="width: 50px; height: 50px;">
            <h4>Temperature: ${forecast.day.avgtemp_c} °C</h4>
            <p>Humidity: ${forecast.day.avghumidity} %</p>
        `;
        forecastCardsContainer.appendChild(forecastCard);
    });
}

// Handle recent searches (using localStorage)
function addCityToRecent(city) {
    let recentCities = JSON.parse(localStorage.getItem('recentCities')) || [];
    if (!recentCities.includes(city)) {
        recentCities.push(city);
        localStorage.setItem('recentCities', JSON.stringify(recentCities));
        updateRecentCitiesDropdown();
    }
}

// Update dropdown with recent cities
function updateRecentCitiesDropdown() {
    const recentCities = JSON.parse(localStorage.getItem('recentCities')) || [];
    if (recentCities.length > 0) {
        recentCitiesDropdown.style.display = 'block';
        recentCitiesDropdown.innerHTML = recentCities.map(city => `<option value="${city}">${city}</option>`).join('');
        recentCitiesDropdown.addEventListener('change', (e) => {
            getWeatherByCity(e.target.value);
        });
    }
}

// Display error messages
function displayError(message) {
    alert(message);
}
