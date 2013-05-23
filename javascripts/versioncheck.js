/*
 * widescapeWeather widget
 * 
 * 2.3.0.rc1
 * 
 * Version Check
 * 
 * (c) 2013 widescape / Robert Wünsch - info@widescape.net - www.widescape.net
 */

// Checks for an update of this Widget
function checkVersion(checkNow) {
	//sleep (300);
	//log ("checkVersion ()");
	
	if (isNaN(lastVersionCheck)) {
		lastVersionCheck = preferences.lastVersionCheck.value;
	}
	
	// Skips version check if it was last checked less than 3 days ago
	if (checkNow != true && !isNaN(lastVersionCheck) && new Date().getTime() < lastVersionCheck + versionCheckPeriod) return false;
	
	var _url	= "http://www.widescape.net/widgets/checkversion/widescapeWeather.xml?version=" + widget.version;
	//log(_url);
	
	var urlFetch = new URL();
	urlFetch.location = _url;
	try {
		if (checkNow == true) urlFetch.fetchAsync(onVersionFetchedActively);
		else urlFetch.fetchAsync(onVersionFetchedPassively);
	}
	catch (error) {
		displayConnectionError(error,_url);
	}
}

function onVersionFetchedActively(fetch) {
	if (!onVersionFetchedPassively(fetch)) {
		alert("Your widget is up to date.", "Yeah!");
	}
}

function onVersionFetchedPassively(fetch) {
	
	// Checks location data (false = alert passively)
	var xml = parseAndCheckFetchedData(fetch,false);
	if (!xml) return false;
	
	var widget_version = widget.version;
	var newest_version = xml.evaluate("string(version_check/current_version)");
	
	if (!isWidgetUpdateAvailable(widget_version,newest_version)) {
		log("Widget Version Check: " + widget_version + " (current) >= " + newest_version + " (newest) => No update available");
		preferences.lastVersionCheck.value = new Date().getTime();
		return false;
	}
	log("Widget Version Check: " + widget_version + " (current) < " + newest_version + " (newest) => Update available");
	promptForVersionUpdate(xml,widget_version,newest_version);
	return true;
}

function isWidgetUpdateAvailable(widget_version,newest_version) {
	var widget_version_arr = widget_version.split(/\./);
	var newest_version_arr = newest_version.split(/\./);
	
	for (var i=0; i<Math.max(widget_version_arr.length,newest_version_arr.length); i++) {
		var widget_sub_version = widget_version_arr[i] ? widget_version_arr[i] : 0;
		var newest_sub_version = newest_version_arr[i] ? newest_version_arr[i] : 0;
		if (("" + widget_sub_version).match(/[^0-9]/)) widget_sub_version = -1000 + Number(("" + widget_sub_version).replace(/[^0-9]/g, ''));
		if (("" + newest_sub_version).match(/[^0-9]/)) newest_sub_version = -1000 + Number(("" + newest_sub_version).replace(/[^0-9]/g, ''));
		if (widget_sub_version < newest_sub_version) return true;
		else if (widget_sub_version > newest_sub_version) return false;
	}
	return false;
}

function promptForVersionUpdate(xml,widget_version,newest_version) {
	
	var title = xml.evaluate("string(version_check/update_dialog/title)");
	var text = xml.evaluate("string(version_check/update_dialog/text)");
	var action = xml.evaluate("string(version_check/update_dialog/action)");
	var url = xml.evaluate("string(version_check/update_dialog/url)");
	
	// Sets default
	if (typeof title == "undefined" || title == "") title = "New widget version available. Do you want to update now?";
	if (typeof text == "undefined" || text == "") text = "Newest version available: "+newest_version+" (your version: " + widget_version + ").";
	if (typeof action == "undefined" || action == "") action = "OK";
	if (typeof url == "undefined" || url == "") url = "http://www.widescape.net/widgets";
	
	var alertResult = alert(title + "\n\n" + text, action, "Later");
	if (alertResult == 2) {
		preferences.lastVersionCheck.value = new Date().getTime();
	}
	else {
		openURL(url);
	}
}