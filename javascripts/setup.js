/*
	
	widescapeWeather Widget

	Version 2.1.19
	
	Setup

	
	(c) 2011 widescape / Robert Wünsch - info@widescape.net - www.widescape.net
	The Weather Widget: (c) 2003 - 2004 Pixoria
*/

// Creates and initializes the basics
function init () {
	//log ("init ()");
	
	var dayPlaceHolders = ["Tonight", "Wed", "Thu", "Fri"];
	
	// Display the last used city name
	theCity.data	= preferences.cityName.value;
	
	// Create the forecast layout
	for ( obj = 0; obj < 4; obj++ ) {
		forecastText[obj] = new Array();
		
		forecastText[obj][0]		= new Text();
		forecastText[obj][0].font		= "Trebuchet MS";
		forecastText[obj][0].color		= preferences.textColor.value;
		forecastText[obj][0].style		= "bold";
		forecastText[obj][0].opacity		= 255;
		forecastText[obj][0].size		= (metrics.temp.size - 4) * widgetScale + 3;
		forecastText[obj][0].alignment	= "center";
		
		forecastText[obj][0].data		= "";
		
		forecastText[obj][0].zOrder	= 80 + obj;
		
		forecastImage[obj] = new Array();
		
		forecastImage[obj][0] = new Image(); // Image for Day Name
		forecastImage[obj][1] = new Image(); // Image for Weather Icon

		forecastImage[obj][0].src = "Resources/Day-" + dayPlaceHolders[obj] + ".png";
		forecastImage[obj][1].src = "Resources/WeatherIcons/waiting.png";

		forecastImage[obj][0].zOrder = obj + 140;
		forecastImage[obj][1].zOrder = obj + 150;
		
		tray.addSubview(forecastText[obj][0]);
		tray.addSubview(forecastImage[obj][0]);
		tray.addSubview(forecastImage[obj][1]);
	}
	
	// Create the tray movement timer
	movementTimer	= new Timer ();
	movementTimer.interval		= movementInterval;
	movementTimer.ticking		= false;
	movementTimer.onTimerFired	= function() { moveTray(); }
	
	// Create the fade timer
	fadeTimer	= new Timer ();
	fadeTimer.interval	= fadeInterval;
	fadeTimer.ticking		= false;
	fadeTimer.onTimerFired	= function() { fadeButtons(); }
	
	// Apply given preferences
	applyPreferences (true, false);
	
	// Display the forecast if necessary
	if (trayState == "open") {
		displayForecast (true);
	}
	else {
		displayForecast (false);
	}
	
	// Make the window visible
	mainWindow.visible	= 1;
	if (info.opacity == 0 && base.opacity == 0 && tray.opacity == 0) {
		info.opacity = 255;
		base.opacity = 255;
		tray.opacity = 255;
	}
	
	// Fetch the data
	// And update the weather
	update();
	
	// Start the update timer
	updateTimer.ticking = true;
}

// Modifies the basic values with the given preferences
function applyPreferences (startUp, oldTrayOpens) {
	//log ("applyPreferences ()");
	
	// Set the update check interval according to the showSeconds setting
	updateTimer.interval = preferences.updateTime.value;
	timeTimer.ticking = preferences.showDate.value == 1 || preferences.showTime.value == 1;
	
	// Set the colors and opacities to a requested theme
	var themeItems = new Array( 'iconColor', 'iconOpacity', 'textColor', 'textOpacity', 'backgroundColor', 'backgroundOpacity', 'borderColor', 'borderOpacity' );
	if (preferences.theme.value != 'custom' && preferences.theme.value != selectedTheme && typeof themes[preferences.theme.value] != 'undefined') {
		for (var i = 0; i < themeItems.length; i++) {
			preferences[themeItems[i]].value = themes[preferences.theme.value][themeItems[i]];
		}
	}
	else if (preferences.theme.value != 'custom') {
		var notTheTheme = false;
		if (typeof themes[preferences.theme.value] != 'undefined') {
			for (var i = 0; i < themeItems.length; i++) {
				if (preferences[themeItems[i]].value != themes[preferences.theme.value][themeItems[i]]) {
					notTheTheme = true;
					break;
				}
			}
		}
		if (notTheTheme) {
			preferences.theme.value = 'custom';
		}
		
	}
	
	// Hide the main window so that the strange repositioning effect is not visible
	// (Occurs when switching trayOpens from right to left or vice-versa with closed trayState)
	var reposition = false;
	if (oldTrayOpens != false && oldTrayOpens != preferences.trayOpens.value) {
		reposition			= true;
	}
	if (startUp == false && oldTrayOpens != preferences.trayOpens.value) {
		reposition			= true;
	}
	
	sliding = (preferences.trayOpens.value == "up" || preferences.trayOpens.value == "down") ? "vertical" : "horizontal";
	
	if (sliding == "vertical" && preferences.showInfo.value != "outside") {
		preferences.showInfo.value = "outside";
		//alert( "The info text (like the location) cannot be displayed outside the box, if the forecast tray slides vertically." );
	}
	
	// Calculate widget scale
	widgetScale	= 1 + Math.round (preferences.widgetSize.value) / 12;
	//log ("widgetScale = " + widgetScale);
	
	// Scale the widget
	scaleWidget(reposition, oldTrayOpens);
	
	// Bring it to the visible area
	adjustWindowPosition();
	
	// Display the tray button
	displayTrayButton(startUp);
	
	// Show the widget again
	if (startUp == false) mainWindow.visible	= true;
	
}

// Initiates the updating of the weather
function update() {
	log("update()");
	saveWindowPosition();
	fetchWeather();
	checkVersion();
}

function updateTime(givenDate) {
	//log ("updateTime ()");
	
	var localTime = new Date();
	
	if (typeof givenDate != "undefined") {
		localTime = givenDate;
	}
	if (preferences.dateAndTimeSource.value == "location") {
		localTime	= new Date( localTime.getTime() + (localLocationTimeOffset * 60 * 1000));
	}
	
	if (preferences.showDate.value == 1) {
		
		// Display date of the location
		theDate.data = formattedDate(localTime);
	}
	else {
		theDate.data = "";
	}
	
	if (preferences.showTime.value == 1) {
		// Display time of the location
		theTime.data = formattedTime(localTime);
	}
	else {
		theTime.data = "";
	}
}