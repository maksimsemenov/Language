/* global chrome */
/* global XMLHttpRequest */

var API_KEY = "dict.1.1.20150811T012634Z.9abd255c392b2e10.67ddcf04c4b2af8508c1d8fba87e6238a78d4830";
var API_URL = "https://dictionary.yandex.net/api/v1/dicservice.json/lookup";


chrome.commands.onCommand.addListener(function() {
	chrome.tabs.insertCSS(null, {file: "translateTooltip.css"});
	chrome.tabs.executeScript(null, {file: "translate.js"});	
});

chrome.runtime.onConnect.addListener(connectionHandler);

function connectionHandler(port) {
	function handleServerResponse(request) {
		if (request.readyState == 4) {
			if (request.status == 200) {
				port.postMessage(JSON.parse(request.responseText));
			}
		}
	}
	function translate(msg) {
		var httpRequest = new XMLHttpRequest();
		httpRequest.onreadystatechange = function() {handleServerResponse(httpRequest);};
		var requestData = API_URL + "?key=" + API_KEY;
		requestData += "&lang=" + "en-ru";
		requestData += "&text=" + encodeURIComponent(msg);
		requestData += "&ui=ru";
		httpRequest.open("GET", requestData, true);
		httpRequest.send(null);
	}
	
	port.onMessage.addListener(translate);
}

