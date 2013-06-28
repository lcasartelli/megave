/*
 * megave
 * Copyright(c) 2013 Luca Casartelli <luca@plasticpanda.com>
 * MIT Licensed
 */

/* jshint browser: true, laxcomma: true */

console.log('%c@FIXME bbackground.js:678: debug login', 'color: red');

global.Buffer = require('buffer').Buffer;

var mega = require('mega')
  , storage = mega({email: '', password: ''})
  , uint8 = require('uint8')
  , regexExt = /\.[0-9a-z]+$/i
  , regexFile = /[0-9a-zA-Z_.\-%&!#]+[(\.)[0-9a-z]]{0,1}$/i;


function ext(ct) {
  var t = '';
  if (/(text)/i.test(ct)) {
    // Text
    if (/(html)/i.test(ct)) {
      t = '.html';
    } else if (/(plain)/i.test(ct)) {
      t = '.txt';
    } else if(/(css)/i.test(ct)) {
      t = '.css';
    }
  } else if(/(image)/i.test(ct)) {
    // Image
    if (/(gif)/i.test(ct)) {
      t = '.gif';
    } else if(/(png)/i.test(ct)) {
      t = '.png';
    } else if(/(jpeg)/i.test(ct)) {
      t = '.jpeg';
    }
  }
  return ext;
}


chrome.browserAction.onClicked.addListener(function(tab) {
  
  chrome.tabs.getSelected(null, function(tab) {

    console.log(tab);

    var url = tab.url;
    var xhr = new XMLHttpRequest();
    xhr.open('GET', tab.url, true);
    xhr.responseType = 'arraybuffer';

    xhr.onload = function(e) {
      
      var url = tab.url
        , data = uint8.uint8ToBuffer(new Uint8Array(this.response))
        , contentType = this.getResponseHeader('Content-Type')
        , filename = tab.url.match(regexFile)[0] || 'file';

      if (!url.match(regexExt)) {
        // find correct extension
        filename += ext(contentType);
      }

      // DEBUG
      console.log('%cURL: ' + tab.url, 'color: grey');
      console.log('%cFilename: ' + filename, 'color: grey');

      if (storage) {
        storage.upload({name: filename}, data, function (err, file) {
          if(err) {
            console.log('%c' + err.message, 'color: red');
          } else {
            console.log('%cUpload complete!','color: blue');
          }
        });
      }
    };
    xhr.send();
  });
});