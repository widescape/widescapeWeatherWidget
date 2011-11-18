/*
	
	widescapeWeather Widget

	Version 2.1.18
	
	This Widget grabs the latest current weather data from weather.com and builds
	it into a nice little iconic representation.
	
	For more information about the services weather.com offers, 
	visit their website at: http://www.weather.com
	
	
	Original code from: "The Weather" 1.6.6 by Arlo Rose
	Modified code from: Robert Wünsch
	Design: Robert Wünsch ("widescape")


	(c) 2008 widescape / Robert Wünsch - info@widescape.net - www.widescape.net
	The Weather Widget: (c) 2003 - 2004 Pixoria
	
	
	*** Please don't steal ***
	But feel free to learn from the code.
	
	For icon usage licences please contact Robert Wünsch at info@widescape.net
*/

include("javascripts/settings.js");			// Create the static environment
include("javascripts/xmldom.js");				// Import XML library
include("javascripts/weather.js");			// Import weather management
include("javascripts/design.js");				// Import design management
include("javascripts/interaction.js");	// Import interaction management
include("javascripts/setup.js");				// Prepare for setup

//-------------------------------------------------
// Initialize the widget
init ();