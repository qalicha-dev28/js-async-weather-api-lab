// API Key - replace with your own
const API_KEY = 'your_api_key_here';

// DOM Elements
const weatherForm = document.getElementById('weather-form');
const cityInput = document.getElementById('city-input');
const currentWeatherTable = document.getElementById('current-weather');
const forecastContainer = document.getElementById('forecast-container');
const weatherChartCtx = document.getElementById('weather-chart').getContext('2d');

let weatherChart = null;

// Event Listeners
weatherForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const city = cityInput.value.trim();
    
    if (city) {
        try {
            await fetchCurrentWeather(city);
            await fetchForecast(city);
        } catch (error) {
            console.error('Error fetching weather data:', error);
            alert('Failed to fetch weather data. Please try again.');
        }
    }
});

// Fetch Current Weather
async function fetchCurrentWeather(city) {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=imperial&appid=${API_KEY}`;
    
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error('City not found');
    }
    
    const data = await response.json();
    displayCurrentWeather(data);
}

// Display Current Weather
function displayCurrentWeather(data) {
    document.getElementById('city-name').textContent = data.name;
    document.getElementById('temperature').textContent = `${Math.round(data.main.temp)}°F`;
    document.getElementById('humidity').textContent = `${data.main.humidity}%`;
    document.getElementById('conditions').textContent = data.weather[0].description;
    document.getElementById('wind-speed').textContent = `${Math.round(data.wind.speed)} mph`;
}

// Fetch 5-Day Forecast
async function fetchForecast(city) {
    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&units=imperial&appid=${API_KEY}`;
    
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error('Forecast not available');
    }
    
    const data = await response.json();
    displayForecast(data);
    createChart(data);
}

// Display Forecast
function displayForecast(data) {
    forecastContainer.innerHTML = '';
    
    // Filter to get one entry per day (every 24 hours)
    const dailyForecasts = data.list.filter((item, index) => index % 8 === 0);
    
    dailyForecasts.forEach(forecast => {
        const forecastDiv = document.createElement('div');
        forecastDiv.className = 'forecast-item';
        
        const date = new Date(forecast.dt * 1000);
        const dateStr = date.toLocaleDateString('en-US', { 
            weekday: 'short', 
            month: 'short', 
            day: 'numeric' 
        });
        
        forecastDiv.innerHTML = `
            <h3>${dateStr}</h3>
            <p>Temp: ${Math.round(forecast.main.temp)}°F</p>
            <p>Humidity: ${forecast.main.humidity}%</p>
            <p>${forecast.weather[0].description}</p>
            <img src="https://openweathermap.org/img/wn/${forecast.weather[0].icon}.png" alt="${forecast.weather[0].description}">
        `;
        
        forecastContainer.appendChild(forecastDiv);
    });
}

// Create Chart
function createChart(data) {
    // Destroy previous chart if it exists
    if (weatherChart) {
        weatherChart.destroy();
    }
    
    // Prepare data for chart
    const labels = data.list.map(item => {
        const date = new Date(item.dt * 1000);
        return date.toLocaleTimeString([], { hour: '2-digit' });
    });
    
    const temps = data.list.map(item => item.main.temp);
    
    weatherChart = new Chart(weatherChartCtx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Temperature (°F)',
                data: temps,
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1,
                fill: false
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: false
                }
            }
        }
    });
}