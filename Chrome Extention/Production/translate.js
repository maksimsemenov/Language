/* global window */
/* global chrome */
/* global document */

document.body.addEventListener("click", clickHandler, false);
document.body.addEventListener("keydown", keydownHandler, false);
document.body.addEventListener("dblclick", dbclickHandler, false);

chrome.runtime.onMessage.addListener(handleMessage);

function handleMessage(msg) {
	if (msg) {
		if (msg.type == "dictionary") {
			addDictionaryToTooltip(msg.body.def);
		}
		if (msg.type == "translation") {
			addTranslationToTooltip(msg.body.text[0]);
		}			
	}
	else {
		addErrorToTooltip();
		console.log("Error: incorect response from server: ", msg);
	}
}
											   
function createSectionTranslationsNode(translations) {
	var trString = "";
	for (var k=0, tr; k<translations.length; k++) {
		tr = translations[k];
		trString += tr.text + ", ";
	}
	trString = trString.slice(0,1).toUpperCase() + trString.slice(1,-2);
	
	var sectionTranslation = document.createElement("p");
	sectionTranslation.classList.add("tr_t__sectionTranslation");
	sectionTranslation.appendChild(document.createTextNode(trString));
	
	return sectionTranslation;
}
function createTranslationNode(text) {
	var translationNode = document.createElement("p");
	translationNode.classList.add("tr_t__translation");
	translationNode.appendChild(document.createTextNode(text));
	if (text.split(/[\s,.?!:;]/).filter(function(str) {return str !== "";}).length>3) {
		translationNode.style.fontSize="13px";
	}	
	return translationNode;
}
function createSectionNode(section) {
	var sectionNode = document.createElement("div");
	sectionNode.classList.add("tr_t__section-hidden");
	
	if (section.pos) {
		var sectionTitle = document.createElement("p");
		sectionTitle.classList.add("tr_t__sectionTitle");
		sectionTitle.appendChild(document.createTextNode(section.pos));
		sectionNode.appendChild(sectionTitle);
	}
	if (section.tr) {sectionNode.appendChild(createSectionTranslationsNode(section.tr));}
	
	return sectionNode;
}
function createTooltipNode() {
	if (document.getElementById("translateTooltip")) {
		document.getElementById("translateTooltip").parentNode.removeChild(document.getElementById("translateTooltip"));
	}
	var tooltip = document.createElement("div");
	tooltip.classList.add("tr_t", "tr_t-hidden");
	tooltip.id = "translateTooltip";
	document.body.appendChild(tooltip);
	
	var tooltipBody = document.createElement("div");
	tooltipBody.classList.add("tr_t__tb");
	tooltip.appendChild(tooltipBody);
	
	posessedTooltip(tooltip, tooltipBody);
	tooltipBody.appendChild(createLoader());
	tooltip.classList.remove("tr_t-hidden");
	return tooltip;
}
function createLoader() {
	var loader = document.createElement("div");
	loader.classList.add("tr_t__lc");
	var l1 = document.createElement("div");
	l1.classList.add("tr_t__lc__l1");
	loader.appendChild(l1);
	var l2 = document.createElement("div");
	l2.classList.add("tr_t__lc__l2");
	loader.appendChild(l2);
	var l3 = document.createElement("div");
	l3.classList.add("tr_t__lc__l3");
	loader.appendChild(l3);
	
	return loader;
}
function addDictionaryToTooltip(defs) {
	var tooltip = document.getElementById("translateTooltip");
	if (!tooltip) {
		tooltip = createTooltipNode();
	}
	var loader = document.getElementsByClassName("tr_t__lc")[0];
	if (loader) {loader.parentNode.removeChild(loader);}
	var tooltipBody = document.getElementsByClassName("tr_t__tb")[0];
	for (var i=0, def; i<defs.length; i++) {
		def = defs[i];
		var sectionNode = createSectionNode(def);
		tooltipBody.appendChild(sectionNode);
		revealSection(sectionNode, i*100);	
	}
}
function revealSection(section, delay) {
	window.setTimeout(function() {
		section.classList.remove("tr_t__section-hidden");
		section.classList.add("tr_t__section");
	}, delay);
}
function addTranslationToTooltip(text) {
	var tooltip = document.getElementById("translateTooltip");
	if (!tooltip) {
		tooltip = createTooltipNode();
	}
	var loader = document.getElementsByClassName("tr_t__lc")[0];
	if (loader) {loader.parentNode.removeChild(loader);}
	var tooltipBody = document.getElementsByClassName("tr_t__tb")[0];
	tooltipBody.appendChild(createTranslationNode(text));	
}
function addErrorToTooltip() {
	var tooltip = document.getElementById("translateTooltip");
	if (!tooltip) {
		tooltip = createTooltipNode();
	}
	var loader = document.getElementsByClassName("tr_t__lc")[0];
	if (loader) {loader.parentNode.removeChild(loader);}
	var tooltipBody = document.getElementsByClassName("tr_t__tb")[0];
	var errNode = document.createElement("div");
	errNode.classList.add("tr-t__errMsg");
	errNode.appendChild(document.createTextNode(chrome.i18n.getMessage("errMsg")));
	tooltipBody.appendChild(errNode);
}

function translate(msg) {
	chrome.runtime.sendMessage(msg);
	//port.postMessage(msg);
	createTooltipNode();
}
function posessedTooltip(tooltip, tooltipBody) {
	var rRect = window.getSelection().getRangeAt(0).getBoundingClientRect();
	var bRect = document.body.getBoundingClientRect();
	var tRect = tooltip.getBoundingClientRect();

	var w = tooltip.style.width = 160;
	var x = rRect.left - (w - rRect.width)/2;
	var y = 0;
	if (rRect.top - 300 - 10 > 0) {
		y = rRect.top - tRect.height - 10;
		tooltipBody.classList.add("tr_t__tb-bottom");
	}
	else {
		y = rRect.top + rRect.height + 10;
		tooltipBody.classList.add("tr_t__tb-top");
	}
	var top = window.scrollY + y;
	var left = x+w+30>bRect.width ? bRect.width-w-30 : x;

	tooltip.style.left = left + "px";
	tooltip.style.top = top + "px";
}
function nodeContainTarget(targetNode, node) {
	if (targetNode == node) {return true;}
	else {
		if (targetNode.parentNode) {return nodeContainTarget(targetNode.parentNode, node);}
		return false;
	}
}
	
function clickHandler(event) {
	if (document.getElementById("translateTooltip")) {
		if (!nodeContainTarget(event.target, document.getElementById("translateTooltip"))) {
			document.body.removeChild(document.getElementById("translateTooltip"));
		}
	}
}
function dbclickHandler(event) {
	if (window.getSelection() && 
		!window.getSelection().toString().match(/(\d+)/) &&
		!nodeContainTarget(event.target, document.getElementById("translateTooltip"))) {
		translate(window.getSelection().toString());
	}
}
function keydownHandler(event) {
	console.log(event);
	if (window.getSelection() && event.altKey && event.keyCode === 18) {
		translate(window.getSelection().toString());
	}
}