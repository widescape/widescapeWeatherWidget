/*
	
	widescapeWeather Widget

	Version 2.2.1
	
	Settings

	
	(c) 2011 widescape / Robert Wünsch - info@widescape.net - www.widescape.net
	Originally based on The Weather Widget: (c) 2003 - 2004 Pixoria
*/

var widgetName		= "widescapeWeather";

var widgetFocused		= true;	// Whether or not the widget has the user's focus - true when starting
var widgetStartUp 	= true;	// True when the widget starts

var lastVersionCheck;	
var versionCheckPeriod = 3 * 24 * 60 * 60 * 1000; // 3 days

var movementInterval	= 0.02;	// Interval for the movement timer
var movementCounter	= 0;		// Counter for the tray movement
var movementDurationFast= 20;		// Duration for the fast tray movement
var movementDurationSlow= 90;		// Duration for the slow tray movement
var movementDuration	= movementDurationFast; // Fast is default

var fadeInterval		= 0.02;	// Interval for the button fading
var fadeCounter		= 0;		// Counter for the button fading
var fadeDuration		= 10;		// Duration for the button fading

var scaleSwitch		= 1.51; // Switch layout at this scale
var scaleModName		= "Small";
var sliding			= "horizontal";

var unitTemp;
var unitDistance;
var unitSpeed;
var unitPres;
var unitMeasure;
var MILES_TO_KM = 1.6093440006;


var widgetScale					= 1 + Math.round (preferences.widgetSize.value) / 12;
var trayState						= preferences.trayState.value;
var showToolTips				= true;
var oldTrayOpens				= preferences.trayOpens.value;
var oldUserLocation			= preferences.userLocation.value;
var oldCityName					= preferences.cityName.value;
var basePositionX				= Number(preferences.windowX.value == 'undefined' ? mainWindow.hOffset : preferences.windowX.value) + Number(preferences.baseAddition.value);
var basePositionY				= Number(preferences.windowY.value == 'undefined' ? mainWindow.vOffset : preferences.windowY.value);

var forecastText		= new Array();
var forecastImage		= new Array();

var globalWeather		= "";
var weatherLink = null;
var forecastLink = null;

var metrics			= new Object();

metrics.initialVOffset	= -10;
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

metrics.dateFormatWidthFactor		= new Object ();
metrics.dateFormatWidthFactor["D, M d"]		= 5.9;
metrics.dateFormatWidthFactor["D, d. M"]		= 6.3;
metrics.dateFormatWidthFactor["yyyy-mm-dd"]	= 5.4;
metrics.dateFormatWidthFactor["dd.mm.yyyy"]	= 5.5;
metrics.dateFormatWidthFactor["m/d/yy"]		= 4.1;

metrics.timeFormatWidthFactor		= new Object ();
metrics.timeFormatWidthFactor["s0"]	= 5.9;
metrics.timeFormatWidthFactor["s1"]	= 4.3;
metrics.timeFormatWidthFactor["m0"]	= 4.4;
metrics.timeFormatWidthFactor["m1"]	= 2.7;

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
metrics.forecast.day.size = 9;
metrics.forecast.day.hOffset	= 3;
metrics.forecast.day.vOffset	= 30;

metrics.forecast.img	= new Object();
metrics.forecast.img.width	= 45;
metrics.forecast.img.height	= 33;
metrics.forecast.img.hOffset	= 0;
metrics.forecast.img.vOffset	= 0;

var selectedTheme		= preferences.theme.value;
var themes			= new Object();

themes.widescape1		= new Object();
themes.widescape1.iconColor			= "#FFFFFF";
themes.widescape1.iconOpacity			= 255;
themes.widescape1.textColor			= "#FFFFFF";
themes.widescape1.textOpacity			= 255;
themes.widescape1.backgroundColor		= "#C3160E";
themes.widescape1.backgroundOpacity		= 255;
themes.widescape1.borderColor			= "#FFFFFF";
themes.widescape1.borderOpacity		= 255;
themes.widescape1.windowOpacity		= 255;

themes.widescape2		= new Object();
themes.widescape2.iconColor			= "#FFFFFF";
themes.widescape2.iconOpacity			= 255;
themes.widescape2.textColor			= "#FFFFFF";
themes.widescape2.textOpacity			= 255;
themes.widescape2.backgroundColor		= "#C3160E";
themes.widescape2.backgroundOpacity		= 255;
themes.widescape2.borderColor			= "#FFFFFF";
themes.widescape2.borderOpacity		= 0;
themes.widescape2.windowOpacity		= 255;

themes.transparent	= new Object();
themes.transparent.iconColor			= "#FFFFFF";
themes.transparent.iconOpacity		= 255;
themes.transparent.textColor			= "#FFFFFF";
themes.transparent.textOpacity		= 153;
themes.transparent.backgroundColor		= "#FFFFFF";
themes.transparent.backgroundOpacity	= 0;
themes.transparent.borderColor		= "#FFFFFF";
themes.transparent.borderOpacity		= 0;
themes.transparent.windowOpacity		= 255;

var observationTime = new Date();
var localLocationTimeOffset = 0;

// Switch old time format preference to new
if (preferences.timeFormat.value != 0) {
	preferences.use24hours.value = preferences.timeFormat.value == 24 ? 1 : 0;
	preferences.timeFormat.value = 0;
}

// Debug Settings
var currentConditionLogText = '';
var newConditionLogText = '';