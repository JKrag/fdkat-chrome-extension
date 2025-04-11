# Chrome extension adding features to fdkat.dk, kissat.kissaliitto.fi and katt.nrr.no

This is a small Chrome extension that attempts to address some of the shortcomings of the pedigree database systems of the 3 nordic FIFe clubs in Finland, Norway and Denmark.
These 3 clubs currently use the same system, originally developed by the Finnish organization and licensed to the other 2 clubs.

The plan is to make this extension available in the Chrome Web Store, but for now you can install it manually.

## Manual installation

1. Download the contents of this repository as a zip file and extract it to a folder on your computer.
2. Open your Chrome/chromium browser and go to the extensions page (chrome://extensions/).
3. Enable developer mode (top right corner).
4. Click "Load unpacked" (top left corner) and select the folder you extracted the zip file to.
5. The extension should now be installed and active.
6. Go to the pedigree database of your choice and enjoy the new features.

## Features

### Search page sorting

The main publicly accessible search page has rather advanced search features, but the results are always sorted by the cats name, which is not always very useful.

With this extension, the column headers become clickable, and will re-sort the results by that column. Clicking the same column again will reverse the sort order.

The currently sorted column is highlighted in grey. Sort order (increasing or decreasing) is indicated with arrows.

## Roadmap

Here are some of the features I'm planning to add in the future:

* Color code the cats in the search results based on their gender.
* Live filtering of search results
* Add similar sorting to some of the tables on an individual cats data pages (show results, kittens, etc.)

If you have any suggestions for features, please open an issue on GitHub or let me know in some other way.
