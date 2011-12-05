/*
	
	widescapeWeather Widget

	Version 2.1.19
	
	Design

	
	(c) 2011 widescape / Robert Wünsch - info@widescape.net - www.widescape.net
	The Weather Widget: (c) 2003 - 2004 Pixoria
*/

function scaleWidget (reposition, oldTrayOpens) {
	//log ("scaleWidget ()");
	
	var insideBaseAddition	= 0;
	var trayInnerHOffset	= -1;
	var trayInnerVOffset	= -1;
	var baseWidthMod		= 0;
	var baseHeightMod		= 0;
	var infoMod			= 0;
	var infoPadding		= 0;
	var infoCount		= 0;
	var infoSizeMod		= 0;
	var newShowInfo		= preferences.showCity.value + "" + preferences.showDate.value + "" + preferences.showTime.value;
	metrics.baseAddition	= 0;
	metrics.baseAdditionLeft= 0;
	
	// Assign the city name
	theCity.data = preferences.displayNameEnabled.value == 0 ? preferences.cityName.value : preferences.displayName.value;
	
	// Store this value as a preset for the next init()
	//preferences.cityName.value = theCity.data;
	
	if (widgetScale < scaleSwitch) {
		scaleModName	= "Small";
		baseWidthMod	= 0;
		baseHeightMod	= 0;
	}
	else {
		scaleModName	= "";
		baseWidthMod	= -.5;
		baseHeightMod	= -.5;
	}
	
	if (preferences.showCity.value == 1 || preferences.showDate.value == 1 || preferences.showTime.value == 1) {
		
		var theCityWidth = 0;
		var theDateWidth = 0;
		var theTimeWidth = 0;
		
		if (preferences.showCity.value == 1) {
			theCity.size	= metrics.info[infoCount].Size * widgetScale;
			
			updateNow();
			
			theCityWidth	= theCity.width;
			infoCount++;
		}
		if (preferences.showDate.value == 1) {
			if (infoCount > 0) {
				infoSizeMod = 5;
				theDate.style = "";
			}
			else theDate.style = "bold";
			theDate.size	= (metrics.info[infoCount].Size - infoSizeMod) * widgetScale + infoSizeMod;
			theDateWidth	= metrics.dateFormatWidthFactor[ preferences.dateFormat.value ] * theDate.size;
			infoCount++;
		}
		if (preferences.showTime.value == 1) {
			if (infoCount > 0) {
				infoSizeMod = 5;
				theTime.style = "";
			}
			else theTime.style = "bold";
			theTime.size	= (metrics.info[infoCount].Size - infoSizeMod) * widgetScale + infoSizeMod;
			theTimeWidth	= metrics.timeFormatWidthFactor[ (preferences.showSeconds.value == 1 ? 's': 'm') + Number(preferences.use24hours.value) ] * theTime.size;
		}
		
		if (preferences.showInfo.value == "inside") {
			infoPadding = 6 * widgetScale - 4;
		}
		else {
			infoPadding = 4 * widgetScale - 2;
		}
		
		// Get the maximum width
		metrics.baseAddition		= Math.max (theCityWidth, Math.max (theDateWidth, theTimeWidth)) + infoPadding;
		metrics.baseAdditionLeft	= metrics.baseAddition;
		
		// Reset the date and time
		updateTime();
		
		if (preferences.showInfo.value == "inside") {
			metrics.baseAdditionLeft	= 0;
			insideBaseAddition		= metrics.baseAddition;
			infoMod				= infoPadding + 2;
		}
	}
	
	// --- Sliding horizontally ---
	if (sliding == "horizontal") {
		
		backgroundToInfo.src	= "Resources/BackgroundLeft" + scaleModName + ".png";
		background.src		= "Resources/Background" + scaleModName + ".png";
		backgroundToTray.src	= "Resources/BackgroundRight" + scaleModName + ".png";
		backgroundTray.src	= "Resources/BackgroundTray" + scaleModName + ".png";
		
		borderToInfo.src		= "Resources/BorderLeft" + scaleModName + ".png";
		border.src			= "Resources/Border" + scaleModName + ".png";
		borderToTray.src		= "Resources/BorderRight" + scaleModName + ".png";
		borderTray.src		= "Resources/BorderTray" + scaleModName + ".png";
		
		if (trayState == "open" && scaleModName == "") {
			backgroundToTray.src	= "Resources/BackgroundRightOpen.png";
			borderToTray.src		= "Resources/BorderRightOpen.png";
		}
		
		baseBackground.width	= Math.ceil (metrics.baseAddition + metrics.window.widthExpanded * widgetScale);
		baseBackground.height	= Math.ceil (metrics.window.height * widgetScale);
		
		windowArea.width		= metrics.outerMargin * 2 + baseBackground.width;
		windowArea.height		= metrics.outerMargin * 2 + baseBackground.height;
		
		mainWindow.width 		= windowArea.width;
		mainWindow.height		= windowArea.height;
		
		backgroundToInfo.width	= borderToInfo.width	= Math.ceil (metrics.left.width * widgetScale);
		background.width		= border.width		= Math.ceil (metrics.middle.width * widgetScale + insideBaseAddition);
		backgroundToTray.width	= borderToTray.width	= Math.ceil (metrics.right.width * widgetScale);
		backgroundTray.width	= borderTray.width	= Math.ceil (metrics.tray["width" + scaleModName] * widgetScale);
		
		backgroundToInfo.height	= borderToInfo.height	= Math.ceil (metrics.window.height * widgetScale);
		background.height		= border.height		= backgroundToInfo.height;
		backgroundToTray.height	= borderToTray.height	= backgroundToInfo.height;
		backgroundTray.height	= borderTray.height	= backgroundToInfo.height;
		
		backgroundToInfo.hOffset= borderToInfo.hOffset	= 0;
		background.hOffset	= border.hOffset		= backgroundToInfo.hOffset + backgroundToInfo.width;
		backgroundToTray.hOffset= borderToTray.hOffset	= background.hOffset + background.width;
		
		backgroundToInfo.vOffset= borderToInfo.vOffset	= 0;
		background.vOffset	= border.vOffset		= 0;
		backgroundToTray.vOffset= borderToTray.vOffset	= 0;
		
		var forecastWidth	= 0;
		
		for (obj = 0; obj < 4; obj++) {
			
			forecastWidth = ((metrics.base.width + trayInnerHOffset) * obj + trayInnerHOffset) + (obj + 1) * baseWidthMod;
			
			forecastText[obj][0].hOffset	= (metrics.forecast.tmp.hOffset + forecastWidth) * widgetScale;
			forecastImage[obj][0].hOffset	= (metrics.forecast.day.hOffset + forecastWidth) * widgetScale;
			forecastImage[obj][1].hOffset	= (metrics.forecast.img.hOffset + forecastWidth) * widgetScale;
			
			forecastText[obj][0].vOffset	= metrics.forecast.tmp.vOffset * widgetScale;
			forecastImage[obj][0].vOffset	= metrics.forecast.day.vOffset * widgetScale;
			forecastImage[obj][1].vOffset	= metrics.forecast.img.vOffset * widgetScale;
		}
		
		base.width	= backgroundToTray.hOffset + backgroundToTray.width;
		base.height	= Math.ceil (metrics.base.height * widgetScale);
		
	}
	// --- Sliding vertically ---
	else {
		
		backgroundToInfo.src	= "Resources/Empty.png";
		background.src		= "Resources/BackgroundVertical" + scaleModName + ".png";
		backgroundToTray.src	= "Resources/BackgroundBottomVertical" + scaleModName + ".png";
		backgroundTray.src	= "Resources/BackgroundTrayVertical" + scaleModName + ".png";
		
		borderToInfo.src		= "Resources/Empty.png";
		border.src			= "Resources/BorderVertical" + scaleModName + ".png";
		borderToTray.src		= "Resources/BorderBottomVertical" + scaleModName + ".png";
		borderTray.src		= "Resources/BorderTrayVertical" + scaleModName + ".png";
		
		if (trayState == "open" && scaleModName == "") {
			backgroundToTray.src	= "Resources/BackgroundBottomVerticalOpen.png";
			borderToTray.src		= "Resources/BorderBottomVerticalOpen.png";
		}
		
		baseBackground.width	= Math.ceil (metrics.window.width * widgetScale);
		baseBackground.height	= Math.ceil (metrics.window.heightExpanded * widgetScale);
		
		windowArea.width		= metrics.outerMargin * 2 + baseBackground.width + metrics.baseAddition;
		windowArea.height		= metrics.outerMargin * 2 + baseBackground.height;
		
		mainWindow.width 		= windowArea.width;
		mainWindow.height		= windowArea.height;
		
		backgroundToInfo.width	= borderToInfo.width	= 0;
		background.width		= border.width		= Math.ceil (metrics.top.width * widgetScale);
		backgroundToTray.width	= borderToTray.width	= Math.ceil (metrics.bottom.width * widgetScale);
		backgroundTray.width	= borderTray.width	= Math.ceil (metrics.trayVertical.width * widgetScale);
		
		backgroundToInfo.height	= borderToInfo.height	= 0;
		background.height		= border.height		= Math.ceil (metrics.top.height * widgetScale);
		backgroundToTray.height	= borderToTray.height	= Math.ceil (metrics.bottom.height * widgetScale);
		backgroundTray.height	= borderTray.height	= Math.ceil (metrics.trayVertical["height" + scaleModName] * widgetScale);
		
		backgroundToInfo.hOffset= borderToInfo.hOffset	= 0;
		background.hOffset	= border.hOffset		= 0;
		backgroundToTray.hOffset= borderToTray.hOffset	= 0;
		
		backgroundToInfo.vOffset= borderToInfo.vOffset	= 0;
		background.vOffset	= border.vOffset		= 0;
		backgroundToTray.vOffset= borderToTray.vOffset	= background.vOffset + background.height;
		
		var forecastHeight	= 0;
		
		for (obj = 0; obj < 4; obj++) {
			
			forecastHeight = ((metrics.base.height + trayInnerVOffset) * obj + trayInnerVOffset) + (obj + 1) * baseHeightMod;
			
			forecastText[obj][0].hOffset	= metrics.forecast.tmp.hOffset * widgetScale;
			forecastImage[obj][0].hOffset	= metrics.forecast.day.hOffset * widgetScale;
			forecastImage[obj][1].hOffset	= metrics.forecast.img.hOffset * widgetScale;
			
			forecastText[obj][0].vOffset	= (metrics.forecast.tmp.vOffset + forecastHeight) * widgetScale;
			forecastImage[obj][0].vOffset	= (metrics.forecast.day.vOffset + forecastHeight) * widgetScale;
			forecastImage[obj][1].vOffset	= (metrics.forecast.img.vOffset + forecastHeight) * widgetScale;
			
		}
		
		base.width	= Math.ceil (metrics.base.width * widgetScale);
		base.height	= Math.ceil (metrics.base.height * widgetScale);
		
	}
	
	for (obj = 0; obj < 4; obj++) {
		
		forecastText[obj][0].size	= (metrics.temp.size - 4) * widgetScale + 3;
		
		forecastImage[obj][0].width	= metrics.forecast.day.width * widgetScale;
		forecastImage[obj][1].width	= metrics.forecast.img.width * widgetScale;
		
		forecastImage[obj][0].height	= metrics.forecast.day.height * widgetScale;
		forecastImage[obj][1].height	= metrics.forecast.img.height * widgetScale;
	}
	
	weather.hOffset		= metrics.weather.hOffset * widgetScale + insideBaseAddition;
	weather.width		= metrics.weather.width * widgetScale;
	weather.height		= metrics.weather.height * widgetScale;
	
	trayButton.hOffset	= metrics.trayButton.hOffset * widgetScale + insideBaseAddition;
	trayButton.vOffset	= metrics.trayButton.vOffset * widgetScale;
	trayButton.width		= metrics.trayButton.width * widgetScale;
	trayButton.height		= metrics.trayButton.height * widgetScale;
	
	theTemp.size		= metrics.temp.size * widgetScale;
	theTemp.hOffset		= metrics.temp.hOffset * widgetScale + insideBaseAddition;
	theTemp.vOffset		= metrics.temp.vOffset * widgetScale;
	
	theCity.hOffset		= infoMod + metrics.baseAddition - infoPadding;
	theDate.hOffset		= theCity.hOffset;
	theTime.hOffset		= theCity.hOffset;
	
	infoCount		= 0;
	var infoHeightMod		= 0;
	var infoHeightAdjust	= 0;
	if (preferences.showCity.value == 1) {
		infoCount++;
	}
	else {
		theCity.data		= "";
	}
	theCity.vOffset		= theTemp.vOffset;
	if (preferences.showDate.value == 1) {
		if (infoCount == 0) {
			theDate.vOffset	= theTemp.vOffset;
		}
		else if (infoCount > 0) {
			infoHeightMod = 5;
			infoHeightAdjust = 2;
			theDate.vOffset	= theCity.vOffset + (metrics.info[infoCount].Height - infoHeightMod) * widgetScale + infoHeightMod - infoHeightAdjust;
		}
		infoCount++;
	}
	else {
		theDate.data		= "";
		theDate.vOffset		= theCity.vOffset;
	}
	if (preferences.showTime.value == 1) {
		if (infoCount == 0) {
			theTime.vOffset	= theTemp.vOffset;
		}
		else if (infoCount > 0) {
			infoHeightMod = 5;
			infoHeightAdjust = 2;
			theTime.vOffset	= theDate.vOffset + (metrics.info[infoCount].Height - infoHeightMod) * widgetScale + infoHeightMod - infoHeightAdjust;
		}
	}
	
	if (system.platform == "windows") {
		theDate.vOffset += 3;
		theTime.vOffset += 6;
	}
	
	// If the tray state is closed, some special adjustments have to be done
	if (trayState == "closed") {
		
		var shiftX = 0;
		var shiftY = 0;
		
		// If the tray opens left
		if (preferences.trayOpens.value == "left") {
			
			// Re-position the main window
			if (reposition == true) {
				shiftX = -1;
				if (oldTrayOpens == "up") shiftY = 1;
			}
			
			// And place the objects
			placeBasicObjects (metrics.tray["width" + scaleModName], false);
		}
		// If the tray opens right
		else if (preferences.trayOpens.value == "right") {
			
			// Re-position the main window
			if (reposition == true) {
				if (oldTrayOpens == "left") shiftX = 1;
				else if (oldTrayOpens == "up") shiftY = 1;
			}
			
			// And place the objects
			placeBasicObjects (0, false);
		}
		// If the tray opens up 
		else if (preferences.trayOpens.value == "up") {
			
			// Re-position the main window
			if (reposition == true) {
				shiftY = -1;
				if (oldTrayOpens == "left") shiftX = 1;
			}
			
			// And place the objects
			placeBasicObjects (metrics.trayVertical["height" + scaleModName], false);
		}
		// If the tray opens down
		else if (preferences.trayOpens.value == "down") {
			
			// Re-position the main window
			if (reposition == true) {
				if (oldTrayOpens == "left") shiftX = 1;
				else if (oldTrayOpens == "up") shiftY = 1;
			}
			
			// And place the objects
			placeBasicObjects (0, false);
		}
		
		if (reposition == true) {
			basePositionX += shiftX * Math.ceil(widgetScale * metrics.tray["width" + scaleModName]);
			basePositionY += shiftY * Math.ceil(widgetScale * metrics.trayVertical["height" + scaleModName]);
		}
	}
	// If the tray state is open
	else {
		
		// Place the objects accordingly
		placeBasicObjects (0, false);
	}
	
	// Save baseAddition for next startup
	preferences.baseAddition.value	= metrics.baseAddition;
	
	// Adjust mainWindow position so that the windows seems to remain in place
	mainWindow.hOffset			= Number(basePositionX) - Number(metrics.baseAddition);
	mainWindow.vOffset			= Number(basePositionY);
	
	saveWindowPosition();
	
	colorWidget();
}

// Places the basic objects that are altered during the tray movement.
function placeBasicObjects (modifier, moving) {
	//log ("placeBasicObjects ()");
	
	if (moving == false) {
		
		if (trayState == "closed") {
			if (sliding == "horizontal") {
				tray.scrollX = -Math.ceil (metrics.tray["width" + scaleModName] * widgetScale);
				tray.scrollY = 0;
			}
			else {
				tray.scrollX = 0;
				tray.scrollY = -Math.ceil (metrics.trayVertical["height" + scaleModName] * widgetScale);
			}
		}
	}
	
	if (sliding == "horizontal") {
		
		info.hOffset		= metrics.outerMargin + Math.ceil (modifier * widgetScale);
		base.hOffset		= info.hOffset + metrics.baseAdditionLeft;
		
		info.vOffset		= metrics.outerMargin;
		base.vOffset		= metrics.outerMargin;
		
		tray.hOffset		= base.hOffset + base.width;
		tray.vOffset		= base.vOffset;
		
		baseBackground.hOffset	= metrics.baseAdditionLeft + info.hOffset;
		baseBackground.vOffset	= metrics.outerMargin;
		
		baseBackground.width	= base.width + Math.ceil ((metrics.tray["width" + scaleModName]) * widgetScale) + tray.scrollX;
	}
	else {
		
		info.hOffset		= metrics.outerMargin;
		base.hOffset		= info.hOffset + metrics.baseAdditionLeft;
		
		info.vOffset		= metrics.outerMargin + Math.ceil (modifier * widgetScale); 
		base.vOffset		= info.vOffset;
		
		tray.hOffset		= base.hOffset;
		tray.vOffset		= base.vOffset + base.height;
		
		baseBackground.hOffset	= metrics.baseAdditionLeft + info.hOffset;
		baseBackground.vOffset	= base.vOffset;
		
		baseBackground.height	= base.height + Math.ceil ((metrics.trayVertical["height" + scaleModName]) * widgetScale) + tray.scrollY;
	}
	
}

function saveWindowPosition() {
	//log ("saveWindowPosition ()");
	
	// Save base position
	basePositionX	= Number(mainWindow.hOffset) + Number(metrics.baseAddition);
	basePositionY	= Number(mainWindow.vOffset);
	
	// Save window position
	preferences.windowX.value	= Number(mainWindow.hOffset);
	preferences.windowY.value	= Number(mainWindow.vOffset);
	
	savePreferences();
}

// Adjusts the window position if it leaves all computer displays.
function adjustWindowPosition() {
	//log ("adjustWindowPosition ()");
	
	function isOnScreenLeft( display ) {
		if (mainWindow.hOffset + baseBackground.hOffset + baseBackground.width - metrics.grabMargin < display.workRect.x) {
			return false;
		}
		return true;
	}
	function isOnScreenRight( display ) {
		if (mainWindow.hOffset + baseBackground.hOffset + metrics.grabMargin > display.workRect.x + display.workRect.width) {
			return false;
		}
		return true;
	}
	function isOnScreenTop( display ) {
		if (mainWindow.vOffset + baseBackground.vOffset + baseBackground.height - metrics.grabMargin < display.workRect.y) {
			return false;
		}
		return true;
	}
	function isOnScreenBottom( display ) {
		if (mainWindow.vOffset + baseBackground.vOffset + metrics.grabMargin > display.workRect.y + display.workRect.height) {
			return false;
		}		
		return true;
	}
	
	// Check if the widget is on screen
	var displays = getDisplays();
	for (var i = 0; i < displays.length; i++) {
		if (isOnScreenLeft( displays[i] ) && isOnScreenRight( displays[i] ) && isOnScreenTop( displays[i] ) && isOnScreenBottom( displays[i] )) {
			//log( 'widget is on screen' );
			return;
		}
	}
	
	// Bring the widget back to the closest display
	var closestDisplay = mainWindow.getBestDisplay();
	
	if ( !isOnScreenLeft( closestDisplay ) ) {
		//log( 'bringing back from left' );
		mainWindow.hOffset = closestDisplay.workRect.x - info.hOffset;
	}
	else if ( !isOnScreenRight( closestDisplay ) ) {
		//log( 'bringing back from right' );
		mainWindow.hOffset = closestDisplay.workRect.x + closestDisplay.workRect.width - mainWindow.width + metrics.outerMargin;
	}
	if ( !isOnScreenTop( closestDisplay ) ) {
		//log( 'bringing back from top' );
		mainWindow.vOffset = closestDisplay.workRect.y - baseBackground.vOffset;
	}
	else if ( !isOnScreenBottom( closestDisplay ) ) {
		//log( 'bringing back from bottom' );
		mainWindow.vOffset = closestDisplay.workRect.y + closestDisplay.workRect.height - mainWindow.height + metrics.outerMargin;
	}
		
	saveWindowPosition();
}

// Colors the widget
function colorWidget () {
	//log ("colorWidget ()");
	
	mainWindow.opacity	= 255;
	
	theTemp.color		= preferences.textColor.value;
	theTemp.opacity		= preferences.textOpacity.value;
	
	weather.colorize		= preferences.iconColor.value;
	weather.opacity		= preferences.iconOpacity.value;
	
	theCity.color		= theDate.color		= theTime.color		= preferences.textColor.value;
	theCity.opacity		= theDate.opacity		= theTime.opacity		= preferences.textOpacity.value;
	
	background.colorize	= backgroundToInfo.colorize	= backgroundToTray.colorize	= backgroundTray.colorize	= preferences.backgroundColor.value;
	border.colorize		= borderToInfo.colorize		= borderToTray.colorize		= borderTray.colorize		= preferences.borderColor.value;
	
	background.opacity	= backgroundToInfo.opacity	= backgroundToTray.opacity	= preferences.backgroundOpacity.value;
	border.opacity		= borderToInfo.opacity		= borderToTray.opacity		= preferences.borderOpacity.value;
	
	trayButton.colorize	= preferences.iconColor.value;
	
	backgroundTray.opacity	= background.opacity;
	borderTray.opacity	= border.opacity;
	
	for (obj = 0; obj < 4; obj++) {
		
		forecastText[obj][0].opacity	= preferences.textOpacity.value;
		forecastImage[obj][0].opacity	= preferences.textOpacity.value;
		forecastImage[obj][1].opacity	= preferences.iconOpacity.value;
		
		forecastText[obj][0].color	= preferences.textColor.value;
		forecastImage[obj][0].colorize= preferences.textColor.value;
		forecastImage[obj][1].colorize= preferences.iconColor.value;
	}
}