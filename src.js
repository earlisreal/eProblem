var API_PROBLEMS = "http://codeforces.com/api/problemset.problems";
// var API_PROBLEMS = "problemset.problems";
var API_USER_STATUS = "http://codeforces.com/api/user.status?handle=";
var FLEXIBILITY = 400;

function sendRequest(url, callback) {
	var xhttp = new XMLHttpRequest();
	xhttp.responseType = 'json';
	xhttp.onreadystatechange = function(result) {
		if (this.readyState == 4 && this.status == 200) {
			callback(this.response);
		}
	};
	xhttp.open("GET", url, true);
	xhttp.send();
}

function getCurrentDate() {
	var d = new Date();
	return d.getFullYear() + "-" + d.getMonth() + "-" + d.getDate();
}

function isNewDay() {
	var currentDate = getCurrentDate();
	var lastCheckDate = localStorage.getItem('lastCheckDate');
	if (lastCheckDate != currentDate) {
		return true;
	}
	return false;
}

function hasHandle() {
	return localStorage.getItem('handle') != null;
}

function updatePopupIcon() {
	chrome.browserAction.setIcon({path: 'images/' +localStorage.getItem('problemStatus') +'.png'}, function() {
	});
}

function random(mn, mx) {
	return Math.floor(Math.random() * (mx - mn)) + mn;
}

function round(x, digits) {
	var roundTo = Math.pow(10, digits);
	x = Math.floor(x / roundTo);
	x *= roundTo;
	return x;
}
