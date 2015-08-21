/* global window */
/* global chrome */
/* global document */

var port = chrome.runtime.connect();

port.postMessage(window.getSelection().toString());
port.onMessage.addListener(handleResponse);

document.body.addEventListener("click", clickHandler, false);

var range = window.getSelection().getRangeAt(0),
	rangeRect = range.getBoundingClientRect();

function handleResponse(response) {
	if (response.def && response.def.length !==0) {
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
	sectionTranslation.classList.add("translate_tooltip__sectionTranslation");
	sectionTranslation.appendChild(document.createTextNode(trString));
	
	return sectionTranslation;
}
function createSectionNode(section) {
	var sectionNode = document.createElement("div");
	sectionNode.classList.add("translate_tooltip__section");
	
	if (section.pos) {
		var sectionTitle = document.createElement("p");
		sectionTitle.classList.add("translate_tooltip__sectionTitle");
		sectionTitle.appendChild(document.createTextNode(section.pos));
		sectionNode.appendChild(sectionTitle);
	}
	if (section.tr) {sectionNode.appendChild(createSectionTranslationsNode(section.tr));}
	
	return sectionNode;
}
function createTooltipNode(defs) {
	if (document.getElementById("translateTooltip")) {
		document.getElementById("translateTooltip").parentNode.removeChild(document.getElementById("translateTooltip"));
	}
	var tooltip = document.createElement("div");
	tooltip.classList.add("translate_tooltip", "translate_tooltip-hidden");
	tooltip.id = "translateTooltip";
	document.body.appendChild(tooltip);

	for (var i=0, def; i<defs.length; i++) {
		def = defs[i];			
		tooltip.appendChild(createSectionNode(def));			
	}
	
	var bodyRect = document.body.getBoundingClientRect();
	var tooltipRect = tooltip.getBoundingClientRect();

	var w = tooltip.style.width = 160;
	var x = rangeRect.left - (w - rangeRect.width)/2;
	var y = rangeRect.top - tooltipRect.height - 10;
	if (y<0) {y = rangeRect.top + rangeRect.height + 10;}
	var top = window.scrollY + y;
	var left = x+w+30>bodyRect.width ? bodyRect.width-w-30 : x;
	
	tooltip.style.left = left + "px";
	tooltip.style.top = top + "px";
	

	console.log(window.scrollY, tooltipRect, bodyRect, rangeRect);	
	tooltip.classList.remove("translate_tooltip-hidden");
}

function clickHandler(event) {
	if (event.target != document.getElementById("translateTooltip") && document.getElementById("translateTooltip")) {
		document.body.removeChild(document.getElementById("translateTooltip"));
	}
}
	
	
	