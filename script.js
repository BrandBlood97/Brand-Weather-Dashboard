// Assigning variables
const cityEl = document.getElementById("city-search");
const searchEl = document.getElementById("search-button");
const clearEl = document.getElementById("clear-history");
const nameEl = document.getElementById("city-name");
const iconEl = document.getElementById("icon");
const tempEl = document.getElementById("temp");
const windEl = document.getElementById("wind");
const humidityEl = document.getElementById("humid");
const rainEl = document.getElementById("rain");
const historyEl = document.getElementById("history");
const fivedayEl = document.getElementById("fiveday-header");
const todayweatherEl = document.getElementById("today-weather");
let searchHistory = JSON.parse(localStorage.getItem("search")) || [];

// Assigning API key
const APIKey = "d83a0dd9e7c297eddf663e65997e44da";

// Function to convert temperature from Kelvin to Fahrenheit
function k2f(K) {
    return Math.floor((K - 273.15) * 1.8 + 32);
}

// Function to render search history
function renderSearchHistory() {
    historyEl.innerHTML = "";
    searchHistory.forEach(searchTerm => {
        const historyItem = document.createElement("input");
        historyItem.setAttribute("type", "text");
        historyItem.setAttribute("readonly", true);
        historyItem.setAttribute("class", "form-control d-block bg-white");
        historyItem.setAttribute("value", searchTerm);
        historyItem.addEventListener("click", () => {
            fetchWeather(searchTerm);
        });
        historyEl.append(historyItem);
    });
}

// Function to display search history
renderSearchHistory();
if (searchHistory.length > 0) {
    fetchWeather(searchHistory[searchHistory.length - 1]);
}

// Search button event listener
searchEl.addEventListener("click", () => {
    const searchTerm = cityEl.value;
    fetchWeather(searchTerm);
    searchHistory.push(searchTerm);
    localStorage.setItem("search", JSON.stringify(searchHistory));
    renderSearchHistory();
});

// Clear History button event listener
clearEl.addEventListener("click", () => {
    localStorage.clear();
    searchHistory = [];
    renderSearchHistory();
});

function fetchWeather(cityName) {
    // Fetch request from open weather api
    const queryURL = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${APIKey}`;
    fetch(queryURL)
        .then(response => response.json())
        .then(data => {
            todayweatherEl.classList.remove("d-none");

            // Display current weather
            const currentDate = new Date(data.dt * 1000);
            const day = currentDate.getDate();
            const month = currentDate.getMonth() + 1;
            const year = currentDate.getFullYear();
            nameEl.innerHTML = `${data.name} (${month}/${day}/${year})`;
            const weatherPic = data.weather[0].icon;
            iconEl.setAttribute("src", `https://openweathermap.org/img/wn/${weatherPic}@2x.png`);
            iconEl.setAttribute("alt", data.weather[0].description);
            tempEl.innerHTML = `Temperature: ${k2f(data.main.temp)} &#176F`;
            humidityEl.innerHTML = `Humidity: ${data.main.humidity}%`;
            windEl.innerHTML = `Wind Speed: ${data.wind.speed} MPH`;
            rainEl.innerHTML = `Rain Chance: ${data.rain ? data.rain["1h"] : 0}%`;

            // Get 5 day forecast
            const cityID = data.id;
            const forecastQueryURL = `https://api.openweathermap.org/data/2.5/forecast?id=${cityID}&appid=${APIKey}`;
            fetch(forecastQueryURL)
                .then(response => response.json())
                .then(data => {
                    fivedayEl.classList.remove("d-none");

                    // Display forecast for next 5 days
                    const forecastEls = document.querySelectorAll(".forecast");
                    forecastEls.forEach((forecastEl, i) => {
                        forecastEl.innerHTML = "";
                        const forecastIndex = i * 8 + 4;
                        const forecastDate = new Date(data.list[forecastIndex].dt * 1000);
                        const forecastDay = forecastDate.getDate();
                        const forecastMonth = forecastDate.getMonth() + 1;
                        const forecastYear = forecastDate.getFullYear();
                        const forecastDateEl = document.createElement("p");
                        forecastDateEl.setAttribute("class", "mt-3 mb-0 forecast-date");
                        forecastDateEl.innerHTML = `${forecastMonth}/${forecastDay}/${forecastYear}`;
                        forecastEl.append(forecastDateEl);

                        // Icon for current weather
                        const forecastWeatherEl = document.createElement("img");
                        forecastWeatherEl.setAttribute("src", `https://openweathermap.org/img/wn/${data.list[forecastIndex].weather[0].icon}@2x.png`);
                        forecastWeatherEl.setAttribute("alt", data.list[forecastIndex].weather[0].description);
                        forecastEl.append(forecastWeatherEl);
                        const forecastTempEl = document.createElement("p");
                        forecastTempEl.innerHTML = `Temp: ${k2f(data.list[forecastIndex].main.temp)} &#176F`;
                        forecastEl.append(forecastTempEl);
                        const forecastWindEl = document.createElement("p");
                        forecastWindEl.innerHTML = `Wind Speed: ${data.list[forecastIndex].wind.speed} MPH`;
                        forecastEl.append(forecastWindEl);
                        const forecastHumidityEl = document.createElement("p");
                        forecastHumidityEl.innerHTML = `Humidity: ${data.list[forecastIndex].main.humidity}%`;
                        forecastEl.append(forecastHumidityEl);
                        const forecastRainEl = document.createElement("p");
                        forecastRainEl.innerHTML = `Rain Chance: ${data.list[forecastIndex].rain ? data.list[forecastIndex].rain["3h"] : 0}%`;
                        forecastEl.append(forecastRainEl);
                    });
                });
        });
}
