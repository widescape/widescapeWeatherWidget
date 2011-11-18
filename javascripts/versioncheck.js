/*
	
	widescapeWeather widget
	
	Version Check

	2.1.16

	
	(c) 2007 widescape / Robert Wünsch - info@widescape.net - www.widescape.net
	The Weather Widget: (c) 2003 - 2004 Pixoria
*/

var versionChecked = false;
var lastVersionCheck = new Date();

//-------------------------------------------------
// -- checkVersion --
// Checks for an update of this Widget

function checkVersion () {
	//sleep (300);
	//print ("checkVersion ()");
	
	if (versionChecked == true) return;
	
	var _checkVersionUrl	= "http://widgets.widescape.net/api/checkversion/?name=" + widgetName + "&version=" + widget.version;
	//print(_checkVersionUrl);
	
	var checkVersionURL	= new URL();
	var checkVersionData	= checkVersionURL.fetch(_checkVersionUrl);
	if (checkVersionData.length == 0 || checkVersionData == "Could not load URL") {
		alert("error occurred");
		return;
	}
	versionChecked		= true;
	
	checkVersionData = checkVersionData.replace(/[\r]*\n/g,"");
	var versionData = "<xml>"+checkVersionData.match(/<versioncheck>(.*?)<\/versioncheck>/g)+"</xml>";
	
	print(versionData);
	
	if (versionData == "") return;
	var xml = new XMLDoc(versionData, xmlError);
	
	var xmlFetchedNewerVersion = xml.selectNode("/versioncheck/newerversion");
	var xmlFetchedCurrentVersion = xml.selectNode("/versioncheck/currentversion");
	var xmlFetchedUpdateRequired = xml.selectNode("/versioncheck/updaterequired");
	
	if (xmlFetchedNewerVersion.getText() == "1") {
		promptForVerionUpdate(xmlFetchedCurrentVersion.getText(), xmlFetchedUpdateRequired.getText());
	}
}

function promptForVerionUpdate( currentVersion, updateRequired) {
	
	var formfields	= new Array();
	
	formfields[0]	= new FormField();
	formfields[0].name		= "message";
	formfields[0].type		= "checkbox";
	formfields[0].title		= "Don't ask again";
	formfields[0].defaultValue	= 0;
	
	var formresult = form(formfields, "New Widget version available: " + currentVersion, "Update now", "Cancel");
	
}