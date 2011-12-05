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

function formattedTime(date) {
	
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
	return hours + ":" + twoDigits(minutes) + (preferences.showSeconds.value == 1 ? ":" + twoDigits(seconds) : "") + suffix;
}

function formattedDateAndTime(date) {
	return formattedDate(date)+" "+formattedTime(date);
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