/* global chrome */
/* global XMLHttpRequest */

var env = {dYandexApiKey: "dict.1.1.20150811T012634Z.9abd255c392b2e10.67ddcf04c4b2af8508c1d8fba87e6238a78d4830",
		   dYandexApiUrl: "https://dictionary.yandex.net/api/v1/dicservice.json/lookup",
		   trYandexApiKey: "trnsl.1.1.20150810T013537Z.e7bba93faf3fb7e2.e9a7046d594c548b38f5546add1a21cf4773363b",
		   trYandexApiTrUrl: "https://translate.yandex.net/api/v1.5/tr.json/translate",
		   trYandexApiDUrl: "https://translate.yandex.net/api/v1.5/tr.json/detect"
		  };

chrome.runtime.onConnect.addListener(connectionHandler);
env.menuId = chrome.contextMenus.create({"title": "Translate", 
							"contexts": ["selection"],
							"id": "translateMenuItem"});
chrome.contextMenus.onClicked.addListener(contextMenuClickHandler);
console.log(env.menuId);

function connectionHandler(port) {
	console.log("connection");

	env.port = port;
	port.onMessage.addListener(translate);
}

function handleServerResponse(request) {
	if (request.readyState == 4) {
		if (request.status == 200) {
			var response = JSON.parse(request.responseText);
			if (response.def && response.def.length > 0) {
				env.port.postMessage({type: "trResponse",
									  body: response});
			}
			else {
				env.port.postMessage(false);
			}
		}
	}
}
function translate(msg) {
	console.log("message");
	var httpRequest = new XMLHttpRequest();
	httpRequest.onreadystatechange = function() {handleServerResponse(httpRequest);};
	var requestData = env.dYandexApiUrl + "?key=" + env.dYandexApiKey;
	var trArray = msg.split(/[\s,.?!:;]/);

	trArray = trArray.filter(function(str) {
		return str !== "";
	});
	console.log(trArray);
	//description = description.replace(/\s?[\w\d]+\-?\d+\-?[\w\d]+\-?/g, "");
	requestData += "&lang=" + "en-ru";
	requestData += "&text=" + encodeURIComponent(msg);
	requestData += "&ui=ru";
	httpRequest.open("GET", requestData, true);
	httpRequest.send(null);
}

function contextMenuClickHandler(object) {
	if (object.selectionText) {
		translate(object.selectionText);
		env.port.postMessage({type: "trRequest"});
	}
}

