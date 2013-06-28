/*
 * megave
 * Copyright(c) 2013 Luca Casartelli <luca@plasticpanda.com>
 * MIT Licensed
 */

/* jshint browser: true, laxcomma: true */

var mega = require('mega')
    , uint8 = require('uint8')
    , regexExt = /\.[0-9a-z]+$/i
    , regexFile = /[0-9a-zA-Z_.\-%&!#]+[(\.)[0-9a-z]]{0,1}$/i;
  global.Buffer = require('buffer').Buffer;

  console.log('%c@FIXME bbackground.js:713: debug login', 'color: red');

  function _ext(ct) {
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
    return t;
  }

  function Megave(email, password) {
    this.storage =  mega({email: email, password: password});
  }

  Megave.prototype.browserAction = function (tab) {
    console.log(tab);
    this.bufferFromURL(tab.url);
  };

  Megave.prototype.contextMenu = function (info, tab) {
    console.log(info);
    this.bufferFromURL(info.srcUrl || info.pageUrl);
  };

  Megave.prototype.bufferFromURL = function (url) {
    
    var xhr = new XMLHttpRequest()
      ,  that = this;

    xhr.open('GET', url, true);
    xhr.responseType = 'arraybuffer';

    xhr.onload = function(e) {

      var data = uint8.uint8ToBuffer(new Uint8Array(this.response))
        , contentType = this.getResponseHeader('Content-Type')
        , tmpFile = url.match(regexFile)
        , filename = (tmpFile && tmpFile[0]) ? tmpFile : 'file';

      if (!url.match(regexExt)) {
        // find correct extension
        filename += _ext(contentType);
      }

      // DEBUG
      console.log('%cURL: ' + url, 'color: grey');
      console.log('%cFilename: ' + filename, 'color: grey');

      if (that.upload) {
        that.upload(filename, data);
      }
    };
    xhr.send();
  };

  Megave.prototype.upload = function (filename, data) {
    this.storage.upload({name: filename}, data, function (err, file) {
      if (err) {
        console.log('%c' + err.message, 'color: red');
      } else {
        console.log('%cUpload complete!','color: blue');
      }
    });
  };

  var megave = new Megave('', '');

  /*chrome.browserAction.onClicked.addListener(function() {
     chrome.windows.create({'url': 'popup.html', 'type': 'popup'}, function(window) {
     });
  });*/
  
  
  // ContextMenu
  
  function _onClickHandler(info, tab) {
    // On click save
    megave.contextMenu(info, tab);
  }

  function _initContextMenu() {
    var contexts = ["page", "image", "video", "audio"]
      , title = "Save on MEGA"
      , i, ctx, id;
    for (i = 0; i < contexts.length; ++i) {
      ctx = contexts[i];
      id = chrome.contextMenus.create({
        "title": title,
        "contexts": [ctx],
        "id": "context" + ctx
      });
    }
  }

  chrome.runtime.onInstalled.addListener(_initContextMenu);
  chrome.contextMenus.onClicked.addListener(_onClickHandler);


  // BrowserAction

  chrome.browserAction.onClicked.addListener(function(tab) {    
    chrome.tabs.getSelected(null, function(tab) {
      megave.browserAction(tab);
    });
  });