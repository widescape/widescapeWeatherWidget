/*
	
	widescapeWeather Widget

	Version 2.1.19
	
	Weather Management
	
	
	The apiKey MUST NOT be used in 3rd party widgets.
	If you make your own weather widget, please visit World Weather Online at:
	http://www.worldweatheronline.com/register.aspx
	
	You'll need to sign up for an account, and make sure you abide by their
	license agreement.
	
	
	(c) 2011 widescape / Robert Wünsch - info@widescape.net - www.widescape.net
	The Weather Widget: (c) 2003 - 2004 Pixoria
*/
var weatherURL = "http://api.wunderground.com/api/";
var apiKey = "eb6eabce8e630d4e";
var forecastDays = 4; // Includes the current day

//-------------------------------------------------
// -- xmlError --
/*	Displays an alert with the xml error.
*/
function xmlError (str) { alert (str); };

//-------------------------------------------------
// -- fetchDataAsync --
/*	The fetchDataAsync function is used to populate our global data with XML data from World Weather Online.
	Because we can only ask for certain bits of information with a reduced frequency, I do this to
	divide up the types of data that gets updated and keep other non-updated bits around so I can
	still use them in other functions.
*/
function fetchDataAsync() {
	//log ("fetchDataAsync()");
	
	var userCity = preferences.userDisplayPref.value;
	unitValue = (preferences.unitsPref.value == 1) ? "c" : "f";
	
	var _url = weatherURL + apiKey + "/conditions/forecast/q/" + escape(userCity) + ".xml";
	
	var urlFetch = new URL();
	urlFetch.location = _url;
	try {
		urlFetch.fetchAsync(onWeatherDataFetched);
	}
	catch (error) {
		log("Error: " + error);
		log("On URL: "+_url);
		displayConnectionError(error);
	}
}

function onWeatherDataFetched(fetch) {
	// Checks if there was a HTTP error
	if (fetch.response.toString() != "200") {
		log("HTTP Error: " + fetch.response);
		log("On URL: "+fetch.location);
		displayConnectionError(fetch.response);
		return;
	}
	log("URL fetched successfully: "+fetch.location);
	var result = fetch.result;
	// Checks if the response doesn't contain a correct result
	if (result.length == 0 || result == "Could not load URL") {
		displayConnectionError(response);
		return;
	}
	// Assumes the result is correct
	globalWeather = result;
	// Continues with the update
	onUpdateData();
}

function displayConnectionError(error) {
	weather.tooltip	= "There was a problem connecting to Wunderground.com.\n\nPlease check your network connection and click here to reload.\n\nError was: "+error.toString().substring(0,70);
	weather.onClick	= function() {
		weather.src		= "Resources/WeatherIcons/waiting.png";
		updateNow();
		sleep(150);
		update();
	};
	weather.src		= "Resources/WeatherIcons/error.png";
	weather.reload();
	scaleWidget();
}

//-------------------------------------------------
// -- chooseCity --
/*	The chooseCity function will look at changed preference data and if there are multiple
    options for the entered information, suggest which the user can choose from.
*/
function chooseCity () {
	//log ("chooseCity ()");
	
	var idArray = new Array();
	var cityArray = new Array();
	var locationCount = 0;
	
	var searchResultsData = urlFetch.fetch("http://xoap.weather.com/search/search?where=" + escape(preferences.userDisplayPref.value));

	if (searchResultsData.length == "276"){
		alert("We were unable to find the city you entered.\n\nIf your city can't be found, try a entering a larger neighboring city.");
		preferences.userDisplayPref.value = oldUserCity;
		return;
	}

	if (urlData.length == 0 || urlData == "Could not load URL") {
		alert("We are unable to choose your city because we can't connect to The Weather Channel.\n\nPlease check your network connection or try again later.");
		preferences.userDisplayPref.value = oldUserCity;
		return;
	}

	var resultsXML = new XMLDoc(searchResultsData, xmlError);
	var resultsNode = resultsXML.docNode;

	if (resultsNode == null) {
		alert("There was a problem parsing search results.");
	} else {
		for (n = 0; n < resultsNode.children.length; n++) {
			if (resultsNode.children[n].tagName == "loc") {
				cityArray[locationCount] = resultsNode.children[n].getText();
				idArray[resultsNode.children[n].getText()] = resultsNode.children[n].getAttribute("id");
				++locationCount;
			}
		}
	}

	if (locationCount > 1) {		  
		var formFields = new Array();
		
		formFields[0] = new FormField();
		formFields[0].name = 'city_popup';
		formFields[0].title = 'Location:';
		formFields[0].type = 'popup';
		formFields[0].option = new Array();

		for (n = 0; n < locationCount; n++) {
			formFields[0].option[n] =  cityArray[n];
		}
			
		formFields[0].defaultValue = formFields[0].option[0];
		formFields[0].description = "Please choose the city closest to where you live.";
		
		formResults = form(formFields, 'Choose a City', 'Choose');
							
		if ( formResults != null ) {
			preferences.userDisplayPref.value = formResults[0].split(" (")[0];
			preferences.cityValPref.value = idArray[String(formResults[0])];
		}
	} else if (locationCount == 1) {
		preferences.userDisplayPref.value = cityArray[0].split(" (")[0];
		preferences.cityValPref.value = idArray[cityArray[0]];
	} else {
		alert("No results (problem with search data?)");
	}
	
	savePreferences();
	update();
}

//-------------------------------------------------
// -- updateWeather --
/*	The updateWeather function will look at the city and location XML blocks
	and display the temperature, an icon, and the city name that the data is
	associated with.
*/
function updateWeather () {
	//log ("updateWeather ()");
	
	if (globalWeather == "") return;
	
	try
	{
		var xml = XMLDOM.parse( globalWeather );
		globalWeatherXML = xml;
		
		var fetchedLocation = xml.evaluate("string(response/current_observation/display_location/full)");
		var fetchedCity = xml.evaluate("string(response/current_observation/display_location/city)");
		
	  var fetchedTime = xml.evaluate("string(response/current_observation/observation_epoch)");
		var fetchedTemp = xml.evaluate("string(response/current_observation/temp_c)");
		var fetchedCode = xml.evaluate("string(response/current_observation/icon)");
		var fetchedTextCond = xml.evaluate("string(response/current_observation/weather)");
		
		var fetchedWindSpeed = xml.evaluate("string(response/current_observation/wind_mph)");
		var fetchedWindDir = xml.evaluate("string(response/current_observation/wind_degrees)");
		var fetchedWindPoint = xml.evaluate("string(response/current_observation/wind_dir)");
		
		var fetchedPrec = xml.evaluate("string(response/current_observation/precip_today_metric)");
		var fetchedHmid = xml.evaluate("string(response/current_observation/relative_humidity)");
		var fetchedVis = xml.evaluate("string(response/current_observation/visibility_km)");
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
		
		var dayTime = (currentDatetime.getTime() > sunriseDatetime.getTime() && currentDatetime.getTime() < sunsetDatetime.getTime()) ? 'day' : 'night';
		
		var iconName = getWeatherIcon(fetchedCode, dayTime);
		
		newConditionLogText = '\nMain: ' + fetchedCode + ': ' + fetchedTextCond + ' (' + iconName + '.png)';
		weather.src		= "Resources/WeatherIcons/" + iconName + ".png";
		
		if (fetchedTemp == "N/A") fetchedTemp = "?";
		theTemp.data = fetchedTemp + "°";
		theCity.data = theDate.data = theTime.data = "";
	
		if (preferences.showDate.value == 1 || preferences.showTime.value == 1) {
			updateTime();
		}
	
		unitTemp = (preferences.unitsPref.value == 1) ? "C" : "F";
		unitDistance = (preferences.unitsPref.value == 1) ? "Kilometers" : "Miles";
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
	
		if ( fetchedTextCond == "N/A" ) {
			theCondition = "Unknown Weather Condition";
		} else {
			theCondition = fetchedTextCond;
		}
	
		if ( fetchedHmid == "N/A" ) {
			theHumidity = "Humidity: Unknown";
		} else {
			theHumidity = "Humidity: " + fetchedHmid + "%";
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
						"Updated at " + fetchedTime;
	
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

//-------------------------------------------------
// -- updateForecasts --

function updateForecasts(currentDayTime) {
	//log ("updateForecasts ()");
	
	if (globalWeatherXML == "") return;
	var xml = globalWeatherXML;
	
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
			day = "Today";
		}
		else {
			day = weekDays[new Date(dayDate*1000).getDay()];
		}
		displayTinyIcons(weatherCode, dayTime, i);

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
		
		newConditionLogText += '\nForecast ' + i + ': ' + weatherCode + ': ' + dayText + ' (' + getWeatherIcon(weatherCode,dayTime) + '.png)';
		
	}
	
	if (newConditionLogText != currentConditionLogText) {
		currentConditionLogText = newConditionLogText;
		newConditionLogText = fetchedTime.toLocaleString() + newConditionLogText;
		log( newConditionLogText );
	}
	
	scaleWidget();
	
}

//-------------------------------------------------
// -- getWeatherIcon --

function getWeatherIcon(iconName,dayTime) {
	log ("getWeatherIcon("+iconName+", "+dayTime+")");
	
	switch(iconName) {
		case 'clear':
		case 'mostlycloudy':
		case 'partiallycloudy':
		case 'snow':
			return iconName+dayTime;
	}
	return iconName;
}

//-------------------------------------------------
// -- displayTinyIcons --

function displayTinyIcons(iconName,dayTime,whichTiny) {
	log ("displayTinyIcons("+whichTiny+": "+iconName+", "+dayTime+")");
	forecastImage[whichTiny][1].src	= "Resources/WeatherIcons/" + getWeatherIcon(iconName,dayTime) + ".png";
}