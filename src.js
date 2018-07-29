// var API_PROBLEMS = "http://codeforces.com/api/problemset.problems";
var API_PROBLEMS = "problemset.problems";
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

function changePopupIcon() {
	chrome.browserAction.setIcon({path: 'images/' +localStorage.getItem('problemStatus') +'.png'}, function() {
	});
}

function random(mn, mx) {
	return Math.floor(Math.random() * (mx - mn)) + mn;
}
