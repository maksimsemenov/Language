/* global window */
/* global chrome */
/* global document */

var port = chrome.runtime.connect();

port.postMessage(window.getSelection().toString());
port.onMessage.addListener(handleResponse);


var range = window.getSelection().getRangeAt(0),
	rangeRect = range.getBoundingClientRect();

function handleResponse(response) {
	if (response.def) {
		
		createTooltipNode(response.def);	
	}
	else {
		console.log("Error: incorect response from server");
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
	sectionTranslation.classList.add("tooltip__sectionTranslation");
	sectionTranslation.appendChild(document.createTextNode(trString));
	
	return sectionTranslation;
}
function createSectionNode(section) {
	var sectionNode = document.createElement("div");
	sectionNode.classList.add("tooltip__section");
	
	if (section.pos) {
		var sectionTitle = document.createElement("p");
		sectionTitle.classList.add("tooltip__sectionTitle");
		sectionTitle.appendChild(document.createTextNode(section.pos));
		sectionNode.appendChild(sectionTitle);
	}
	if (section.tr) {sectionNode.appendChild(createSectionTranslationsNode(section.tr));}
	
	return sectionNode;
}
function createTooltipNode(defs) {
	var tooltip = document.createElement("div");
	tooltip.classList.add("tooltip");
	document.body.appendChild(tooltip);

	for (var i=0, def; i<defs.length; i++) {
		def = defs[i];			
		tooltip.appendChild(createSectionNode(def));			
	}
	
	var bodyRect = document.body.getBoundingClientRect();

	var w = tooltip.style.width = 160;
	var h = tooltip.style.height;
	var x = rangeRect.left - (w - rangeRect.width)/2;
	var y = rangeRect.top - h - 10;
	
	tooltip.style.left = x+w+30>bodyRect.width ? bodyRect.width-w-30 : x;
	tooltip.style.top = y<0 ? rangeRect.top + rangeRect.height + 10 : y;	

	console.log(tooltip.getBoundingClientRect(), bodyRect, rangeRect);
	
	
	
	return tooltip;
}
	
	
	