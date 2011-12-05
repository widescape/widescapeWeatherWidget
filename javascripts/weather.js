/*
 * widescapeWeather Widget
 * 
 * Version 2.1.19
 * 
 * Weather Management
 * 
 * 
 * The apiKey MUST NOT be used in 3rd party widgets.
 * If you make your own weather widget, please visit Weather Underground at:
 * http://www.wunderground.com/weather/api/
 * 
 * You'll need to sign up for an account, 
 * and make sure you abide by their license agreement.
 * 
 * (c) 2011 widescape / Robert Wünsch - info@widescape.net - www.widescape.net
 * The Weather Widget: (c) 2003 - 2004 Pixoria
 */
var weatherURL = "http://api.wunderground.com/api/";
var apiKey = "eb6eabce8e630d4e";

//	Asynchronically fetches the weather data from Weather Underground.
function fetchDataAsync() {
	log("fetchDataAsync()");
	var userCity = preferences.userDisplayPref.value;
	var cityVal = preferences.cityValPref.value;
	if (cityVal) userCity = "zmw:"+cityVal;
	
	var _url = weatherURL + apiKey + "/conditions/forecast/astronomy/q/" + escape(userCity) + ".xml";
	
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
	
	// Checks location data (false = passively)
	var result = parseAndCheckFetchedData(fetch,false);
	if (!result) return false;
	
	// Assumes the result contains weather data.
	globalWeather = result;
	// Continues with the update
	onUpdateData();
}

// Receives the fetched weather data and looks for errors.
function onLocationDataFetched(fetch) {
	log("onLocationDataFetched()");
	
	// Checks location data (false = actively)
	var result = parseAndCheckFetchedData(fetch,true);
	if (!result) return false;
	
	// Assumes the result contains location data.
	savePreferences();
	update();
}

function parseAndCheckFetchedData(fetch,alertPassively) {
	log("parseAndCheckFetchedData()");
	
	// Checks if there was an HTTP error
	if (fetch.response.toString() != "200") {
		displayConnectionError(fetch.response,fetch.location);
		return false;
	}
	// Assumes we have a valid result.
	var result = fetch.result;
	
	// Tries to parse the XML
	try {
		xml = XMLDOM.parse(result);
	}
	catch (error) {
		displayConnectionError(error,fetch.location,"Retrieved XML could not be parsed. Please contact support at www.widescape.net/widgets");
		return false;
	}
	
	// Checks if the response doesn't contain a correct result
	if (result.length == 0 || result == "Could not load URL") {
		displayConnectionError(response,fetch.location);
		return false;
	}
	
	// Checks if an error was returned.
	if (xml.evaluate("string(response/error)")) {
		
		// Checks if no location was found.
		if (xml.evaluate("string(response/error/type)") == "querynotfound") {
			if (alertPassively) {
				var message = "We were unable to find the location \""+oldUserDisplayPref+"\".\n\nClick here to change the location.";
				displayError("querynotfound",message,showWidgetPreferences);
			}
			else {
				alert("We were unable to find the location \""+oldUserDisplayPref+"\".\n\nIf your location can't be found, try a entering a larger neighboring city.");
			}
			preferences.userDisplayPref.value = oldUserDisplayPref;
			return false;
		}
		// Handles any other error.
		else {
			var message = "There was a problem retrieving data from Weather Underground.\n\nError was: "+xml.evaluate("string(response/error/description)");
			if (alertPassively) {
				displayError(xml.evaluate("string(response/error/type)"),message,onClickReload);
			}
			else {
				alert(message);
			}
		}
	}
	
	// Checks if the result contains location options instead of weather data
	if (xml.evaluate("string(response/results)")) {
		showLocationOptions(xml);
		return false;
	}
	
	// Assumes the result is valid and correct.
	//log("URL fetched successfully: "+fetch.location);
	return xml;
}

// Fetches matching locations
function chooseLocation() {
	log("chooseLocation()");
	
	var idArray = new Array();
	var cityArray = new Array();
	var locationCount = 0;
	var newCityName = preferences.userDisplayPref.value;
	
	// Displays the entered city name right now
	preferences.cityName.value = newCityName;
	scaleWidget();
	
	var _url = weatherURL + apiKey + "/geolookup/q/" + escape(newCityName) + ".xml";
	var urlFetch = new URL();
	urlFetch.location = _url;
	try {
		urlFetch.fetchAsync(onLocationDataFetched);
	}
	catch (error) {
		displayConnectionError(error,_url);
	}
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
			preferences.userDisplayPref.value = oldUserDisplayPref;
			preferences.cityName.value = oldCityName;
		}
		else {
			preferences.userDisplayPref.value = formResults[0];
			preferences.cityValPref.value = locationZmws[formResults[0]];
			preferences.cityName.value = locationCities[formResults[0]];
		}
	}
	// Assumes that only 1 location was returned
	// Directly assigns the fetched location
	else {
		preferences.userDisplayPref.value = locationOptions[0];
		preferences.cityValPref.value = locationZmws[locationOptions[0]];
		preferences.cityName.value = locationCities[locationOptions[0]];
	}
	
	scaleWidget();
	
	//log("preferences.userDisplayPref: "+preferences.userDisplayPref.value);
	//log("preferences.cityValPref: "+preferences.cityValPref.value);
	
	savePreferences();
	update();
}

// Parses the fetched weather data (xml) and updates the icon and text information accordingly.
function updateWeather () {
	//log ("updateWeather ()");
	
	if (globalWeather == "") return;
	
	try
	{
		var modTemp = 'f';
		var modSpeed = 'mph';
		var modDistance = 'mi';
		
		if (preferences.unitsPref.value == 1) {
			modTemp = 'c';
			modSpeed = 'kph';
			modDistance = 'km';
		}
		
		var xml = globalWeather;
		var fetchedLocation = xml.evaluate("string(response/current_observation/display_location/full)");
		var fetchedCity = xml.evaluate("string(response/current_observation/display_location/city)");
		preferences.cityName.value = fetchedCity;
		
	  var fetchedTime = Math.round(xml.evaluate("string(response/current_observation/observation_epoch)"));
		var fetchedTemp = Math.round(xml.evaluate("string(response/current_observation/temp_"+modTemp+")"));
		var fetchedCode = xml.evaluate("string(response/current_observation/icon)");
		var fetchedCondPhrase = xml.evaluate("string(response/current_observation/weather)");
		
		var fetchedWindSpeed = xml.evaluate("string(response/current_observation/wind_mph)");
		var fetchedWindDir = xml.evaluate("string(response/current_observation/wind_degrees)");
		var fetchedWindPoint = xml.evaluate("string(response/current_observation/wind_dir)");
		
		var fetchedPrec = xml.evaluate("string(response/current_observation/precip_today_metric)");
		var fetchedHmid = xml.evaluate("string(response/current_observation/relative_humidity)");
		var fetchedVis = xml.evaluate("string(response/current_observation/visibility_"+modDistance+")");
		var fetchedPres = xml.evaluate("string(response/current_observation/pressure_mb)");
		
		var fetchedCurrentHour = xml.evaluate("string(response/moon_phase/current_time/hour)");
		var fetchedCurrentMinute = xml.evaluate("string(response/moon_phase/current_time/minute)");
		var fetchedSunsetHour = xml.evaluate("string(response/moon_phase/sunset/hour)");
		var fetchedSunsetMinute = xml.evaluate("string(response/moon_phase/sunset/minute)");
		var fetchedSunriseHour = xml.evaluate("string(response/moon_phase/sunrise/hour)");
		var fetchedSunriseMinute = xml.evaluate("string(response/moon_phase/sunrise/minute)");
		
		if (fetchedTemp == null) fetchedTemp = "";
		
		var nowTime = new Date();
		
		var observationDatetime = new Date(fetchedTime*1000);
		
		var currentDatetime = new Date(nowTime.getTime());
		currentDatetime.setHours(fetchedCurrentHour);
		currentDatetime.setMinutes(fetchedCurrentMinute);
		
		var sunsetDatetime = new Date(nowTime.getTime());
		sunsetDatetime.setHours(fetchedSunsetHour);
		sunsetDatetime.setMinutes(fetchedSunsetMinute);
		
		var sunriseDatetime = new Date(nowTime.getTime());
		sunriseDatetime.setHours(fetchedSunriseHour);
		sunriseDatetime.setMinutes(fetchedSunriseMinute);
		
		log("currentDatetime: "+currentDatetime+" ("+fetchedCurrentHour+":"+fetchedCurrentMinute+")");
		log("sunriseDatetime: "+sunriseDatetime);
		log("sunsetDatetime: "+sunsetDatetime);
		
		var dayTime = (currentDatetime.getTime() > sunriseDatetime.getTime() && currentDatetime.getTime() < sunsetDatetime.getTime()) ? 'day' : 'night';
		
		var iconName = getWeatherIcon(fetchedCode, fetchedCondPhrase, dayTime);
		
		newConditionLogText = '\nMain: ' + fetchedCode + ': ' + fetchedCondPhrase + ' (' + iconName + '.png)';
		weather.src		= "Resources/WeatherIcons/" + iconName + ".png";
		
		if (fetchedTemp == "N/A") fetchedTemp = "?";
		theTemp.data = fetchedTemp + "°";
		theCity.data = theDate.data = theTime.data = "";
	
		if (preferences.showDate.value == 1 || preferences.showTime.value == 1) {
			updateTime();
		}
		
		unitTemp = (preferences.unitsPref.value == 1) ? "C" : "F";
		unitDistance = (preferences.unitsPref.value == 1) ? "kilometers" : "miles";
		unitSpeed = (preferences.unitsPref.value == 1) ? "km/h" : "mph";
		unitPres = (preferences.unitsPref.value == 1) ? "Millibars" : "Inches";
		unitMeasure = (preferences.unitsPref.value == 1) ? "Millimeters" : "Inches";	
	
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
			theCondition = "Unknown Weather Condition";
		} else {
			theCondition = fetchedCondPhrase;
		}
	
		if ( fetchedHmid == "N/A" ) {
			theHumidity = "Humidity: Unknown";
		} else {
			theHumidity = "Humidity: " + fetchedHmid;
		}
	
		if (fetchedVis == "Unlimited") {
			visData = "Unlimited Visibility";
		} else if (fetchedVis == "N/A") {
			visData = "Visibility: Unknown";
		} else {
			visData = "Visibility: " + fetchedVis + " " + unitDistance;
		}
	
		if ( fetchedPres == "N/A" ) {
			thePressure = "Pressure: Unknown";
		} else {
			thePressure = "Pressure: " + fetchedPres;
		}
/*
		if (fetchedWindDir == "CALM") {
			windData = "Calm Winds";
		} else {

			if 	(fetchedWindDir == "VAR") {
		
				windData = "Variable winds ";
			
			} else {

				windData = "Wind from ";
					
				if (fetchedWindDir.length == 1 || fetchedWindDir.getText().length == 2) {
					dirArray = [xmlFetchedWindDir.getText()];
				} else {
					dirArray = [xmlFetchedWindDir.getText().substr(0,1), xmlFetchedWindDir.getText().substr(1,2)];
				}
			
				for (item in dirArray) {
					switch (dirArray[item]) {
						case "N":
							windData = windData + "North ";
							break;			
						case "S":
							windData = windData + "South ";
							break;			
						case "E":
							windData = windData + "East ";
							break;			
						case "W":
							windData = windData + "West ";
							break;			
						case "NE":
							windData = windData + "Northeast ";
							break;			
						case "SE":
							windData = windData + "Southeast ";
							break;			
						case "NW":
							windData = windData + "Northwest ";
							break;			
						case "SW":
							windData = windData + "Southwest ";
							break;			
					}
			
				}
			
			}
		
			windData = windData + "at " + xmlFetchedWindSpeed.getText() + " " + unitSpeed;
		
			if (xmlFetchedWindGust.getText() != "N/A"){
				windData = windData + "\nwith gusts up to " + xmlFetchedWindGust.getText() + " " + unitSpeed;
			}

		}	
*/
		var toolTipData =	theCondition + "\n" +
						theFeelsLike +
						"\n" +
						theHumidity + "\n" +
						visData + "\n" +
						//thePressure + "\n" +
						//windData + "\n" +
						"\n" +
						"Updated at " + formattedDateAndTime(observationDatetime);
	
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
	
	for (i = 0; i < 4; i++) {
		
		var dayXML = forecastXML.item(i);
		var day;
		var dayDate = dayXML.evaluate("string(date/epoch)");
		var dayText = dayXML.evaluate("string(conditions)");
		var hiTemp = dayXML.evaluate("string(high/celsius)");
		var lowTemp = dayXML.evaluate("string(low/celsius)");
		var weatherCode = dayXML.evaluate("string(icon)");
		
		var dayTime = 'day';
		
		dayText = dayText.replace(/ \/ /g,"/");
		
		if (i == 0) {
			dayTime = currentDayTime;
			day = dayTime == 'day' ? 'Today' : 'Tonight';
		}
		else {
			day = weekDays[new Date(dayDate*1000).getDay()];
		}
		displayTinyIcons(weatherCode, dayText, dayTime, i);

		forecastText[i][0].data	= hiTemp + "°";
		forecastImage[i][0].src	= "Resources/Day-" + day + ".png";

		if (showToolTips) {
			forecastImage[i][1].tooltip = dayText;
			if (i != 0) {
				forecastImage[i][1].tooltip += "\nDay: " + hiTemp + "°"+unitTemp + "\nNight: " + lowTemp + "°"+unitTemp;
			}
		} else {
			forecastImage[i][1].tooltip = "";
		}
	}
	
	if (newConditionLogText != currentConditionLogText) {
		currentConditionLogText = newConditionLogText;
		newConditionLogText = fetchedTime.toLocaleString() + newConditionLogText;
		log( newConditionLogText );
	}
	
	scaleWidget();
	
}

function getWeatherIcon(iconName, dayText, dayTime) {
	log ("getWeatherIcon("+iconName+", "+dayText+", "+dayTime+")");
	
	switch(dayText.toLowerCase()) {
		
		case 'chance of rain':
		case 'chance of flurries':
		case 'chance of sleet':
			dayText = dayText.replace('chance of','');
			iconName = iconName.replace('chance','');
		
		case 'clear':
		case 'mostly cloudy':
		case 'partly cloudy':
		case 'snow':
		case 'rain':
			return iconName+dayTime;
	}
	return iconName;
}

function displayTinyIcons(iconName, dayText, dayTime, whichTiny) {
	//log ("displayTinyIcons("+whichTiny+": "+iconName+", "+dayTime+")");
	forecastImage[whichTiny][1].src	= "Resources/WeatherIcons/" + getWeatherIcon(iconName, dayText, dayTime) + ".png";
}