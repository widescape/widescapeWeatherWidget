/*
	
	widescapeWeather widget
	
	This Widget grabs the latest current weather data from weather.com and builds
	it into a nice little iconic representation.

	2.1.17
	
	Original code from: "The Weather" by Arlo Rose
	Modified code from: Robert Wünsch
	Design: Robert Wünsch ("widescape")
	
	For more information about the services weather.com offers, visit their
	website at: <http://www.weather.com>


	(c) 2007 widescape / Robert Wünsch - info@widescape.net - www.widescape.net
	The Weather Widget: (c) 2003 - 2004 Pixoria
*/

include("javascripts/settings.js");			// Create the static environment
include("javascripts/xmldom.js");				// Import XML library
include("javascripts/weather.js");			// Import weather management
include("javascripts/design.js");				// Import design management
include("javascripts/interaction.js");	// Import interaction management
include("javascripts/versioncheck.js");	// Import version checker
include("javascripts/setup.js");				// Prepare for setup

//-------------------------------------------------
// Initialize the widget
init ();