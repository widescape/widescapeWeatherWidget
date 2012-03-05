/*
	
	widescapeWeather Widget

	Version 2.2.1
	
	Interaction

	
	(c) 2011 widescape / Robert Wünsch - info@widescape.net - www.widescape.net
*/

// Initiates the tray movement
function startMoveTray () {
	
	// If the movement is running, return
	if (movementTimer.ticking == true) return;
	
	//log ("startMoveTray ()");
	saveWindowPosition();
	
	// If the large images are used and the tray will be opened
	if (scaleModName == "" && trayState == "closed") {
		
		if (sliding == "horizontal") {
			// Switch the right border to space-less images
			backgroundToTray.src	= "Resources/BackgroundRightOpen.png";
			borderToTray.src		= "Resources/BorderRightOpen.png";
		}
		else {
			// Switch the bottom border to space-less images
			backgroundToTray.src	= "Resources/BackgroundBottomVerticalOpen.png";
			borderToTray.src		= "Resources/BorderBottomVerticalOpen.png";
		}
	}
	
	// Hide the tray button
	trayButton.opacity	= 0;
	
	// Trigger the movement direction
	moveTrayTrigger	= trayState == "open" ? 1 : 0;
	
	// Reset the counter
	movementCounter		= 0;
	// Adjust the duration
	movementDuration		= system.event.modifiers  == "shift" ? movementDurationSlow : movementDurationFast;
	// Start the movement
	movementTimer.ticking	= true;
}

// Animates the movement of the opening and closing of the tray
function moveTray () {
	//log ("moveTray ()");
	
	// Calculate the position of the current movement
	var movementRatio	= (Math.cos (Math.PI * (moveTrayTrigger + movementCounter / movementDuration)) + 1) / 2;
	
	// Calculate the width of the visible part of the tray
	// --- Sliding horizontally ---
	if (sliding == "horizontal") {
		
		var openPart = Math.ceil (metrics.tray["width" + scaleModName] * movementRatio);
		tray.scrollX = Math.floor (-openPart * widgetScale);
		
		// If the tray opens to the left
		if (preferences.trayOpens.value == "left") {
			
			// Adjust the tray and move it sideways as far as it is open
			placeBasicObjects (openPart, true);
		}
		// Else
		// If the tray opens to the right
		else if (preferences.trayOpens.value == "right") {
			
			placeBasicObjects (0, true);
		}
		
		// Fade the icons
		var thisOpacityMod = 1;
		for (obj = 0; obj < 4; obj++) {
			
			 // Fade icons when they reach or leave the hideout
			thisOpacityMod	= (forecastImage[obj][1].hOffset + forecastImage[obj][1].width + tray.scrollX) / forecastImage[obj][1].width;
			thisOpacityMod	= Math.min (Math.max (thisOpacityMod, 0), 1);
			
			forecastText[obj][0].opacity	= thisOpacityMod * preferences.textOpacity.value;
			forecastImage[obj][0].opacity	= thisOpacityMod * preferences.textOpacity.value;
			forecastImage[obj][1].opacity	= thisOpacityMod * 255;
		}
		
	}
	// --- Sliding vertically ---
	else {
		
		var openPart = Math.ceil (metrics.trayVertical["height" + scaleModName] * movementRatio);
		tray.scrollY = Math.floor (-openPart * widgetScale);
		
		// If the tray opens to the left
		if (preferences.trayOpens.value == "up") {
			
			// Adjust the tray and move it sideways as far as it is open
			placeBasicObjects (openPart, true);
		}
		// Else
		// If the tray opens to the right
		else if (preferences.trayOpens.value == "down") {
			
			placeBasicObjects (0, true);
		}
		
		// Fade the icons
		var thisOpacityMod = 1;
		for (obj = 0; obj < 4; obj++) {
			
			 // Fade icons when they reach or leave the hideout
			thisOpacityMod	= (forecastImage[obj][1].vOffset + forecastImage[obj][1].height + tray.scrollY) / forecastImage[obj][1].height * 255;
			thisOpacityMod	= Math.min (Math.max (thisOpacityMod, 0), 255);
			
			forecastText[obj][0].opacity	= thisOpacityMod * preferences.textOpacity.value;
			forecastImage[obj][0].opacity	= thisOpacityMod * preferences.textOpacity.value;
			forecastImage[obj][1].opacity	= thisOpacityMod * 255;
		}
		
	}
	
	// Update the scene
	updateNow ();
	
	// Increase the movement counter until the movement duration is reached
	if (movementCounter < movementDuration) movementCounter++;
	// Then stop the movement
	else stopMoveTray ();
	
}

// Quits the tray movement
function stopMoveTray () {
	//log ("stopMoveTray ()");
	
	// Stop the movement
	movementTimer.ticking	= false;
	
	// Save the new tray state
	preferences.trayState.value	= preferences.trayState.value == "open" ? "closed" : "open";
	trayState				= preferences.trayState.value;
	
	// If the tray is open now
	if (trayState == "open") {
		
		// Show the forecast icons and texts
		//displayForecast (true);
		
		// Update the icons and info
		updateWeather();
	}
	else {
		// Hide the forecast icons and texts
		//displayForecast (false);
	}
	
	// If the large images are used
	if (scaleModName == "") {
		
		// If the tray is closed now
		if (trayState == "closed") {
			
			if (sliding == "horizontal") {
				// Switch the right border to normal images
				backgroundToTray.src	= "Resources/BackgroundRight.png";
				borderToTray.src		= "Resources/BorderRight.png";
			}
			else {
				// Switch the bottom border to normal images
				backgroundToTray.src	= "Resources/BackgroundBottomVertical.png";
				borderToTray.src		= "Resources/BorderBottomVertical.png";
			}
		}
	}
	
	// Display the tray button
	displayTrayButton ();
	
	adjustWindowPosition();
}

// Displays the tray button according to the trayState
function displayTrayButton (startup) {
	//log ("displayTrayButton ()");
	
	// Load the image
	trayButton.src	= "Resources/trayButton-" + preferences.trayState.value + ".png";
	
	// Reload the button
	trayButton.reload ();
	
	if (startup == true) return;
	
	// Show the tray button
	fadeButtonsStart ();
}

//	Turns the forecast images and texts on or off.
function displayForecast (switchTo) {
	//log ("displayForecast ()");
	
	if (switchTo == true) {
		for (obj = 0; obj < 4; obj++) {
			forecastText[obj][0].color	= preferences.textColor.value;
			forecastText[obj][0].opacity	= preferences.textOpacity.value;
			forecastImage[obj][0].colorize= preferences.textColor.value;
			forecastImage[obj][0].opacity = preferences.textOpacity.value;
			forecastImage[obj][1].colorize= preferences.iconColor.value;
			forecastImage[obj][1].opacity = 255;
		}
	}
	else {
		for (obj = 0; obj < 4; obj++) {
			forecastText[obj][0].opacity	= 0;
			forecastImage[obj][0].opacity = 0;
			forecastImage[obj][1].opacity = 0;
		}
	}
}

// Called before preferences will be changed
function willChangePreferences () {
	//log ("onWillChangePreferences ()");
	
	selectedTheme		= preferences.theme.value;
	oldUserLocation	= preferences.userLocation.value;
	oldCityName			= preferences.cityName.value;
	
	widget.onPreferencesCancelled = preferencesCancelled;
	
	saveWindowPosition();
}

// Called when preferences were changed
function preferencesChanged () {
	log ("onPreferencesChanged ()");
	
	// Apply changed preferences
	applyPreferences (false, oldTrayOpens);
	
	updateNow();
	
	// Choose the city to update the weather accordingly
	if (!isLocationValid(preferences.userLocation.value) || preferences.userLocation.value != oldUserLocation) {
		chooseLocation(isLocationValid(preferences.userLocation.value));
	}
	else if (preferences.firstUse.value == 'true') {
		preferences.firstUse.value = 'false';
		log("Call update() after preferences.firstUse within preferencesChanged");
		update();
	}
	else {
		// Update the scale and design
		updateWeather();
	}
	
	// Remember current setting of trayOpens
	oldTrayOpens	= preferences.trayOpens.value;
}

// Called when preferences were cancelled
function preferencesCancelled () {
	log ("preferencesCancelled ()");
	updateNow();
	
	// Choose the city to update the weather accordingly
	if (!isLocationValid(preferences.userLocation.value)) {
		chooseLocation(true);
	}
	else {
		if (preferences.firstUse.value == 'true') {
			preferences.firstUse.value = 'false';
			log("Call update() after preferences.firstUse within preferencesCancelled");
			update();
		}
	}
}

// Called when the widget gains the user's focus
function gainFocus () {
	//log ("gainFocus ()");
	
	// Register the focus
	widgetFocused	= true;
	
	// Show the tray button
	fadeButtonsStart ();
}

// Called when the widget loses the user's focus
function loseFocus () {
	//log ("loseFocus ()");
	
	// Register the lost focus
	widgetFocused	= false;
	
	// Hide the tray button
	fadeButtonsStart ();
}

// Fades the buttons
function fadeButtons () {
	//log ("fadeButtons ()");
	
	trayButton.opacity	= fadeFrom + fadeCounter / fadeDuration * fadeDiff;
	
	// Increase the fade counter until the fade duration is reached
	if (fadeCounter < fadeDuration) fadeCounter++;
	// Then stop and reset the fading
	else {
		fadeCounter		= 0;
		fadeTimer.ticking	= false;
	}
	
}

// Initiates the fading of the buttons
function fadeButtonsStart () {
	//log ("fadeButtonsStart ()");

	fadeCounter		= 0;
	fadeFrom		= trayButton.opacity;
	fadeTo		= widgetFocused ? 255 : 0;
	fadeDiff		= fadeTo - fadeFrom;
	fadeTimer.ticking	= true;
}

function setContextMenuItems() {
	var items	= new Array();
	
	item		= new MenuItem();
	item.title		= "Update weather now";
	item.enabled	= true;
	item.onSelect	= onClickReload;
	items.push(item);
	
	item		= new MenuItem();
	item.title		= "Display forecast tray";
	item.enabled	= true;
	item.checked	= preferences.trayState.value == "open";
	item.onSelect	= startMoveTray;
	items.push(item);
	
	item		= new MenuItem();
	item.title		= "-";
	item.enabled	= false;
	items.push(item);
	
	item		= new MenuItem();
	item.title		= "Weather data by wunderground.com...";
	item.enabled	= true;
	item.onSelect	= function() { openURL("http://www.wunderground.com/"); };
	items.push(item);
	
	item		= new MenuItem();
	item.title		= "Visit developer's website...";
	item.enabled	= true;
	item.onSelect	= function() { openURL("http://www.widescape.net/widgets/?ref=weather-2.2.1-menu"); };
	items.push(item);
	
	item		= new MenuItem();
	item.title		= "Check for widget updates...";
	item.enabled	= true;
	item.onSelect	= function() { checkVersion(true); };
	items.push(item);
	
	mainWindow.contextMenuItems	= items;
}

function onClickWeather() {
	if (weatherLink == null || weatherLink == '') return false;
	openURL(weatherLink);
}

function onClickForecast() {
	if (forecastLink == null || forecastLink == '') return false;
	openURL(forecastLink);
}

function onClickReload() {
	log("onClickReload()");
	weather.src		= "Resources/WeatherIcons/waiting.png";
	weather.onClick = null;
	updateNow();
	sleep(150);
	log("Call update() within onClickReload");
	update();
}