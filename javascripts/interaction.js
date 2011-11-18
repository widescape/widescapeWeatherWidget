/*
	
	widescapeWeather widget
	
	Interaction

	2.1.16

	
	(c) 2007 widescape / Robert Wünsch - info@widescape.net - www.widescape.net
	The Weather Widget: (c) 2003 - 2004 Pixoria
*/

//-------------------------------------------------
// -- startMoveTray --
// Initiates the tray movement

function startMoveTray () {
	
	// If the movement is running, return
	if (movementTimer.ticking == true) return;
	
	//sleep (300);
	//print ("startMoveTray ()");
	
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

//-------------------------------------------------
// -- moveTray --
// Animates the movement of the opening and closing of the tray

function moveTray () {
	//print ("moveTray ()");
	
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

//-------------------------------------------------
// -- stopMoveTray --
// Quits the tray movement

function stopMoveTray () {
	//sleep (300);
	//print ("stopMoveTray ()");
	
	// Stop the movement
	movementTimer.ticking	= false;
	
	// Save the new tray state
	preferences.trayState.value	= preferences.trayState.value == "open" ? "closed" : "open";
	trayState				= preferences.trayState.value;
	
	// If the tray is open now
	if (trayState == "open") {
		
		// Show the forecast icons and texts
		//displayForecast (true);
		
		// Update the forecast
		updateForecasts ();
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

//-------------------------------------------------
// -- displayTrayButton --
// Displays the tray button according to the trayState

function displayTrayButton (startup) {
	//sleep (300);
	//print ("displayTrayButton ()");
	
	// Load the image
	trayButton.src	= "Resources/trayButton-" + preferences.trayState.value + ".png";
	
	// Reload the button
	trayButton.reload ();
	
	if (startup == true) return;
	
	// Show the tray button
	fadeButtonsStart ();
}

//-------------------------------------------------
// -- displayForecast --
/*	Turns the forecast images and texts on or off. */
function displayForecast (switchTo) {
	//sleep (300);
	//print ("displayForecast ()");
	
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

//-------------------------------------------------
// -- onWillChangePreferences --
// Called before preferences will be changed

function onWillChangePreferences () {
	//sleep (300);
	//print ("onWillChangePreferences ()");
	
	oldUserCity		= preferences.userDisplayPref.value;
	oldMainWindowX	= Number(mainWindow.hOffset);
	oldMainWindowY	= Number(mainWindow.vOffset);
	oldBaseAddition	= Number(metrics.baseAddition);
	basePositionX	= Number(mainWindow.hOffset) + Number(metrics.baseAddition);
	basePositionY	= Number(mainWindow.vOffset);
	
}

//-------------------------------------------------
// -- onPreferencesChanged --
// Called when preferences were changed

function onPreferencesChanged () {
	//sleep (300);
	//print ("onPreferencesChanged ()");
	
	// Apply changed preferences
	applyPreferences (false, oldTrayOpens);
	
	// Choose the city to update the weather accordingly
	chooseCity ();
	
	// Remember current setting of trayOpens
	oldTrayOpens	= preferences.trayOpens.value;
	
}

//-------------------------------------------------
// -- onGainFocus --
// Fired when the widget gains the user's focus
	
function onGainFocus () {
	//sleep (300);
	//print ("onGainFocus ()");
	
	// Register the focus
	widgetFocused	= true;
	
	// Show the tray button
	fadeButtonsStart ();
}

//-------------------------------------------------
// -- onGainFocus --
// Fired when the widget loses the user's focus
	
function onLoseFocus () {
	//sleep (300);
	//print ("onLoseFocus ()");
	
	// Register the lost focus
	widgetFocused	= false;
	
	// Hide the tray button
	fadeButtonsStart ();
}

//-------------------------------------------------
// -- fadeButtons --
// Fades the buttons
	
function fadeButtons () {
	//sleep (300);
	//print ("fadeButtons ()");
	
	trayButton.opacity	= fadeFrom + fadeCounter / fadeDuration * fadeDiff;
	
	// Increase the fade counter until the fade duration is reached
	if (fadeCounter < fadeDuration) fadeCounter++;
	// Then stop and reset the fading
	else {
		fadeCounter		= 0;
		fadeTimer.ticking	= false;
	}
	
}

//-------------------------------------------------
// -- fadeButtonsStart --
// Initiate the fading of the buttons
	
function fadeButtonsStart () {
	//sleep (300);
	//print ("fadeButtonsStart ()");

	fadeCounter		= 0;
	fadeFrom		= trayButton.opacity;
	fadeTo		= widgetFocused ? 255 : 0;
	fadeDiff		= fadeTo - fadeFrom;
	fadeTimer.ticking	= true;
}