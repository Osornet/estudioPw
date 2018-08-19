(function() {
    
    const API_TIME_ZOME_KEY = "f9e8826ac61546ee8d7211130181808";
    const API_TIME_ZONE_URL = "https://api.worldweatheronline.com/premium/v1/tz.ashx?key=" + API_TIME_ZOME_KEY +"&" +
    "format=json"+"&q=";

    const API_WEATHER_KEY = "79eefd6047bf757511b9920ba8685577";
    const API_WEATHER_URL = "https://api.openweathermap.org/data/2.5/weather?APPID=" + API_WEATHER_KEY + "&";
    const IMG_WEATHER = "http://openweathermap.org/img/w/";

    

    var today = new Date();
    var timeNow = today.toLocaleTimeString();
    var cityWeather = {};

    var $body = $("body");
    var $loader = $(".loader");

    var nombreNuevaCiudad = $("[data-input='cityAdd']");
    var buttonAdd = $("[data-button='add']");
    var buttonLoad = $("[data-saved-cities]");

    //local storage
    var cities = [];
    
    $(buttonAdd).on("click", addNewCity);

    $(nombreNuevaCiudad).on("keypress", function(event){
        if(event.which == 13){
            addNewCity(event);
        }
    });

    $(buttonLoad).on("click", loadSavedCities);

    cityWeather.zone;
    cityWeather.icon;
    cityWeather.temp;
    cityWeather.temp_max;
    cityWeather.temp_min;
    cityWeather.main;

    if(navigator.geolocation){
        navigator.geolocation.getCurrentPosition(getCoords, errFound);
    }else {
        alert("Por favor, actualiza tu navegador");
    }

    function errFound(error) {
        alert("Un error ocurrió: "+error.code);
    };
    /* 0 error desconocido
    1 permiso denegado
    2 Posicion no esta disponible
    3 timeout */
    function getCoords(position) {
        var lat = position.coords.latitude;
        var lon = position.coords.longitude;
        console.log("tu poscision es: "+lat+", "+lon);
        $.getJSON(API_WEATHER_URL + "lat=" + lat + "&lon=" + lon , getCurrentWeather);
    };

    function getCurrentWeather (data){
        cityWeather.zone = data.name;
        cityWeather.icon = IMG_WEATHER + data.weather[0].icon + ".png";
        cityWeather.temp = data.main.temp - 273.15;
        cityWeather.temp_max = data.main.temp_max - 273.15;
        cityWeather.temp_min = data.main.temp_min - 273.15;
        cityWeather.main = data.weather[0].main;
        cityWeather.current_time = timeNow;
        rederTemplate(cityWeather);
    };

    function activateTemplate(id) {
        var template = document.querySelector(id);
        return document.importNode(template.content, true);
    };

    function rederTemplate(cityWeather) {

        var clone = activateTemplate("#template--city");
        clone.querySelector("[data-time]").innerHTML = cityWeather.current_time;
        clone.querySelector("[data-city]").innerHTML = cityWeather.zone;
        clone.querySelector("[data-icon]").src = cityWeather.icon;
        clone.querySelector('[data-temp = "max"]').innerHTML = cityWeather.temp_max.toFixed(1);
        clone.querySelector('[data-temp = "min"]').innerHTML = cityWeather.temp_min.toFixed(1);
        clone.querySelector('[data-temp = "current"]').innerHTML = cityWeather.temp.toFixed(1);

        $($loader).hide();
        $($body).append(clone);
        
    };

    function addNewCity(event) {
        event.preventDefault();
        $.getJSON(API_WEATHER_URL + "q=" + $(nombreNuevaCiudad).val(),getWeatherNewCity);
        
    };

    function getWeatherNewCity(data){
        $.getJSON(API_TIME_ZONE_URL + $(nombreNuevaCiudad).val(), function(dataTime){
        $(nombreNuevaCiudad).val("");
            cityWeather = {}
            cityWeather.zone = data.name;
            cityWeather.icon = IMG_WEATHER + data.weather[0].icon + ".png";
            cityWeather.temp = data.main.temp - 273.15;
            cityWeather.temp_max = data.main.temp_max - 273.15;
            cityWeather.temp_min = data.main.temp_min - 273.15;
            cityWeather.main = data.weather[0].main;
            cityWeather.current_time = new Date(dataTime.data.time_zone[0].localtime).toLocaleTimeString();
            rederTemplate(cityWeather);
            cities.push(cityWeather);
            localStorage.setItem("cities", JSON.stringify(cities));
        });
    }

    function loadSavedCities(event){
        event.preventDefault();
        function renderCities(cities){
            cities.forEach(function(city){
                rederTemplate(city);
            });
        }
        var cities = JSON.parse(localStorage.getItem("cities"));
        renderCities(cities);
    }

})();