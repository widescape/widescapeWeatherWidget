/*
 * widescapeWeather Widget
 * 
 * Version 2.2.1
 * 
 * Weather Management
 * 
 * 
 * The API key MUST NOT be used in 3rd party widgets.
 * If you make your own weather widget, please visit Weather Underground at:
 * http://www.wunderground.com/weather/api/
 * 
 * You'll need to sign up for an account, 
 * and make sure you abide by their license agreement.
 * 
 * (c) 2011 widescape / Robert Wünsch - info@widescape.net - www.widescape.net
 * Originally based on The Weather Widget: (c) 2003 - 2004 Pixoria
 */
var weatherURL = "http://api.wunderground.com/api/";
var apiKey = "eb6eabce8e630d4e";

//	Asynchronically fetches the weather data from Weather Underground.
function fetchWeather() {
	log("fetchWeather()");
	var userLocation = preferences.userLocation.value;
	var cityVal = preferences.cityValPref.value;
	var userCity = cityVal ? "zmw:"+cityVal : userLocation;
	
	if (!isLocationValid(userLocation)) {
		displayError( "Location missing", "You haven't entered a location yet. Click here to enter a location.", showWidgetPreferences);
		return false;
	}
	
	var locale = widget.locale.substr(0, 2);
	var apiLocale = widget.getLocalizedString("api.wunderground.locales."+locale);
	var _url = weatherURL + apiKey + "/lang:" + escape(apiLocale) + "/conditions/forecast/astronomy/q/" + escape(userCity) + ".xml";
	
	log("Trying to fetch: "+_url);
	
	var urlFetch = new URL();
	urlFetch.location = _url;
	try {
		urlFetch.fetchAsync(onWeatherDataFetched);
	}
	catch (error) {
		displayConnectionError(error,_url);
	}
}

// Receives the fetched weather data and looks for errors.
function onWeatherDataFetched(fetch) {
	log("onWeatherDataFetched()");
	
	// Checks location data (true = alert passively)
	var result = parseAndCheckFetchedData(fetch,true);
	if (!result) return false;
	
	// Assumes the result contains weather data.
	globalWeather = result;
	
	// Continues with the update
	updateWeather();
}

// Fetches matching locations
function chooseLocation(alertActively) {
	log("chooseLocation(alertActively => "+alertActively+")");
	
	var idArray = new Array();
	var cityArray = new Array();
	var locationCount = 0;
	var newCityName = preferences.userLocation.value;
	
	if (!isLocationValid(newCityName) && alertActively) {
		displayError( "Location missing", "You haven't entered a location yet. Click here to enter a location.", showWidgetPreferences);
		return false;
	}
	
	// Displays the entered city name right now
	preferences.cityName.value = newCityName;
	scaleWidget();
	
	var _url = weatherURL + apiKey + "/geolookup/q/" + escape(newCityName) + ".xml";
	
	log("Trying to fetch: "+_url);
	
	var urlFetch = new URL();
	urlFetch.location = _url;
	try {
		urlFetch.fetchAsync(onLocationDataFetched);
	}
	catch (error) {
		displayConnectionError(error,_url);
	}
}

// Receives the fetched location data and looks for errors.
function onLocationDataFetched(fetch) {
	log("onLocationDataFetched()");

	// Checks location data (false = actively)
	var result = parseAndCheckFetchedData(fetch,false);
	if (!result) return false;

	// Assumes the result contains location data.
	var city = result.evaluate("string(response/location/city)");
	var l = result.evaluate("string(response/location/l)");
	preferences.cityValPref.value = l.replace('/q/zmw:','');
	preferences.cityName.value = city;
	
	savePreferences();
	log("Call update() within onLocationDataFetched");
	update();
}

// Offers the fetched locations to the user.
function showLocationOptions(xml) {
	log("showLocationOptions()");
	
	var locations = xml.evaluate("response/results/result");
	var locationCount = locations.length;
	
	if (locationCount < 1) {
		alert("No results (problem with search data?)");
		return false;
	}
	
	var i, location, city, state, country, name, zmw;
	var locationOptions = new Array();
	var locationZmws = new Array();
	var locationCities = new Array();
	
	// Prepares fetched location data for easier access later on
	for (i = 0; i < locationCount; i++) {
		location = locations.item(i);
		
		city = location.evaluate("string(city)");
		state = location.evaluate("string(state)");
		country = location.evaluate("string(country)");
		zmw = location.evaluate("string(zmw)");
		
		name = city;
		if (state) name += ", "+state;
		if (country) name += ", "+country;
		
		locationOptions.push(name);
		locationZmws[name] = zmw;
		locationCities[name] = city;
	}
	
	// Displays more than 1 location as a form dialog
	if (locationOptions.length > 1) {		  
		var formFields = new Array();
		
		formFields[0] = new FormField();
		formFields[0].name = 'city_popup';
		formFields[0].title = 'Location:';
		formFields[0].type = 'popup';
		formFields[0].option = new Array();
		
		for (n = 0; n < locationCount; n++) {
			formFields[0].option[n] = locationOptions[n];
		}
			
		formFields[0].defaultValue = formFields[0].option[0];
		formFields[0].description = "Please choose the city closest to your location.";
		
		formResults = form(formFields, 'Choose a City', 'Choose');
		
		// Checks if action was canceled
		if (formResults == null) {
			preferences.userLocation.value = oldUserLocation;
			preferences.cityName.value = oldCityName;
		}
		else {
			preferences.userLocation.value = formResults[0];
			preferences.cityValPref.value = locationZmws[formResults[0]];
			preferences.cityName.value = locationCities[formResults[0]];
		}
	}
	// Assumes that only 1 location was returned
	// Directly assigns the fetched location
	else {
		preferences.userLocation.value = locationOptions[0];
		preferences.cityValPref.value = locationZmws[locationOptions[0]];
		preferences.cityName.value = locationCities[locationOptions[0]];
	}
	
	scaleWidget();
	
	//log("preferences.userLocation: "+preferences.userLocation.value);
	//log("preferences.cityValPref: "+preferences.cityValPref.value);
	
	savePreferences();
	log("Call update() after savePreferences within showLocationOptions");
	update();
}

// Parses the fetched weather data (xml) and updates the icon and text information accordingly.
function updateWeather() {
	//log ("updateWeather ()");
	
	if (globalWeather == "") return;
	suppressUpdates();
	
	try
	{
		var modTemp = 'f';
		var modSpeed = 'mph';
		var modDistance = 'mi';
		var modPressure = 'in';
		
		unitTemp = "F";
		unitDistance = "mi";
		unitSpeed = "mph";
		unitPres = "in";
		unitMeasure = "in";
		
		if (preferences.unitsPref.value == 1) {
			modTemp = 'c';
			modSpeed = 'kph';
			modDistance = 'km';
			modPressure = 'mb';
			
			unitTemp = "C";
			unitDistance = "km";
			unitSpeed = "km/h";
			unitPres = "mb";
			unitMeasure = "mm";
		}
		
		var xml = globalWeather;
		var fetchedLocation = xml.evaluate("string(response/current_observation/display_location/full)");
		var fetchedCity = xml.evaluate("string(response/current_observation/display_location/city)");
		preferences.cityName.value = fetchedCity;
		
	  var fetchedObservationTime = Math.round(xml.evaluate("string(response/current_observation/observation_epoch)"));
		var fetchedLocationTimeEpoch = Math.round(xml.evaluate("string(response/current_observation/local_epoch)"));
		var fetchedLocationTimeRfc822 = xml.evaluate("string(response/current_observation/local_time_rfc822)");
		
		var fetchedTemp = Math.round(xml.evaluate("string(response/current_observation/temp_"+modTemp+")"));
		var fetchedCode = xml.evaluate("string(response/current_observation/icon)");
		var fetchedCondPhrase = xml.evaluate("string(response/current_observation/weather)");
		
		var fetchedWindSpeedMph = xml.evaluate("string(response/current_observation/wind_mph)");
		var fetchedWindDir = xml.evaluate("string(response/current_observation/wind_dir)");
		var fetchedWindPoint = xml.evaluate("string(response/current_observation/wind_degrees)");
		var fetchedWindGustMph = xml.evaluate("string(response/current_observation/wind_gust_mph)");
		
		var fetchedWindSpeed = fetchedWindSpeedMph;
		var fetchedWindGust = fetchedWindGustMph;
		if (preferences.unitsPref.value == 1) {
			fetchedWindSpeed = Math.round(milesToKm(fetchedWindSpeedMph));
			fetchedWindGust = Math.round(milesToKm(fetchedWindGustMph));
		}
		
		var fetchedPrec = xml.evaluate("string(response/current_observation/precip_today_metric)");
		var fetchedHmid = xml.evaluate("string(response/current_observation/relative_humidity)");
		var fetchedVis = xml.evaluate("string(response/current_observation/visibility_"+modDistance+")");
		var fetchedPres = xml.evaluate("string(response/current_observation/pressure_"+modPressure+")");
		var fetchedDewPoint = Math.round(xml.evaluate("string(response/current_observation/dewpoint_"+modTemp+")"));
		
		var fetchedCurrentHour = xml.evaluate("string(response/moon_phase/current_time/hour)");
		var fetchedCurrentMinute = xml.evaluate("string(response/moon_phase/current_time/minute)");
		var fetchedSunsetHour = xml.evaluate("string(response/moon_phase/sunset/hour)");
		var fetchedSunsetMinute = xml.evaluate("string(response/moon_phase/sunset/minute)");
		var fetchedSunriseHour = xml.evaluate("string(response/moon_phase/sunrise/hour)");
		var fetchedSunriseMinute = xml.evaluate("string(response/moon_phase/sunrise/minute)");
		
		var fetchedForecastUrl = xml.evaluate("string(response/current_observation/forecast_url)");
		weatherLink		= fetchedForecastUrl == '' ? null : fetchedForecastUrl;
		forecastLink	= weatherLink + '#conds_details_fct';
		
		if (fetchedTemp == null) fetchedTemp = "";
		
		var localTime = new Date();
		var localTimeTimezoneOffset = -localTime.getTimezoneOffset();
		
		observationTime = new Date(fetchedObservationTime*1000);
		
		var currentDatetime = new Date(localTime.getTime());
		currentDatetime.setHours(fetchedCurrentHour);
		currentDatetime.setMinutes(fetchedCurrentMinute);
		
		var sunsetDatetime = new Date(localTime.getTime());
		sunsetDatetime.setHours(fetchedSunsetHour);
		sunsetDatetime.setMinutes(fetchedSunsetMinute);
		
		var sunriseDatetime = new Date(localTime.getTime());
		sunriseDatetime.setHours(fetchedSunriseHour);
		sunriseDatetime.setMinutes(fetchedSunriseMinute);
		
		// Gets the time zone of the selected location
		var fetchedLocationTimezoneHours = Number(fetchedLocationTimeRfc822.substr(-5,3));
		var fetchedLocationTimezoneMinutes = Number(fetchedLocationTimeRfc822.substr(-2,2));
		fetchedLocationTimezoneOffset = fetchedLocationTimezoneHours * 60 + fetchedLocationTimezoneMinutes;
		
		//log("fetchedLocationTimeRfc822: "+fetchedLocationTimeRfc822);
		//log("localTimeTimezoneOffset: "+localTimeTimezoneOffset);
		//log("fetchedLocationTimezoneOffset: "+fetchedLocationTimezoneOffset);
		
		// Calculates the offset between the local time and the time at the location
		localLocationTimeOffset = fetchedLocationTimezoneOffset - localTimeTimezoneOffset;
		
		//log("localLocationTimeOffset: "+localLocationTimeOffset);
		
		var dayTime = (currentDatetime.getTime() > sunriseDatetime.getTime() && currentDatetime.getTime() < sunsetDatetime.getTime()) ? 'day' : 'night';
		
		var iconName = getWeatherIcon(fetchedCode, fetchedCondPhrase, dayTime);
		
		newConditionLogText = '\nMain: ' + fetchedCode + ': ' + fetchedCondPhrase + ' (' + iconName + '.png)';
		weather.src		= "Resources/WeatherIcons/" + iconName + ".png";
		weather.onClick = onClickWeather;
		
		if (fetchedTemp == "N/A") fetchedTemp = "?";
		theTemp.data = fetchedTemp + "°";
		theCity.data = theDate.data = theTime.data = "";
	
		if (preferences.showDate.value == 1 || preferences.showTime.value == 1) {
			updateTime();
		}
		
		var theCondition = "";
		var theFeelsLike = "";
		var theHigh = "";
		var theLow = "";
		var theDewPoint = "";
		var theHumidity = "";
		var visData = "";
		var presChange = "";
		var thePressure = "";
		var windData = "";
	
		if ( fetchedCondPhrase == "N/A" ) {
			theCondition = widget.getLocalizedString("weather.conditions.unknown");
		} else {
			theCondition = fetchedCondPhrase;
		}
	
		//if ( fetchedHmid == "N/A" ) {
		//	theHumidity = "Humidity: Unknown";
		//} else {
		//	theHumidity = "Humidity: " + fetchedHmid;
		//}
	
		if (fetchedVis == "Unlimited") {
			visData = widget.getLocalizedString("weather.conditions.visibility.unlimited");
		} else if (fetchedVis == "N/A") {
			visData = widget.getLocalizedString("weather.conditions.visibility.unknown");
		} else {
			visData = widget.getLocalizedString("weather.conditions.visibility.absolute") + ": " + fetchedVis + " " + unitDistance;
		}
	
		//if ( fetchedPres == "N/A" ) {
		//	thePressure = "Pressure: Unknown";
		//} else {
		//	thePressure = "Pressure: " + fetchedPres + " " + unitPres;
		//}
		
		//if ( fetchedDewPoint == "N/A" ) {
		//	theDewPoint = "Dewpoint: Unknown";
		//} else {
		//	theDewPoint = "Dewpoint: " + fetchedDewPoint + "°" + unitTemp;
		//}
		
		if (fetchedWindDir == "CALM") {
			windData = widget.getLocalizedString("weather.conditions.winds.calm");
		}
		else {

			if (fetchedWindDir == "VAR") {
				windData = widget.getLocalizedString("weather.conditions.winds.variable") + " ";
			}
			else {
				windData = widget.getLocalizedString("weather.conditions.winds.wind_from") + " ";
					
				if (fetchedWindDir.length == 1 || fetchedWindDir.length == 2) {
					dirArray = [fetchedWindDir];
				} else {
					dirArray = [fetchedWindDir.substr(0,1), fetchedWindDir.substr(1,2)];
				}
			
				for (item in dirArray) {
				  windData += widget.getLocalizedString("weather.conditions.winds.directions." + dirArray[item]) + " ";
				}
			
			}
		
			windData += widget.getLocalizedString("weather.conditions.winds.at") + " " + fetchedWindSpeed + " " + unitSpeed;
		
			if (fetchedWindGust != "0"){
				windData += "\n" + widget.getLocalizedString("weather.conditions.winds.with_gusts_up_to") + " " + fetchedWindGust + " " + unitSpeed;
			}

		}	
		
		var toolTipData =	theCondition + "\n" +
						theFeelsLike +
						"\n" +
						//theHumidity + "\n" +
						visData + "\n" +
						//thePressure + "\n" +
						//theDewPoint + "\n" +
						windData + "\n" +
						"\n" +
						widget.getLocalizedString("weather.conditions.updated_at") + " " + formattedDateAndTime(observationTime, false);
	
		if (showToolTips) {
			weather.tooltip = toolTipData;
		} else {
			weather.tooltip = "";
		}
		
		updateForecasts(dayTime);
	
	}
	catch(error)
	{
	  log(error);
	}
	resumeUpdates();
}


function updateForecasts(currentDayTime) {
	log("updateForecasts("+currentDayTime+")");
	
	if (globalWeather == "") return;
	var xml = globalWeather;
	
	var forecastDesc = new Array;
	
	var forecastPath = new Array;
	var forecastHiPath = new Array;
	var forecastLowPath = new Array;
	var forecastIconPath = new Array;
	
	var forecastXML = xml.evaluate("response/forecast/simpleforecast/forecastdays/forecastday");
	
	var modTemp = 'fahrenheit';
	
	if (preferences.unitsPref.value == 1) {
		modTemp = 'celsius';
	}
	
	for (i = 0; i < 4; i++) {
		
		var dayXML = forecastXML.item(i);
		
		if (!dayXML) {
			forecastText[i][1].data = "";
			log("Error: Day "+i+" missing in forecast XML");
			continue;
		}
		
		var day;
		var dayDate = dayXML.evaluate("string(date/epoch)");
		var dayText = dayXML.evaluate("string(conditions)");
		var hiTemp = dayXML.evaluate("string(high/"+modTemp+")");
		var lowTemp = dayXML.evaluate("string(low/"+modTemp+")");
		var probPrec = Math.round(dayXML.evaluate("string(pop)")); // Probability of Precipitation
		var weatherCode = dayXML.evaluate("string(icon)");
		
		var dayTime = 'day';
		
		dayText = dayText.replace(/ \/ /g,"/");
		
		// BUG: If time zone is set to IST (Indian Standard Time) AND location is "Hoogeveen" 
		// AND preference "Date and Time of [Selected Location]" is set, the forecast day labels 
		// are one day too early (e.g. Thursday instead of Wednesday)
		if (i == 0) {
			dayTime = currentDayTime;
			day = dayTime == 'day' ? widget.getLocalizedString("date.today") : widget.getLocalizedString("date.tonight");
		}
		else {
			day = widget.getLocalizedString("date.abbr_day_names."+new Date(dayDate*1000).getDay());
		}
		displayTinyIcons(weatherCode, dayText, dayTime, i);

		forecastText[i][0].data	= hiTemp + "°";
		forecastText[i][1].data	= day;
		
		var tooltipText = "";
		var tooltipContainsPop = false;
		
		if (showToolTips) {
			tooltipText = dayText;
			if (weatherCode.match(/chance/i)) {
				tooltipText += ": "+probPrec+"%";
				tooltipContainsPop = true;
			}
			if (i != 0) {
				tooltipText += "\n" + widget.getLocalizedString("date.day") + ": " + hiTemp + "°"+unitTemp + "\n" + widget.getLocalizedString("date.night") + ": " + lowTemp + "°"+unitTemp;
			}
			if (!tooltipContainsPop) {
				if (i != 0) tooltipText += "\n";
				precipitation = weatherCode.match(/rain|drizzle|snow|ice|hail/i) ? dayText : widget.getLocalizedString("weather.conditions.precipitation");
        tooltipText += "\n" + widget.getLocalizedString("weather.conditions.chance_of").replace(/%{precipitation}/, precipitation);
				tooltipText += ": "+probPrec+"%";
			}
		}
		forecastImage[i][1].tooltip = tooltipText;
	}
	
	if (newConditionLogText != currentConditionLogText) {
		currentConditionLogText = newConditionLogText;
		newConditionLogText = observationTime.toLocaleString() + newConditionLogText;
		log( newConditionLogText );
	}
	
	scaleWidget();
	
}

function getWeatherIcon(iconName, dayText, dayTime, iteration) {
	if (typeof iteration == "undefined") iteration = 0;
	log ("getWeatherIcon("+iconName+", "+dayText+", "+dayTime+", iteration: "+iteration+")");
	iteration++;
	
	switch(iconName.toLowerCase()) {
		
		case 'chanceflurries':
		case 'chancerain':
		case 'chancesleet':
		case 'chancesnow':
		case 'chancetstorms':
			return getWeatherIcon(iconName.replace('chance',''), dayText, dayTime, iteration);
		
		case 'mostlysunny':
			return getWeatherIcon('partlycloudy', dayText, dayTime, iteration);
		
		case 'partlysunny':
			return getWeatherIcon('mostlycloudy', dayText, dayTime, iteration);
		
		case 'sunny':
			if (dayTime == 'night') return getWeatherIcon('clear', dayText, dayTime, iteration);
			return getWeatherIcon('hot', dayText, dayTime, iteration);
		
		case 'clear':
		case 'mostlycloudy':
		case 'partlycloudy':
		case 'snow':
		case 'rain':
			return iconName + dayTime;
	}
	
	// cloudy
	// flurries
	// fog
	// hazy
	// sleet
	// sunny
	// tstorms
	// unknown
	return iconName;
}

function displayTinyIcons(iconName, dayText, dayTime, whichTiny) {
	//log ("displayTinyIcons("+whichTiny+": "+iconName+", "+dayTime+")");
	forecastImage[whichTiny][1].src	= "Resources/WeatherIcons/" + getWeatherIcon(iconName, dayText, dayTime) + ".png";
}