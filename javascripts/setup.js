/*
	
	widescapeWeather widget
	
	Setup

	2.1.16

	
	(c) 2007 widescape / Robert Wünsch - info@widescape.net - www.widescape.net
	The Weather Widget: (c) 2003 - 2004 Pixoria
*/

//-------------------------------------------------
// -- init --
// Create and initialize the basics

function init () {
	//sleep (300);
	//print ("init ()");
	
	var dayPlaceHolders = ["Tonight", "Wednesday", "Thursday", "Friday"];
	
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
	movementTimer.onTimerFired	= "moveTray ();";
	
	// Create the fade timer
	fadeTimer	= new Timer ();
	fadeTimer.interval	= fadeInterval;
	fadeTimer.ticking		= false;
	fadeTimer.onTimerFired	= "fadeButtons ();";
	
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
	update ();
}

//-------------------------------------------------
// -- applyPreferences --
// Modify the basic values with the given preferences

function applyPreferences (startUp, oldTrayOpens) {
	//sleep (300);
	//print ("applyPreferences ()");
	
	// Hide the main window so that the strange repositioning effect is not visible
	// (Occurs when switching trayOpens from right to left or vice-versa with closed trayState)
	var reposition = false;
	if (oldTrayOpens != false && oldTrayOpens != preferences.trayOpens.value) {
		reposition			= true;
	}
	if (startUp == false && oldTrayOpens != preferences.trayOpens.value) {
		//mainWindow.visible	= false; // DEBUGGING
		reposition			= true;
	}
	
	// Set the colors and opacities to a requested theme
	if (preferences.theme.value != "custom") {
		preferences.iconColor.value		= themes[preferences.theme.value].iconColor;
		preferences.textColor.value		= themes[preferences.theme.value].textColor;
		preferences.textOpacity.value		= themes[preferences.theme.value].textOpacity;
		preferences.backgroundColor.value	= themes[preferences.theme.value].backgroundColor;
		preferences.backgroundOpacity.value	= themes[preferences.theme.value].backgroundOpacity;
		preferences.borderColor.value		= themes[preferences.theme.value].borderColor;
		preferences.borderOpacity.value	= themes[preferences.theme.value].borderOpacity;
	}
	
	sliding = (preferences.trayOpens.value == "up" || preferences.trayOpens.value == "down") ? "vertical" : "horizontal";
	
	// Calculate widget scale
	widgetScale	= 1 + Math.round (preferences.widgetSize.value) / 12;
	//print ("widgetScale = " + widgetScale);
	
	// Scale the widget
	scaleWidget (reposition, oldTrayOpens);
	
	// Design the widget
	designWidget ();
	
	// Display the tray button
	displayTrayButton (startUp);
	
	// Show the widget again
	if (startUp == false) mainWindow.visible	= true;
	
}

//-------------------------------------------------
// -- update --
// Initiate the updating of the weather

function update ( forceWeatherUpdate ) {
	//sleep (300);
	//print ("update ()");
	
	updateTime ();
	adjustWindowPosition();
	
	// Only update the weather if it's time for it or if it is forced
	if (updateCount++ % preferences.updateTime.value != 0 && forceWeatherUpdate != true) return;
	updateCount = 1; // Reset the update count
	
	//print ("update () executed");
	
	fetchData ("full");
	updateWeather ();
	checkVersion();
}