/* global chrome, messages, document, window, Promise */

var env = {};
function getEnv() {
	return new Promise(function(resolve, reject) {
		chrome.storage.sync.get(null, function(items) {
			for (var key in items) {
				env[key] = items[key];
			}
			if (Object.keys(env).length > 0) {resolve(env);}
			else {reject(Error("Couldn't load settings"));}
		});
	});
}
function initControls(env) {	
	var uiSelect = document.getElementById("uiSelect");
	clearSelect(uiSelect);
	uiSelect.addEventListener("change", selectChangeHandler);
	setSelectWithLangs(uiSelect, env.uiLangs, env.ui);

	var trDirection = document.getElementById("trDirection");
	trDirection.innerHTML = messages.translateInto[env.ui] || messages.translateInto.en;
	
	var yandex = document.getElementById("yandex");
	yandex.innerHTML = messages.basedOn[env.ui] || messages.basedOn.en;
	yandex.appendChild(document.createElement("br"));
	var link = document.createElement("a");
	link.href = messages.link[env.ui] || messages.link.en;
	link.innerHTML = messages.yandex[env.ui] || messages.yandex.en;
	yandex.appendChild(link);
}

function setSelectWithLangs(select, langs, code) {
	for (var i=0, lang, opt; i<langs.length; i++) {
		lang = langs[i];
		opt = document.createElement("option");
		opt.value = lang.code;
		opt.text = lang.name;
		select.add(opt, null);
		if (code===lang.code) {select.selectedIndex = i;}
	}
	if (select.selectedIndex == -1) {select.selectedIndex = 0;}
}
function clearSelect(select) {
	for (var i=select.options.length-1; i>=0; i--) {select.remove(i);}
}
function selectChangeHandler(event) {
	chrome.storage.sync.set({"ui": event.target.selectedOptions[0].value});
}	
function storageChangeHandler(changes, area) {
	if (area === "sync") {
		for (var key in changes) {
			var change = changes[key];
			if (change.newValue != env[key]) {
				env[key] = change.newValue;
			}
		}
	}
	initControls(env);
}

window.onload = getEnv().then(initControls);
chrome.storage.onChanged.addListener(storageChangeHandler);
console.log(messages);