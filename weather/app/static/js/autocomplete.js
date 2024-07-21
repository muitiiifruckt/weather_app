function setCookie(name, value, days) {
    let expires = "";
    if (days) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/";
}

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

document.addEventListener('DOMContentLoaded', () => {
    let userId = getCookie('user_id');
    if (!userId) {
        userId = 'user-' + Date.now(); // Генерация уникального ID
        setCookie('user_id', userId, 365); // Установка cookie на 1 год
        console.log('Generated new user ID:', userId);
    } else {
        console.log('Existing user ID:', userId);
    }
});
 document.addEventListener('DOMContentLoaded', async () => {
            const recentSearches = await fetchRecentSearches();
            initializeAutocomplete(recentSearches);

            // Add event listener for the Get Weather button
            document.getElementById('getWeatherButton').addEventListener('click', async () => {
                const city = document.getElementById('city-input').value.trim();
                if (!city) return;

                try {
                    await fetch('/api/search', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ city })
                    });

                    // Fetch weather data here and update the page
                } catch (error) {
                    console.error('Error saving search:', error);
                }
            });
        });
async function fetchRecentSearches() {
    try {
        const response = await fetch('/api/recent-searches');
        console.log(response);
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        console.log(data);
        return data.recent_searches;
    } catch (error) {
        console.error('Error fetching recent searches:', error);
        return [];
    }
}

function initializeAutocomplete(cities) {
    const input = document.getElementById('city-input');
    if(cities)
    {
        if(cities.length>1){
            input.value = cities[0];
        }
        else{
            input.value = cities
        }
    }
}


$(document).ready(function() {
    var availableCities = [
    "New York", "Los Angeles", "Chicago", "Houston", "Phoenix",
    "Philadelphia", "San Antonio", "San Diego", "Dallas", "San Jose",
    "Austin", "Jacksonville", "Fort Worth", "Columbus", "Charlotte",
    "San Francisco", "Indianapolis", "Seattle", "Denver", "Washington",
    "London", "Paris", "Berlin", "Madrid", "Rome",
    "Moscow", "Istanbul", "Dubai", "Tokyo", "Shanghai",
    "Beijing", "Hong Kong", "Singapore", "Seoul", "Bangkok",
    "Sydney", "Melbourne", "Toronto", "Vancouver", "Montreal",
    "Mexico City", "São Paulo", "Buenos Aires", "Lima", "Rio de Janeiro",
    "Jakarta", "Kuala Lumpur", "Manila", "Mumbai", "Delhi",
    "São Paulo", "Cairo", "Lagos", "Johannesburg", "Nairobi",
    "Dubai", "Hong Kong", "Kuwait City", "Doha", "Riyadh",
    "Vienna", "Amsterdam", "Brussels", "Zurich", "Geneva",
    "Warsaw", "Prague", "Budapest", "Lisbon", "Stockholm",
    "Oslo", "Helsinki", "Copenhagen", "Athens", "Lisbon",
    "Zurich", "Brussels", "Barcelona", "Madrid", "Rome",
    "Dublin", "Edinburgh", "Glasgow", "Bucharest", "Sofia",
    "Belgrade", "Dubrovnik", "Zagreb", "Ljubljana", "Tallinn",
    "Riga", "Vilnius", "Helsinki", "Oslo", "Reykjavik",
    "Auckland", "Wellington", "Christchurch", "Brisbane", "Perth",
    "Adelaide", "Hobart", "Darwin", "Gold Coast", "Cairns",
    "Abu Dhabi", "Manama", "Muscat", "Sharjah", "Jeddah",
    "Amman", "Beirut", "Damascus", "Tehran", "Baghdad",
    "Baku", "Tbilisi", "Yerevan", "Astana", "Almaty"
];


    $("#city-input").autocomplete({
        source: availableCities,
        select: function(event, ui) {
            // Устанавливаем выбранное значение в текстовое поле
            $("#city-input").val(ui.item.value);
            // Прекращаем дальнейшую обработку события
            event.preventDefault();
            // Закрываем список подсказок
            $(this).autocomplete("close");
        }
    });
});
const weatherIcons = {
    sunny: 'static/images/sunny.png',
    cloudy: 'static/images/cloudy.png',
    rain: 'static/images/rain.png',
    snow: 'static/images/snow.png',
    thunder: 'static/images/thunder.png'
};

function getWeatherIcon(weatherCode) {
    if (weatherCode >= 0 && weatherCode < 1) return weatherIcons.sunny;
    if (weatherCode >= 1 && weatherCode < 60) return weatherIcons.cloudy;
    if (weatherCode >= 60 && weatherCode < 70) return weatherIcons.rain;
    if (weatherCode >= 70 && weatherCode < 80) return weatherIcons.snow;
    if (weatherCode >= 80 && weatherCode < 100) return weatherIcons.thunder;
    return ''; // Default case for unknown weather codes
}

function addWeatherIcon(dayNumber, weatherCode) {
    const dayElement = document.getElementById(`day${dayNumber}`).parentNode;
    const existingImg = dayElement.querySelector('img');

    if (existingImg) {
        dayElement.removeChild(existingImg);
    }

    const img = document.createElement('img');
    img.src = getWeatherIcon(weatherCode);
    img.alt = 'Weather Icon';
    dayElement.appendChild(img);
}

async function getCoordinates(city) {
    const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(city)}&format=json&addressdetails=1`);
    if (!response.ok) throw new Error('City not found');
    const data = await response.json();
    if (data.length === 0) throw new Error('City not found');
    return { lat: data[0].lat, lon: data[0].lon };
}

async function getWeather(lat, lon) {
    const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,weather_code&timezone=Europe%2FLondon`);
    if (!response.ok) throw new Error('Failed to fetch weather data');
    return response.json();
}

function showTemporaryMessage(message) {
    const weatherInfoElement = document.getElementById('weatherInfo');
    weatherInfoElement.innerHTML = `<p>${message}</p>`;
    setTimeout(() => weatherInfoElement.innerHTML = '', 1000);
}

document.getElementById('getWeatherButton').addEventListener('click', async function () {
    const city = document.getElementById('city-input').value.trim();
    if (!city) return showTemporaryMessage('Please enter a city');

    try {

        const { lat, lon } = await getCoordinates(city);
        const weatherData = await getWeather(lat, lon);

        const now = new Date();
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        const monthName = monthNames[now.getMonth()];

        // Compute forecast data
        const forecast = Array.from({ length: 5 }, (_, i) => {
            const index = i * 24 + 12; // Adjust index to get the right forecast
            return {
                day: now.getDate() + i,
                temp: weatherData.hourly.temperature_2m[index] || 'N/A',
                weatherCode: weatherData.hourly.weather_code[index] || 0
            };
        });

        // Update the UI
        forecast.forEach((day, index) => {
            document.getElementById(`day${index + 1}`).textContent = day.temp;
            document.getElementById(`day${index + 1}_count`).textContent = `${day.day} ${monthName}`;
            addWeatherIcon(index + 1, day.weatherCode);
        });

        // Show forecast
        document.getElementById('forecast').style.display = 'flex';
        await fetch('/api/search', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ city: city })
            });

    } catch (error) {
        console.error('Error:', error);
        showTemporaryMessage('An error occurred');
    }
});
