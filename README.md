# widescapeWeather Widget

This free widget grabs the latest current weather data from [wunderground.com](http://www.wunderground.com/?apiref=b11cc7e8585de883) and displays it in a nice and minimal way.

## Features

* 3 day forecast and outlook for the current day/night
* Forecast drawer that can be opened/closed
* Fully customizable colors
* Display or hide the location
* Display or hide date and/or time (incl. seconds)

## Requirements

The widget requires the **discontinued Yahoo! Widget Engine** (Konfabulator), which can be inofficially downloaded here: [Mac version](http://widescape.net/widgets/downloads/yahoo-widgets-4.5.2.dmg), [Windows version](http://widescape.net/widgets/downloads/yahoo-widgets-4.5.2.exe).

## Credits

* **Wunderground** for their nice [Wunderground API](http://www.wunderground.com/weather/api).
* **[Yuval Kogman](https://github.com/nothingmuch)** for his support in the old Konfabulator times of the widget.
* **Pierre Bédat** for his idea to localize the widget and his great help with the French translation.
* **[Allan Nyholm Nielsen](https://github.com/allannyholm)** for the Danish translation.

## Contributing

If you want to make improvements to this widget:

1. Fork the project on GitHub.
2. Make your feature addition or bug fix.
3. Commit with Git.
4. Send a pull request.

## Localization

Want the widget to support your language? 

1. Create a copy of the [English language file](https://github.com/widescape/widescapeWeatherWidget/blob/release/Resources/en/Localizable.strings) and put it in its own language folder in ```Resources``` with the language's shortcode as the folder name. For example ```Resources/sp/Localizable.strings``` for a *Spanish* translation (shortcode ```sp```). Only use language shortcodes listed on http://www.wunderground.com/weather/api/d/docs?d=language-support.
2. Adjust the translations in your new file.
3. Submit the file in a fork (see Contribution, above) or [submit it as a new issue](https://github.com/widescape/widescapeWeatherWidget/issues).

Your localization will then be released with the next widget version.

**Note:** The localization file only requires translations for the widget texts listed in the localization file. 
The weather conditions like "rain" or "sunny" are provided by Weather Underground and are already translated into many languages: http://www.wunderground.com/weather/api/d/docs?d=language-support.

## Disclaimer & License

Created by Robert Wünsch, [www.widescape.com](http://www.widescape.com)

© All rights reserved. Contributions are welcome and will by fully credited.
