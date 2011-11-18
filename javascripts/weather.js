/*
	
	widescapeWeather widget
	
	Weather Management

	2.1.16
	
	
	The partnerID and licenseID MUST NOT be used in 3rd party Widgets.
	If you make your own Weather Widget, please visit The Weather Channel at:
	http://www.weather.com/services/xmloap.html
	
	You'll need to sign up for an account, and make sure you abide by their
	license agreement.
	
	
	(c) 2007 widescape / Robert Wünsch - info@widescape.net - www.widescape.net
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
	//sleep (300);
	//print ("fetchData ()");
	
	var userCity = preferences.cityValPref.value;
	unitValue = (preferences.unitsPref.value == 1) ? "m" : "s";
	
	if (globalLinks == "") fetchType = "full";
	
	var _url = "";
	
	switch (fetchType) {
		case "full":
			_url = "http://xoap.weather.com/weather/local/" + userCity + "?cc=*&dayf=4&prod=xoap&link=xoap&par=" + partnerID + "&key=" + licenseID + "&unit=" + unitValue;
			urlData = url.fetch(_url);
			if (urlData.length == 0 || urlData == "Could not load URL") {
				if (globalLinks == "") {
					//alert("There was a problem connecting to The Weather Channel.\n\nPlease check your network connection or try this Widget again later.");
					//closeWidget();
					weather.tooltip	= "There was a problem connecting to The Weather Channel.\n\nPlease check your network connection and click on the reload icon.";
					weather.src		= "Resources/WeatherIcons/error.png";
					weather.reload ();
					globalWeather	= "";
					globalForecasts	= "";
					globalLinks		= "";
					scaleWidget ();
					designWidget ();
				}
				return;
			}
			urlData = urlData.replace(/[\r]*\n/g,"");
			globalWeather = "<weather> " + urlData.match(/<loc id(.*?)<\/loc>/g) + urlData.match(/<cc>(.*?)<\/cc>/g) + " </weather>";
			globalForecasts = "<weather> " + urlData.match(/<dayf>(.*?)<\/dayf>/g) + " </weather>";
			globalLinks = "<weather> " + urlData.match(/<lnks(.*?)<\/lnks>/g) + " </weather>";
			break
		case "forecast":
			_url = "http://xoap.weather.com/weather/local/" + userCity + "?cc=*&dayf=4&prod=xoap&par=" + partnerID + "&key=" + licenseID + "&unit=" + unitValue;
			urlData = url.fetch(_url);
			if (urlData.length == 0 || urlData == "Could not load URL") return;
			urlData = urlData.replace(/[\r]*\n/g,"");
			globalWeather = "<weather> " + urlData.match(/<loc id(.*?)<\/loc>/g) + urlData.match(/<cc>(.*?)<\/cc>/g) + " </weather>";
			globalForecasts = "<weather> " + urlData.match(/<dayf>(.*?)<\/dayf>/g) + " </weather>";
			break
		case "weather":
			_url = "http://xoap.weather.com/weather/local/" + userCity + "?cc=*&link=xoap&par=" + partnerID + "&key=" + licenseID + "&unit=" + unitValue;
			urlData = url.fetch(_url);
			if (urlData.length == 0 || urlData == "Could not load URL") return;			
			urlData = urlData.replace(/[\r]*\n/g,"");
			globalWeather = "<weather> " + urlData.match(/<loc id(.*?)<\/loc>/g) + urlData.match(/<cc>(.*?)<\/cc>/g) + " </weather>";
			break
	}
	//print(_url);
}

//-------------------------------------------------
// -- chooseCity --
/*	The chooseCity function will look at changed preference data and if there are multiple
    options for the entered information, suggest which the user can choose from.
*/
function chooseCity () {
	//sleep (300);
	//print ("chooseCity ()");
	
	var cityCheck = preferences.userDisplayPref.value;
	var idArray = new Array();
	var cityArray = new Array();
	var locationCount = 0;
	
	if (oldUserCity != cityCheck) {
		
		var searchResultsData = url.fetch("http://xoap.weather.com/search/search?where=" + escape(cityCheck));
	
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
	}
	
	update (true);
	
}

//-------------------------------------------------
// -- updateWeather --
/*	The updateWeather function will look at the city and location XML blocks
	and display the temperature, an icon, and the city name that the data is
	associated with.
*/
function updateWeather () {
	//sleep (300);
	//print ("updateWeather ()");
	
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

	var fetchedTemp = xmlFetchedTemp.getText();
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
	
	//print(fetchedTime.toLocaleString());
	
	weather.src		= "Resources/WeatherIcons/" + getWeatherIcon (xmlFetchedConditions.getText()) + ".png";
						
	if (fetchedTemp == "N/A") fetchedTemp = "?";
	theTemp.data = fetchedTemp + "°";
	
	theCity.data = theDate.data = theTime.data = "";
	if (preferences.showCity.value == 1) {
		
		fetchedCity = xmlFetchedCity.getText();
		fetchedCity = fetchedCity.match(/([^,\/]*).*/);
		theCity.data = preferences.displayName.value == "" ? fetchedCity[1] : preferences.displayName.value;
	}
	if (preferences.showDate.value == 1 || preferences.showTime.value == 1) {
		updateTime ();
	}
	
	// Adjust widget's dimensions, because the City name might be different
	scaleWidget ();
	
	unitTemp = (preferences.unitsPref.value == 1) ? "C" : "F";
	unitDistance = (preferences.unitsPref.value == 1) ? "Kilometers" : "Miles";
	unitSpeed = (preferences.unitsPref.value == 1) ? "km/h" : "mph";
	unitPres = (preferences.unitsPref.value == 1) ? "Millibars" : "Inches";
	unitMeasure = (preferences.unitsPref.value == 1) ? "Millimeters" : "Inches";	
	
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

	toolTipData =	theCondition + "\n" +
					theFeelsLike +
					"\n" +
					theHumidity + ", " + theDewPoint + "\n" +
					visData + "\n" +
					//thePressure + "\n" +
					windData + "\n" +
					"\n" +
					"Updated at " + xmlFetchedTime.getText();
	
	if (showToolTips == 1) {
		weather.tooltip = toolTipData;
	} else {
		weather.tooltip = "";
	}
	
	updateForecasts ();
}

//-------------------------------------------------
// -- updateForecasts --

function updateForecasts () {
	//sleep (300);
	//print ("updateForecasts ()");
	
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

		if (showToolTips == "1") {
			forecastImage[i][1].tooltip = dayText;
			if (i != 0) {
				forecastImage[i][1].tooltip += "\nDay: " + hiTemp + "°"+unitTemp + "\nNight: " + lowTemp + "°"+unitTemp;
			}
		} else {
			forecastImage[i][1].tooltip = "";
		}
		
	}
	
}

//-------------------------------------------------
// -- getWeatherIcon --

function getWeatherIcon (fetchedConditions) {
	//sleep (300);
	//print ("getWeatherIcon ("+fetchedConditions+")");
	//return "grid";
	
	switch (fetchedConditions){

		case "-":  // Unknown Weather
			return "unknown";
			
		case "0": // 
		case "3": // 
		case "4": // Thunder
		case "17": // 
		case "35": // Thunder Storms
		case "47": // Night Thunder Storm
			return "thunderstorms";
			
		case "1": // 
		case "2":  // Windy Showers
			return "windyshowers";
			
		case "5": // 
		case "7":  // Icy Snowy Rain
			return "icysnowyrain";
			
		case "6": // 
		case "18": // Sleet
			return "sleet";

		case "8":  // Icy Drizzle
			return "icydrizzle";
			
		case "9":  // Drizzle
			return "drizzle";
			
		case "10": // Icy Rain
			return "icyrain";
			
		case "11": // 
		case "40": // Showers
			return "showers";
			
		case "12": // Rain
			return "rain";
			
		case "13": // Light Snow Flurries
			return "lightsnowflurries";
			
		case "14": // Med Snow
			return "medsnow";
			
		case "25": // Friged (Very Cold)
			return "fridged";
		
		case "15": // 
		case "43": // Blowing/Windy Snow
			return "windysnow";
			
		case "16": // 
		case "41": // 
		case "42": // Normal Snow
			return "normalsnow";
			
		case "19": // Dust
		case "20": // Fog
		case "21": // Hazy
		case "22": // Smoke
			return "fog";
			
		case "23": // 
		case "24": // Windy
			return "windy";
			
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
			
		case "32": // Clear Day
			return "clearday";
			
		case "33": // Tiny bit of clouds at night
			return "partiallycloudynight";
			
		case "34": // Tiny bit of clouds during the day
			return "partiallycloudyday";
			
		case "36": // Hot
			return "hot";
			
		case "37":
		case "38": // Sunny Thunder Storm
			return "sunnythunderstorm";
			
		case "39": // Sunny Showers
			return "sunnyshowers";
			
		case "44": // Partially Cloudy Day
			// Looks like the default widget state, no change.
			return "partiallycloudyday";
			
		case "45": // Night Rain
			return "nightrain";
			
		case "46": // Night Snow
			
		default: // 
			return "unknown";
	}
}

//-------------------------------------------------
// -- displayTinyIcons --

function displayTinyIcons (fetchedConditions, whichTiny) {
	//sleep (300);
	//print ("displayTinyIcons ("+whichTiny+": " + fetchedConditions+")");
	
	fetchedConditions	= String(fetchedConditions);
	forecastImage[whichTiny][1].src	= "Resources/WeatherIcons/" + getWeatherIcon (fetchedConditions) + ".png";
}