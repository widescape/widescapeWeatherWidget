/*
	
	widescapeWeather Widget

	Version 2.3.0.rc3
	
	This Widget grabs the latest current weather data from wunderground.com and builds
	it into a nice little iconic representation.
	
	For more information about the API wunderground.com offers, 
	visit their website at: http://www.wunderground.com/weather/api/
	
	
	Code, Design and Icons by widescape / Robert Wünsch
  
	(c) 2013 widescape / Robert Wünsch - info@widescape.net - www.widescape.net
	Originally based on The Weather Widget: (c) 2003 - 2004 Arlo Rose & Perry Clarke
	
	For icon usage licences see /Resources/WeatherIcons/__Weather Icon Copyright and Permissions__.txt
	or contact Robert Wünsch at info@widescape.net
*/

include("javascripts/settings.js");			// Creates the static environment
include("javascripts/weather.js");			// Fetched weather and manages locations
include("javascripts/design.js");				// Layouts the widget
include("javascripts/interaction.js");	// Manages interactions (like clicks) and animations
include("javascripts/helpers.js");			// My little helpers
include("javascripts/versioncheck.js");	// Checks for new widget versions
include("javascripts/setup.js");				// Prepares the widget for setup

//-------------------------------------------------
// Initialize the widget
init();