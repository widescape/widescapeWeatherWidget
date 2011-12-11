/*
	
	widescapeWeather Widget

	Version 2.1.19
	
	This Widget grabs the latest current weather data from weather.com and builds
	it into a nice little iconic representation.
	
	For more information about the services weather.com offers, 
	visit their website at: http://www.weather.com
	
	
	Original code from: "The Weather" 1.6.6 by Arlo Rose
	Modified code from: Robert Wünsch
	Design: Robert Wünsch ("widescape")


	(c) 2011 widescape / Robert Wünsch - info@widescape.net - www.widescape.net
	The Weather Widget: (c) 2003 - 2004 Pixoria
	
	
	*** Please don't steal ***
	
	For icon usage licences see /Resources/WeatherIcons/__Weather Icon Copyright and Permissions__.txt
	or contact Robert Wünsch at info@widescape.net
*/

include("javascripts/settings.js");			// Creates the static environment
include("javascripts/weather.js");			// Loads weather management
include("javascripts/design.js");				// Loads design management
include("javascripts/interaction.js");	// Loads interaction management
include("javascripts/helpers.js");			// Loads helper methods
include("javascripts/versioncheck.js");	// Checks for new widget versions
include("javascripts/setup.js");				// Prepares for setup

//-------------------------------------------------
// Initialize the widget
init();