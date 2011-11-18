/*
	
	widescapeWeather Widget

	Version 2.1.18
	
	Weather Management
	
	
	The partnerID and licenseID MUST NOT be used in 3rd party Widgets.
	If you make your own Weather Widget, please visit The Weather Channel at:
	http://www.weather.com/services/xmloap.html
	
	You'll need to sign up for an account, and make sure you abide by their
	license agreement.
	
	
	(c) 2008 widescape / Robert Wünsch - info@widescape.net - www.widescape.net
	The Weather Widget: (c) 2003 - 2004 Pixoria
*/
var partnerID	= "1006341644";
var licenseID	= "0647abc97052c741";

//-------------------------------------------------
// -- xmlError --
/*	Displays an alert with the xml error.
*/
function xmlError (str) { alert (str); };

//-------------------------------------------------
// -- fetchData --
/*	The fetchData function is used to populate our global data with XML data from The Weather Channel.
	Because we can only ask for certain bits of information with a reduced frequency, I do this to
	divide up the types of data that gets updated and keep other non-updated bits around so I can
	still use them in other functions. 
*/
function fetchData (fetchType) {
	//log ("fetchData ()");
	
	var userCity = preferences.cityValPref.value;
	unitValue = (preferences.unitsPref.value == 1) ? "m" : "s";
	
	if (globalLinks == "") fetchType = "full";
	globalWeather	= "";
	globalForecasts	= "";
	globalLinks		= "";
	
	var _url = "";
	
	switch (fetchType) {
		case "full":
			_url = "http://xoap.weather.com/weather/local/" + userCity + "?cc=*&dayf=4&prod=xoap&link=xoap&par=" + partnerID + "&key=" + licenseID + "&unit=" + unitValue;
			urlData = urlFetch.fetch(_url);
			if (urlData.length == 0 || urlData == "Could not load URL") {
				weather.tooltip	= "There was a problem connecting to The Weather Channel.\n\nPlease check your network connection and click here to reload.";
				weather.onClick	= function() {
					weather.src		= "Resources/WeatherIcons/waiting.png";
					updateNow();
					sleep(150);
					update (true);
					}
				weather.src		= "Resources/WeatherIcons/error.png";
				weather.reload ();
				scaleWidget();
				return;
			}
			else {
				weather.onClick	= null;
			}
			urlData = urlData.replace(/[\r]*\n/g,"");
			globalWeather = "<weather> " + urlData.match(/<loc id(.*?)<\/loc>/g) + urlData.match(/<cc>(.*?)<\/cc>/g) + " </weather>";
			globalForecasts = "<weather> " + urlData.match(/<dayf>(.*?)<\/dayf>/g) + " </weather>";
			globalLinks = "<weather> " + urlData.match(/<lnks(.*?)<\/lnks>/g) + " </weather>";
			break
		case "forecast":
			_url = "http://xoap.weather.com/weather/local/" + userCity + "?cc=*&dayf=4&prod=xoap&par=" + partnerID + "&key=" + licenseID + "&unit=" + unitValue;
			urlData = urlFetch.fetch(_url);
			if (urlData.length == 0 || urlData == "Could not load URL") return;
			urlData = urlData.replace(/[\r]*\n/g,"");
			globalWeather = "<weather> " + urlData.match(/<loc id(.*?)<\/loc>/g) + urlData.match(/<cc>(.*?)<\/cc>/g) + " </weather>";
			globalForecasts = "<weather> " + urlData.match(/<dayf>(.*?)<\/dayf>/g) + " </weather>";
			break
		case "weather":
			_url = "http://xoap.weather.com/weather/local/" + userCity + "?cc=*&link=xoap&par=" + partnerID + "&key=" + licenseID + "&unit=" + unitValue;
			urlData = urlFetch.fetch(_url);
			if (urlData.length == 0 || urlData == "Could not load URL") return;			
			urlData = urlData.replace(/[\r]*\n/g,"");
			globalWeather = "<weather> " + urlData.match(/<loc id(.*?)<\/loc>/g) + urlData.match(/<cc>(.*?)<\/cc>/g) + " </weather>";
			break
	}
	//log(_url);
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
	
	var xml = new XMLDoc(globalWeather, xmlError);

	var xmlFetchedTemp = xml.selectNode("/cc/tmp");
	var xmlFeelsTemp = xml.selectNode("/cc/flik");
	var xmlFetchedCity = xml.selectNode("/loc/dnam");
	var xmlFetchedConditions = xml.selectNode("/cc/icon");
	
	var xmlFetchedTextConditions = xml.selectNode("/cc/t");
	var xmlFetchedTime = xml.selectNode("/loc/tm");
	var xmlFetchedTimeZone = xml.selectNode("/loc/zone");
	var xmlFetchedPresChange = xml.selectNode("/cc/bar/d");
	var xmlFetchedPressure = xml.selectNode("/cc/bar/r");
	var xmlFetchedVis = xml.selectNode("/cc/vis");
	var xmlFetchedDew = xml.selectNode("/cc/dewp");
	var xmlFetchedHmid = xml.selectNode("/cc/hmid");

	var xmlFetchedWindSpeed = xml.selectNode("/cc/wind/s");
	var xmlFetchedWindGust = xml.selectNode("/cc/wind/gust");
	var xmlFetchedWindDir = xml.selectNode("/cc/wind/t");
	
	var fetchedTemp = 0;
	if (xmlFetchedTemp != null) fetchedTemp = xmlFetchedTemp.getText();
	var fetchedTimeZone = Number(xmlFetchedTimeZone.getText());
	
	// Get the time of the selected location
	var fetchedTimeArr = xmlFetchedTime.getText().split(" ");
	var fetchedTimeHours = Number(fetchedTimeArr[0].split(":")[0]);
	var fetchedTimeMinutes = Number(fetchedTimeArr[0].split(":")[1]);
	if (fetchedTimeArr[1] == "AM" && fetchedTimeHours == 12) fetchedTimeHours = 0;
	else if (fetchedTimeArr[1] == "PM" && fetchedTimeHours < 12) fetchedTimeHours += 12;
	fetchedTime = new Date(new Date().getFullYear(),new Date().getMonth(),new Date().getDate(),fetchedTimeHours,fetchedTimeMinutes,new Date().getSeconds());
	
	// Get the user's local time offset (timezone, summer time, date line)
	localOffsetDate = 0;
	localOffsetHours = new Date().getHours() - fetchedTimeHours;
	localOffsetMinutes = new Date().getMinutes() - fetchedTimeMinutes;
	if (localOffsetHours + fetchedTimeZone > 12)		localOffsetDate = -1;
	else if (localOffsetHours + fetchedTimeZone <= -12)	localOffsetDate = 1;
	
	newConditionLogText = '\nMain: ' + xmlFetchedConditions.getText() + ': ' + xmlFetchedTextConditions.getText() + ' (' + getWeatherIcon (xmlFetchedConditions.getText()) + '.png)';
	
	weather.src		= "Resources/WeatherIcons/" + getWeatherIcon (xmlFetchedConditions.getText()) + ".png";
						
	if (fetchedTemp == "N/A") fetchedTemp = "?";
	theTemp.data = fetchedTemp + "°";
	
	theCity.data = theDate.data = theTime.data = "";
	fetchedCity = xmlFetchedCity.getText();
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
	
	if ( xmlFetchedTextConditions.getText() == "N/A" ) {
		theCondition = "Unknown Weather Condition";
	} else {
		theCondition = xmlFetchedTextConditions.getText();
	}
	
	if ( xmlFeelsTemp.getText() == "N/A" ) {
		theFeelsLike = "";
	} else {
		theFeelsLike = "Feels like " + xmlFeelsTemp.getText() + "°" + unitTemp + " outside.\n";
	}
	
	if ( xmlFetchedDew.getText() == "N/A" ) {
		theDewPoint = "Dew Point: Unknown";
	} else {
		theDewPoint = "Dew Point: " + xmlFetchedDew.getText() + "°" + unitTemp;
	}

	if ( xmlFetchedHmid.getText() == "N/A" ) {
		theHumidity = "Humidity: Unknown";
	} else {
		theHumidity = "Humidity: " + xmlFetchedHmid.getText() + "%";
	}
	
	if (xmlFetchedVis.getText() == "Unlimited") {
		visData = "Unlimited Visibility";
	} else if (xmlFetchedVis.getText() == "N/A") {
		visData = "Visibility: Unknown";
	} else {
		visData = "Visibility: " + xmlFetchedVis.getText() + " " + unitDistance;
	}

	if (xmlFetchedPresChange.getText() == "steady" || xmlFetchedPresChange.getText() == "N/A") {
		presChange = "";
	} else {
		presChange = " and " + xmlFetchedPresChange.getText();
	}

	if ( xmlFetchedPressure.getText() == "N/A" ) {
		thePressure = "Pressure: Unknown";
	} else {
		thePressure = "Pressure: " + xmlFetchedPressure.getText() + " " + unitPres + presChange;
	}

	if (xmlFetchedWindDir.getText() == "CALM") {
		windData = "Calm Winds";
	} else {

		if 	(xmlFetchedWindDir.getText() == "VAR") {
		
			windData = "Variable winds ";
			
		} else {

			windData = "Wind from ";
					
			if (xmlFetchedWindDir.getText().length == 1 || xmlFetchedWindDir.getText().length == 2) {
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

	var toolTipData =	theCondition + "\n" +
					theFeelsLike +
					"\n" +
					theHumidity + ", " + theDewPoint + "\n" +
					visData + "\n" +
					//thePressure + "\n" +
					windData + "\n" +
					"\n" +
					"Updated at " + xmlFetchedTime.getText();
	
	if (showToolTips) {
		weather.tooltip = toolTipData;
	} else {
		weather.tooltip = "";
	}
	
	updateForecasts ();
}

//-------------------------------------------------
// -- updateForecasts --

function updateForecasts () {
	//log ("updateForecasts ()");
	
	if (globalForecasts == "") return;
	
	var xml = new XMLDoc(globalForecasts, xmlError);
	
	var forecastDesc = new Array;
	
	var forecastPath = new Array;
	var forecastHiPath = new Array;
	var forecastLowPath = new Array;
	var forecastIconPath = new Array;

	var forcastTonightIcon = '/dayf/day[@d="0"]/part[@p="n"]/icon';
	var tonightsIcon = xml.selectNode(forcastTonightIcon);
	
	var forecastTonightDesc = '/dayf/day[@d="0"]/part[@p="n"]/t';
	var tonightsDesc = xml.selectNode(forecastTonightDesc);

	for (i = 0; i < 4; i++) {
	
		forecastPath[i] = '/dayf/day[@d="' + i + '"]';
		forecastHiPath[i] = '/dayf/day[@d="' + i + '"]/hi';
		forecastLowPath[i] = '/dayf/day[@d="' + i + '"]/low';
		forecastIconPath[i] = '/dayf/day[@d="' + i + '"]/part[@p="d"]/icon';
		forecastDesc[i] = '/dayf/day[@d="' + i + '"]/part[@p="d"]/t';

		var day;
		var dayTextData = xml.selectNode(forecastDesc[i]);
		var dayData = xml.selectNode(forecastPath[i]);
		var hiTempData = xml.selectNode(forecastHiPath[i]);
		var lowTempData = xml.selectNode(forecastLowPath[i]);
		var iconData = xml.selectNode(forecastIconPath[i]);
		
		day = dayData.getAttribute("t");
		hiTemp = hiTempData.getText();
		lowTemp = lowTempData.getText();
		dayText = dayTextData.getText();
		dayText = dayText.replace(/ \/ /g,"/");
		displayTinyIcons(iconData.getText(), i);
		
		var isNight = false;
		
		if (i == 0) {
			if (hiTemp == "N/A"){
				day = "Tonight";
				hiTemp = lowTempData.getText();
				dayText = tonightsDesc.getText();
				displayTinyIcons(tonightsIcon.getText(), i);
			} else {
				day = "Today";
			}
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
		
		newConditionLogText += '\nForecast ' + i + ': ' + iconData.getText() + ': ' + dayText + ' (' + getWeatherIcon (iconData.getText()) + '.png)';
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
	
	switch (fetchedConditions){
		
		case "0":  // Thunder
		case "3":  // Strong Thunderstorms
		case "4":  // Thunderstorms
		case "17": // Hail
		case "35": // Mixed Rain and Hail
		case "47": // Night Thunder Storm
			return "thunderstorms";
			
		case "1":  // Tropical Storm
		case "2":  // Windy Showers
			return "windyshowers";
			
		case "5":  // Rain and Snow
		case "7":  // Freezing Rain
			return "icysnowyrain";
			
		case "6":  // Rain and Sleet
		case "18": // Sleet
			return "sleet";

		case "8":  // Freezing Drizzle
			return "icydrizzle";
			
		case "9":  // Drizzle
			return "drizzle";
			
		case "10": // Freezing Rain
			return "icyrain";
			
		case "11": // Showers
			return "showers";
			
		case "12": // Rain
		case "40": // Heavy Rain
			return "rain";
			
		case "13": // Flurries
			return "lightsnowflurries";
			
		case "14": // Snow Showers
			return "medsnow";
		
		case "15": // Blowing Snow
		case "43": // Blizzard
			return "windysnow";
			
		case "16": // Snow
		case "41": // Scattered Snow Showers - day
		case "42": // Heavy Snow
			return "normalsnow";
			
		case "19": // Dust
		case "20": // Fog
		case "21": // Hazy
		case "22": // Smoke
			return "fog";
			
		case "23": // Breezy
		case "24": // Windy
			return "windy";
			
		case "25": // Friged (Very Cold)
			return "fridged";
			
		case "26": // Cloudy (no sun/moon)
			return "cloudy";
			
		case "27": // Mostly Cloudy Night
			return "mostlycloudynight";
			
		case "28": // Mostly Cloudy Day
			return "mostlycloudyday";
			
		case "29": // Partially Cloudy Night
			return "partiallycloudynight";
			
		case "30": // Partially Cloudy Day
			return "partiallycloudyday";
			
		case "31": // Clear Night
			return "clearnight";
			
		case "32": // Sunny Day
			return "clearday";
			
		case "33": // Tiny bit of clouds at night
			return "partiallycloudynight";
			
		case "34": // Tiny bit of clouds during the day
			return "partiallycloudyday";
			
		case "36": // Hot
			return "hot";
			
		case "37": // Isolated Thunderstorms
		case "38": // Scattered Thunderstorms Day
			return "sunnythunderstorm";
			
		case "39": // Scattered Showers Day
			return "sunnyshowers";
			
		case "45": // Scattered Showers Night
			return "nightrain";
			
		case "46": // Scattered Snow Showers Night
			return "nightsnow";
			
		case "44": // No Feed
		default:   // 
			return "unknown";
	}
}

//-------------------------------------------------
// -- displayTinyIcons --

function displayTinyIcons (fetchedConditions, whichTiny) {
	//log ("displayTinyIcons ("+whichTiny+": " + fetchedConditions+")");
	
	fetchedConditions	= String(fetchedConditions);
	forecastImage[whichTiny][1].src	= "Resources/WeatherIcons/" + getWeatherIcon (fetchedConditions) + ".png";
}