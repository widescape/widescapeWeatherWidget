/*
	
	widescapeWeather Widget

	Version 2.1.19
	
	Helpers

	
	(c) 2011 widescape / Robert Wünsch - info@widescape.net - www.widescape.net
	The Weather Widget: (c) 2003 - 2004 Pixoria
*/

// Converts a number to a two digit string
function twoDigits(num) {
	if (num < 10) return "0" + num.toString ();
	return num.toString ();
}

function formattedDate(date) {
	
	switch(preferences.dateFormat.value) {
		
		case "D, M d":
			return weekDays[date.getDay()]+", "+months[date.getMonth()]+" "+date.getDate();
		
		case "D, d. M":
			return weekDays[date.getDay()]+", "+date.getDate()+". "+months[date.getMonth()];
		
		case "yyyy-mm-dd":
			return date.getFullYear()+"-"+twoDigits(date.getMonth()+1)+"-"+twoDigits(date.getDate());
		
		case "dd.mm.yyyy":
			return twoDigits(date.getDate())+"."+twoDigits(date.getMonth()+1)+"."+date.getFullYear();
		
		case "m/d/yy":
			return (date.getMonth()+1)+"/"+date.getDate()+"/"+date.getFullYear();
	}
	return "";
}

function formattedTime(date, includeSeconds) {
	
	var hours	= date.getHours ();
	var minutes	= date.getMinutes ();
	var seconds	= date.getSeconds ();
	var suffix	= "";
	if (preferences.use24hours.value == 0) {
		if (hours < 12) {
			if (hours == 0) hours = 12;
			suffix	= " am";
		}
		else {
			if (hours > 12) hours -= 12;
			suffix	= " pm";
		}
	}
	return hours + ":" + twoDigits(minutes) + ((preferences.showSeconds.value == 1 && includeSeconds != false) ? ":" + twoDigits(seconds) : "") + suffix;
}

function formattedDateAndTime(date, includeSeconds) {
	return formattedDate(date)+" "+formattedTime(date, includeSeconds);
}

function milesToKm(miles) {
	return miles * MILES_TO_KM;
}

// Displays an error with icon and tooltip.
function displayError(error,message,clickAction) {
	log("Error: " + error);
	weather.tooltip	= message;
	weather.onClick	= clickAction;
	weather.src		= "Resources/WeatherIcons/error.png";
	weather.reload();
	scaleWidget();
}

// Displays the connection error.
function displayConnectionError(error,url,message) {
	log("Error: " + error);
	if (typeof url != "undefined") log("On URL: "+url);
	if (typeof message == "undefined") {
		message = "There was a problem connecting to Wunderground.com.\n\nPlease check your network connection and click here to reload.\n\nError was: "+error.toString().substring(0,70);
	}
	var clickAction = onClickReload;
	displayError(error,message,clickAction);
}

function onClickReload() {
	log("onClickReload()");
	weather.src		= "Resources/WeatherIcons/waiting.png";
	updateNow();
	sleep(150);
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
		var xml = XMLDOM.parse(result);
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