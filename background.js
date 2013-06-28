/* jshint browser: true */

var mega = require('mega');

chrome.browserAction.onClicked.addListener(function(tab) {
  
  chrome.tabs.getSelected(null, function(tab) {
    
    var xhr = new XMLHttpRequest();
    xhr.open('GET', tab.url, true);
    xhr.responseType = 'arraybuffer';

    xhr.onload = function(e) {
      var buffer = new Uint8Array(this.response);
      // Start!
    };
    xhr.send();
  });
});