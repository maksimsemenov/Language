/* global chrome */
/* global XMLHttpRequest */
/* global Promise */

var env = {yandexDictionaryApiKeys: ["dict.1.1.20150811T012634Z.9abd255c392b2e10.67ddcf04c4b2af8508c1d8fba87e6238a78d4830",
									 "dict.1.1.20150903T195310Z.59164daedfcad0f5.b7a8cdeb27bcf4f7360b0f5cd121510d19fbf92e",
									 "dict.1.1.20150811T012634Z.9abd255c392b2e10.67ddcf04c4b2af8508c1d8fba87e6238a78d4830"],
		   yandexDictionaryKeyIndex: 0,
		   yandexDictionaryLookupUrl: "https://dictionary.yandex.net/api/v1/dicservice.json/lookup",
		   yandexDictionaryGetLangsUrl: "https://dictionary.yandex.net/api/v1/dicservice.json/getLangs",
		   yandexTranslateApiKeys: ["trnsl.1.1.20150810T013537Z.e7bba93faf3fb7e2.e9a7046d594c548b38f5546add1a21cf4773363b",
									"trnsl.1.1.20150903T123308Z.2ad19e2de7ab9e4b.2c179c3ee7e41645a4fdbe591657d3644118fd77",
									"trnsl.1.1.20150903T123304Z.04de0b892ec49873.8ff1c8f3a68ef4f42e209096cbccf1d283c51afc",
									"trnsl.1.1.20150903T123300Z.f6d0699eb72fa236.d8d0f06493461a530133a06ec4362fb429f270aa",
									"trnsl.1.1.20150903T123254Z.2016f17e0b408e67.0af1ed59c507f61ad1be839f995b1f3ae2c2370a",
									"trnsl.1.1.20150903T123251Z.2fe21033a469b860.85de3acc62f6eafcb60560ae30311ad198ee7b7e",
									"trnsl.1.1.20150903T123247Z.50075a5c92c89f57.8e8d0627691491e2f27ee966f162f654fe616d06",
									"trnsl.1.1.20150903T115825Z.98cae3b45831d158.55617c838018f76050736afebfa8a1ba9fb41ae1",
									"trnsl.1.1.20150903T115817Z.776ace3726344c4b.5fa175f0a6577acfddf0185ffd7984a8bd11b23f",
									"trnsl.1.1.20150903T115806Z.63399910c0ba7d1b.d2bc3df013401f843caa7d8ef35680c365f1e4ef",
									"trnsl.1.1.20150810T013537Z.e7bba93faf3fb7e2.e9a7046d594c548b38f5546add1a21cf4773363b"],
		   yandexTranslateKeyIndex: 0,
		   yandexTranslateUrl: "https://translate.yandex.net/api/v1.5/tr.json/translate",
		   yandexTranslateLangDetectUrl: "https://translate.yandex.net/api/v1.5/tr.json/detect",
		   yandexTranslateGetLangsUrl: "https://translate.yandex.net/api/v1.5/tr.json/getLangs",
		  };
chrome.runtime.onMessage.addListener(handleMessage);

chrome.contextMenus.create({"title": "Translate", 
							"contexts": ["selection"],
							"id": "translateMenuItem"});
chrome.contextMenus.onClicked.addListener(contextMenuClickHandler);

chrome.storage.sync.get(null, function(items) {
	for (var key in items) {
		env[key] = items[key];
	}
	if (!env.ui) {
		var ui = chrome.i18n.getUILanguage().slice(0,2);
		chrome.storage.sync.set({"ui": ui});
		if (!env.langs) {initUiLanguages(ui);}
	}
	if (!env.dicDir) {
		var dicLangsReq = env.yandexDictionaryGetLangsUrl + "?key=" + env.yandexDictionaryApiKeys[env.yandexDictionaryKeyIndex];
		getJSON(dicLangsReq).then(function(json) {
			chrome.storage.sync.set({dictDir: json});
		}).catch(function(err) {console.log(err);});
	}
});
chrome.storage.onChanged.addListener(storageChangeHandler);
function initUiLanguages(ui) {
	var trLangsReq = env.yandexTranslateGetLangsUrl + "?key=" + env.yandexTranslateApiKeys[env.yandexTranslateKeyIndex];
	trLangsReq += ui? "&ui=" + ui : "";

	getJSON(trLangsReq).then(function(res) {
		var uiLangs = res.dirs
		.map(function(l) {return l.slice(0,2);})
		.reduce(function(b, a) {return b.indexOf(a)==-1 ? b.concat(a) : b;}, [])
		.map(function(l) {return {code: l, name: res.langs[l]};})
		.sort(function(a, b) {return a.name>=b.name ? 1: -1;});
		
		chrome.storage.sync.set({"uiLangs": uiLangs});
		
	}).catch(function(err) {
		console.log(err);
	});
}
function storageChangeHandler(changes, area) {
	if (area === "sync") {
		for (var key in changes) {
			var change = changes[key];
			if (change.newValue != env[key]) {
				env[key] = change.newValue;
			}
			if (key === "ui") {
				initUiLanguages(change.newValue);
			}
		}
	}
	
}

function contextMenuClickHandler(object) {
	if (object.selectionText) {
		handleMessage(object.selectionText);
	}
}
function handleMessage(msg, sender) {
	translate(msg).then(function(json) {
		sendResponce({type: "translation", body: json}, sender);
		if (json.detected.lang !== "") {
			var direction = json.detected.lang + "-" + env.ui;
			if (env.dictDir.indexOf(direction) != -1) {
				var words = msg.split(/[\s,.?!:;]/).filter(function(str) {return str !== "";});
				var dict = [];
				if (words.length<4) {
					for (var i=0; i<words.length; i++) {
						var word = words[i];
						if (i===0) {
							if (word.match(/(s|d)$/)) {dict.push(word.replace(/(s|d)$/, ""));}
							if (word.match(/(es|ed)$/)) {dict.push(word.replace(/(es|ed)$/, ""));}
							if (word.match(/(ing)$/)) {dict.push(word.replace(/(ing)$/, ""));}
							dict.push(word);
						} else {
							dict.push(dict[dict.length-1] + " " + word);
						}
					}
				}

				dictionary(dict, direction).then(function(resArray) {
					var res = false;
					for (var k=resArray.length-1; k>=0; k--) {
						if (resArray[k].def.length>0 && !res) {
							sendResponce({type: "dictionary", body: resArray[k]}, sender);
							res = true;
						}
					}
				});
			}
		}
	});		
}
function sendResponce(msg, sender) {
	if (sender) {
		chrome.tabs.sendMessage(sender.tab.id, msg);
	} else {
		chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
			chrome.tabs.sendMessage(tabs[0].id, msg);});
	}
}
function translate(msg) {
	var translateReq = env.yandexTranslateUrl + "?key=" + env.yandexTranslateApiKeys[env.yandexTranslateKeyIndex] + 
			"&text=" + encodeURIComponent(msg) +
			"&lang=" + env.ui + "&format=plain&options=1";
	return getJSON(translateReq).catch(function(err) {
		if (err.message === "401" ||
			err.message === "402" ||
			err.message === "403" ||
			err.message === "404") {
			if (env.yandexTranslateKeyIndex === env.yandexTranslateApiKeys.length-1) {env.yandexTranslateKeyIndex = 0;}
			else {env.yandexTranslateKeyIndex++;}
			translate(msg);
		}
	});
}	
function dictionary(words, dir) {
	var req = words.map(function(word) {
		return env.yandexDictionaryLookupUrl + "?key=" + env.yandexDictionaryApiKeys[env.yandexDictionaryKeyIndex] +
		"&lang=" + dir +
		"&text=" + encodeURIComponent(word) +
		"&ui=" + env.ui;});
	return Promise.all(req.map(getJSON)).catch(function(err) {
		if (err.message === "401" || err.message === "402" || err.message === "403") {
			if (env.yandexDictionaryKeyIndex === env.yandexDictionaryApiKeys.length-1) {env.yandexDictionaryKeyIndex = 0;}
			else {env.yandexDictionaryKeyIndex++;}
			dictionary(words, dir);
		}
	});
}
function getJSON(url) {
	return new Promise(function(resolve, reject) {
		var req = new XMLHttpRequest();
		req.open("GET", url);
		
		req.onload = function() {
			if (req.status === 200) {resolve(JSON.parse(req.response));}
			else {reject(Error(req.status));}
		};		
		req.onerror = function() {reject(Error("Network error"));};
		
		req.send();
	});
}