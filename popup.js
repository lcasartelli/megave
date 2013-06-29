/*
 * megave
 * Copyright(c) 2013 Luca Casartelli <luca@plasticpanda.com>
 * MIT Licensed
 */

/*jshint browser:true, laxcomma:true, indent:2, eqnull:true, devel:true, unused:true, undef:true */

function sendMessage() {
  var email = document.getElementById('email').value;
  var password = document.getElementById('password').value;
  chrome.runtime.sendMessage({email: email, password: password}, function (response) {
    if(response.status) {
      console.log('close');
      window.close();
    } else {
      document.getElementById('error').innerHTML = 'Login error. Check your params.';
    }
  });
}

window.onload = function () {
  document.getElementById('send').onclick = sendMessage;
};