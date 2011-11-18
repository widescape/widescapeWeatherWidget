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
var weatherURL = "http://free.worldweatheronline.com/feed/weather.ashx";
var apiKey = "c7ba3b1465133049111811";
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
	
	var _url = weatherURL+"?q=" + userCity + "&num_of_days=" + forecastDays + "&key=" + apiKey;
	
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
	weather.tooltip	= "There was a problem connecting to World Weather Online.\n\nPlease check your network connection and click here to reload.\n\nError was: "+error.toString().substring(0,70);
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
		
		var fetchedCity = xml.evaluate("string(data/request/query)");
		
	  var fetchedTime = xml.evaluate("string(data/current_condition/observation_time)");
		var fetchedTemp = xml.evaluate("string(data/current_condition/temp_C)");
		var fetchedCode = xml.evaluate("string(data/current_condition/weatherCode)");
		var fetchedTextCond = xml.evaluate("string(data/current_condition/weatherDesc)");
		
		var fetchedWindSpeed = xml.evaluate("string(data/current_condition/windspeedKmph)");
		var fetchedWindDir = xml.evaluate("string(data/current_condition/winddirDegree)");
		var fetchedWindPoint = xml.evaluate("string(data/current_condition/winddir16Point)");
		
		var fetchedPrec = xml.evaluate("string(data/current_condition/precipMM)");
		var fetchedHmid = xml.evaluate("string(data/current_condition/humidity)");
		var fetchedVis = xml.evaluate("string(data/current_condition/visibility)");
		var fetchedPres = xml.evaluate("string(data/current_condition/pressure)");
		var fetchedCloudc = xml.evaluate("string(data/current_condition/cloudcover)");
		
	}
	catch(error)
	{
	  log(error);
	}
	
	if (fetchedTemp == null) fetchedTemp = "";
	
	newConditionLogText = '\nMain: ' + fetchedCode + ': ' + fetchedTextCond + ' (' + getWeatherIcon(fetchedCode) + '.png)';
	weather.src		= "Resources/WeatherIcons/" + getWeatherIcon(fetchedCode) + ".png";
	
	if (fetchedTemp == "N/A") fetchedTemp = "?";
	theTemp.data = fetchedTemp + "°";
	
	theCity.data = theDate.data = theTime.data = "";
	fetchedCity = fetchedCity.match(/([^,\/]*).*/);
	fetchedCityName = fetchedCity[1];
	
	if (preferences.showDate.value == 1 || preferences.showTime.value == 1) {
		updateTime ();
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
	
	updateForecasts(xml);
}

//-------------------------------------------------
// -- updateForecasts --

function updateForecasts() {
	//log ("updateForecasts ()");
	
	if (globalWeatherXML == "") return;
	var xml = globalWeatherXML;
	
	var forecastDesc = new Array;
	
	var forecastPath = new Array;
	var forecastHiPath = new Array;
	var forecastLowPath = new Array;
	var forecastIconPath = new Array;
	
	var forecastXML = xml.evaluate("data/weather");
	
	for (i = 0; i < 4; i++) {
		
		var dayXML = forecastXML.item(i);
		var day;
		var dayDate = dayXML.evaluate("string(date)");
		var dayText = dayXML.evaluate("string(weatherDesc)");
		var hiTemp = dayXML.evaluate("string(tempMaxC)");
		var lowTemp = dayXML.evaluate("string(tempMinC)");
		var weatherCode = dayXML.evaluate("string(weatherCode)");
		
		dayText = dayText.replace(/ \/ /g,"/");
		displayTinyIcons(weatherCode, i);
		
		var isNight = false;
		
		if (i == 0) {
			day = "Today";
		}
		else {
			var dayDateArr = dayDate.split('-');
			day = weekDays[new Date(dayDateArr[0],dayDateArr[1],dayDateArr[2]).getDay()];
		}

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
		
		newConditionLogText += '\nForecast ' + i + ': ' + weatherCode + ': ' + dayText + ' (' + getWeatherIcon(weatherCode) + '.png)';
		
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

function getWeatherIcon (fetchedConditions) {
	//log ("getWeatherIcon ("+fetchedConditions+")");
	//return "grid";
	
	switch (parseInt(fetchedConditions)){
		
		case 386: // Patchy light rain in area with thunder
		case 389: // Moderate or heavy rain in area with thunder
		case 200: // Thundery outbreaks in nearby
			return "thunderstorms";
		
		
		case 392: // Patchy light snow in area with thunder
		case 395: // Moderate or heavy snow in area with thunder
			return "snowythunderstorms"; // TO DO
			
		//	return "windyshowers";
			
		//	return "icysnowyrain";
			
		case 365: // Moderate or heavy sleet showers
		case 362: // Light sleet showers
		case 320: // Moderate or heavy sleet
		case 317: // Light sleet
		case 182: // Patchy sleet nearby
			return "sleet";

		case 374: // Light showers of ice pellets
		case 311: // Light freezing rain
		case 284: // Heavy freezing drizzle
		case 281: // Freezing drizzle
		case 185: // Patchy freezing drizzle nearby
			return "icydrizzle";
			
		case 296: // Light rain
		case 293: // Patchy light rain
		case 266: // Light drizzle
		case 263: // Patchy light drizzle
			return "drizzle";
			
		case 377: // Moderate or heavy showers of ice pellets
		case 350: // Ice pellets
		case 314: // Moderate or Heavy freezing rain
			return "icyrain";
			
		case 356: // Moderate or heavy rain shower
		case 353: // Light rain shower
		case 305: // Heavy rain at times
		case 299: // Moderate rain at times
			return "showers";
			
		case 359: // Torrential rain shower
		case 308: // Heavy rain
		case 302: // Moderate rain
			return "rain";
			
		case 329: // Patchy moderate snow
		case 326: // Light snow
		case 323: // Patchy light snow
			return "lightsnowflurries";
			
		case 368: // Light snow showers
		case 332: // Moderate snow
		case 179: // Patchy snow nearby
			return "medsnow";
		
		case 230: // Blizzard
		case 227: // Blowing snow
			return "windysnow";
			
		case 371: // Moderate or heavy snow showers
		case 338: // Heavy snow
		case 335: // Patchy heavy snow
			return "normalsnow";
			
		case 260: // Freezing fog
		case 248: // Fog
		case 143: // Mist
			return "fog";
			
		//	return "windy";
			
		//	return "fridged";
			
		case 122: // Overcast
		case 119: // Cloudy
			return "cloudy";
			
		//	return "mostlycloudynight";
			
		case 116: // Partly Cloudy
			return "mostlycloudyday";
			
		//	return "partiallycloudynight";
			
		//	return "partiallycloudyday";
			
		//	return "clearnight";
			
		case 113: // Clear/Sunny
			return "clearday";
			
		//	return "partiallycloudynight";
			
		//	return "partiallycloudyday";
			
		//	return "hot";
			
		//	return "sunnythunderstorm";
			
		case 176: // Patchy rain nearby
			return "sunnyshowers";
			
		//	return "nightrain";
			
		//	return "nightsnow";
			
		default:   // 
			return "unknown";
	}
}

//-------------------------------------------------
// -- displayTinyIcons --

function displayTinyIcons (weatherCode, whichTiny) {
	//log ("displayTinyIcons ("+whichTiny+": " + weatherCode+")");
	forecastImage[whichTiny][1].src	= "Resources/WeatherIcons/" + getWeatherIcon(weatherCode) + ".png";
}