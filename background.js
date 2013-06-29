/*jshint browser:true, laxcomma:true, indent:2, eqnull:true, devel:true, unused:true, undef:true */

/*
 * megave
 * Copyright(c) 2013 Luca Casartelli <luca@plasticpanda.com>
 * MIT Licensed
 */

var mega = require('mega')
    , uint8 = require('uint8')
    , regexExt = /\.[0-9a-z]+$/i
    , regexFile = /[0-9a-zA-Z_.\-%&!#]+[(\.)[0-9a-z]]{0,1}$/i
    //, regexEmail = /^(?:[a-zA-Z0-9!#$%&'*+\/=?\^_`{|}~\-]+(?:\.[a-zA-Z0-9!#$%&'*+\/=?\^_`{|}~\-]+)*|\"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*\")@(?:(?:[a-zA-Z0-9](?:[a-z0-9\-]*[a-zA-Z0-9])?\.)+[a-zA-Z0-9](?:[a-zA-Z0-9\-]*[a-zA-Z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-zA-Z0-9\-]*[a-zA-Z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])$/
    , megave;

global.Buffer = require('buffer').Buffer;

console.log('%c@FIXME bbackground.js:713: debug login', 'color: red');

function _ext(ct) {
  'use strict';
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

function Megave() {}


Megave.prototype.login = function (opt) {
  'use strict';

  var that = this;
  this.storage = mega({email: opt.email, password: opt.password}, function (err) {
    if (err) { return false; }
    console.log(that.storage);
  });
  return true;
}; 

Megave.prototype.browserAction = function (tab) {
  'use strict';

  if (_auth()) {
    console.log(tab);
    this.bufferFromURL(tab.url);
  }
};

Megave.prototype.contextMenu = function (info) {
  'use strict';

  if (_auth()) {
    console.log(info);
    this.bufferFromURL(info.srcUrl || info.pageUrl);  
  }
};

Megave.prototype.bufferFromURL = function (url) {
  'use strict';

  var xhr = new XMLHttpRequest()
    ,  that = this;
  xhr.open('GET', url, true);
  xhr.responseType = 'arraybuffer';

  xhr.onload = function() {
    var data = uint8.uint8ToBuffer(new Uint8Array(this.response))
      , contentType = this.getResponseHeader('Content-Type')
      , tmpFile = url.match(regexFile)
      , filename = (tmpFile && tmpFile[0]) ? tmpFile[0] : 'file';

    if (!url.match(regexExt)) {
      // find correct extension
      filename += _ext(contentType);
    }

    // DEBUG
    console.log('%cURL: ' + url, 'color: grey');
    console.log('%cFilename: ' + filename, 'color: grey');
    that.upload(filename, data);
  };
  xhr.send();
};

Megave.prototype.upload = function (filename, data) {
  'use strict';

  this.storage.upload({name: filename}, data, function (err, file) {
    if (err) {
      console.log('%c' + err.message, 'color: red');
    } else {
      console.log('%cUpload complete!','color: blue');
      console.log(file);
    }
  });
};

function _auth() {
  'use strict';

  var retValue = false;
  if (localStorage.email && localStorage.password && megave.login({email: localStorage.email, password: localStorage.password})) {
    retValue = true;
  } else {
    delete localStorage.email;
    delete localStorage.password;
    console.log('popup');
    chrome.windows.create({
      url: 'popup.html', 
      type: 'popup',
      width: 490,
      height: 246
    }); 
  }
  return retValue;
}

var megave = new Megave();

// ContextMenu
function _onClickHandler(info, tab) {
  'use strict';

  // On click save
  megave.contextMenu(info, tab);
}
function _initContextMenu() {
  'use strict';

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
chrome.browserAction.onClicked.addListener(function () {    
  'use strict';

  chrome.tabs.getSelected(null, function (tab) {
    megave.browserAction(tab);
  });
});

chrome.runtime.onMessage.addListener(function (req, sender, res) {
  'use strict';

  var email = req.email
    , password = req.password
    , retValue = megave.login({email: email, password: password});

  if (retValue) {
    localStorage.email = email;
    localStorage.password = password;
  }
  res({status: retValue});
});