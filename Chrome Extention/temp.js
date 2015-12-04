"commands": {
	"translate": {
		"suggested_key": {
			"default": "Alt+T",
				"mac": "Alt+T"
		},
			"description": "Translate selected text"
	}
}

function getAutoTranslations () {
	var arrReq = [], arr=[];
	var result = {};
	for (var key in env.langs) {
		var req = env.yandexTranslateUrl + "?key=" + env.yandexTranslateApiKeys[0];
		req += "&lang=ru-" + key;
		req += "&text=" + encodeURIComponent("Переводить на");
		req += "&format=plain&options=1";

		arrReq.push(req);
		arr.push(key);
	}
	Promise.all(arrReq.map(getJSON)).then(function(resArr) {
		for (var i=0; i<arr.length; i++) {
			result[arr[i].toString()] = resArr[i].text[0];
		}
	}).catch(function(err) {console.log(err);});
}	