chrome.action.onClicked.addListener(function (tab) {
    chrome.tabs.executeScript({
        file: 'sorter.js'
    });
});
