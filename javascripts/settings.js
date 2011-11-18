/*
	
	widescapeWeather widget
	
	Settings

	2.1.16

	
	(c) 2007 widescape / Robert Wünsch - info@widescape.net - www.widescape.net
	The Weather Widget: (c) 2003 - 2004 Pixoria
*/

var widgetName		= "widescapeWeather";

var widgetFocused		= true;	// Whether or not the widget has the user's focus - true when starting
var widgetStartUp 	= true;	// True when the widget starts

var movementInterval	= 0.02;	// Interval for the movement timer
var movementCounter	= 0;		// Counter for the tray movement
var movementDurationFast= 20;		// Duration for the fast tray movement
var movementDurationSlow= 90;		// Duration for the slow tray movement
var movementDuration	= movementDurationFast; // Fast is default

var fadeInterval		= 0.02;	// Interval for the button fading
var fadeCounter		= 0;		// Counter for the button fading
var fadeDuration		= 10;		// Duration for the button fading

var scaleSwitch		= 1.51;
var scaleModName		= "Small";
var sliding			= "horizontal";

var urlData			= "";
var url			= new URL();

var widgetScale		= 1 + Math.round (preferences.widgetSize.value) / 12;
var trayState		= preferences.trayState.value;
var showToolTips		= true;
var oldTrayOpens		= preferences.trayOpens.value;
var oldUserCity		= preferences.userDisplayPref.value;
var oldMainWindowX	= Number(mainWindow.hOffset);
var oldMainWindowY	= Number(mainWindow.vOffset);
var oldBaseAddition	= Number(preferences.baseAddition.value);
var basePositionX		= Number(oldMainWindowX) + Number(oldBaseAddition);
var basePositionY		= Number(oldMainWindowY);

var forecastText		= new Array();
var forecastImage		= new Array();

var globalWeather		= "";
var globalForecasts	= "";
var globalLinks		= "";

var updateCount		= 0;

var metrics			= new Object();

metrics.outerMargin	= 20;
metrics.grabMargin	= 10;
metrics.baseAddition	= 0;
metrics.baseAdditionLeft= 0;

metrics.base		= new Object ();
metrics.base.hOffset	= 0;
metrics.base.vOffset	= 0;
metrics.base.width	= 45;
metrics.base.height	= 33;

metrics.window		= new Object ();
metrics.window.hOffset		= 0;
metrics.window.vOffset		= 0;
metrics.window.width		= 45;
metrics.window.widthExpanded	= 222;
metrics.window.height		= 33;
metrics.window.heightExpanded	= 160;

metrics.left		= new Object ();
metrics.left.width	= 1;
metrics.left.height	= 33;

metrics.middle		= new Object ();
metrics.middle.width	= 43;
metrics.middle.height	= 33;

metrics.right		= new Object ();
metrics.right.width	= 1;
metrics.right.height	= 33;

metrics.top			= new Object ();
metrics.top.width		= 45;
metrics.top.height	= 32;

metrics.bottom		= new Object ();
metrics.bottom.width	= 45;
metrics.bottom.height	= 1;

metrics.tray		= new Object ();
metrics.tray.width	= 174;
metrics.tray.widthSmall	= 176;
metrics.tray.height	= 33;

metrics.trayVertical			= new Object ();
metrics.trayVertical.width		= 45;
metrics.trayVertical.height		= 126;
metrics.trayVertical.heightSmall	= 128;

metrics.weather		= new Object ();
metrics.weather.hOffset	= 0;
metrics.weather.vOffset	= 0;
metrics.weather.width	= 45;
metrics.weather.height	= 33;

metrics.trayButton	= new Object ();
metrics.trayButton.hOffset	= 35;
metrics.trayButton.vOffset	= 22;
metrics.trayButton.width	= 9;
metrics.trayButton.height	= 9;

metrics.temp		= new Object ();
metrics.temp.hOffset	= 16;
metrics.temp.vOffset	= 11;
metrics.temp.size		= 10;

metrics.info		= new Array();
metrics.info[0]		= new Object();
metrics.info[0].Size	= 10;
metrics.info[0].Height	= 10;
metrics.info[1]		= new Object();
metrics.info[1].Size	= 9;
metrics.info[1].Height	= 12;
metrics.info[2]		= new Object();
metrics.info[2].Size	= 9;
metrics.info[2].Height	= 11;

metrics.forecast		= new Object();

metrics.forecast.tmp	= new Object();
metrics.forecast.tmp.hOffset	= 14;
metrics.forecast.tmp.vOffset	= 11;

metrics.forecast.day	= new Object();
metrics.forecast.day.width	= 28;
metrics.forecast.day.height	= 8;
metrics.forecast.day.hOffset	= 0;
metrics.forecast.day.vOffset	= 24;

metrics.forecast.img	= new Object();
metrics.forecast.img.width	= 45;
metrics.forecast.img.height	= 33;
metrics.forecast.img.hOffset	= 0;
metrics.forecast.img.vOffset	= 0;

var themes			= new Object();

themes.original		= new Object();
themes.original.iconColor			= "#FFFFFF";
themes.original.textColor			= "#FFFFFF";
themes.original.textOpacity			= 255;
themes.original.backgroundColor		= "#C3160E";
themes.original.backgroundOpacity		= 255;
themes.original.borderColor			= "#FFFFFF";
themes.original.borderOpacity			= 255;

themes.blackandwhite	= new Object();
themes.blackandwhite.iconColor		= "#FFFFFF";
themes.blackandwhite.textColor		= "#FFFFFF";
themes.blackandwhite.textOpacity		= 255;
themes.blackandwhite.backgroundColor	= "#000000";
themes.blackandwhite.backgroundOpacity	= 255;
themes.blackandwhite.borderColor		= "#000000";
themes.blackandwhite.borderOpacity		= 255;

themes.snow			= new Object();
themes.snow.iconColor				= "#FFFFFF";
themes.snow.textColor				= "#FFFFFF";
themes.snow.textOpacity				= 255;
themes.snow.backgroundColor			= "#FFFFFF";
themes.snow.backgroundOpacity			= 40;
themes.snow.borderColor				= "#FFFFFF";
themes.snow.borderOpacity			= 80;

var fetchedTime = new Date();
var localOffsetDate = 0;
var localOffsetHours = 0;
var localOffsetMinutes = 0;

// Switch old time format preference to new
if (preferences.timeFormat.value != 0) {
	preferences.use24hours.value = preferences.timeFormat.value == 24 ? 1 : 0;
	preferences.timeFormat.value = 0;
}