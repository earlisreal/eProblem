if (localStorage.getItem("problemStatus") == null) {
	localStorage.setItem("problemStatus", "pending");
}

var currentDate = getCurrentDate();
var lastCheckDate = localStorage.getItem('lastCheckDate');
if (lastCheckDate != currentDate) {
	localStorage.setItem("problemStatus", "pending");
	localStorage.setItem("lastCheckDate", currentDate);
}

var hi = 5000, low = 4000;
var solvedCount = [];
var added = [];

getAllUserSD();

getUserLevel();

changePopupIcon();

function getAllUserSD() {
	sendRequest(API_PROBLEMS, function(response) {
		var statistics = [];
		var problem = response.result.problemStatistics;
		for (var i = 0; i < problem.length; ++i) {
			var p = problem[i];
			statistics.push(p.solvedCount);
			solvedCount[p.contestId + p.index] = p.solvedCount;
		}
		// console.log(solvedCount);
		// calculate(statistics);
	});
}

function getUserLevel() {
	console.log("getting user level");
	chrome.storage.sync.get(['handle'], function(result) {
		console.log(result);
		if (result.handle != null) {
			sendRequest(API_USER_STATUS +result.handle, function(response) {
				console.log(response);
				var stat = response.result;
				var statistics = [];
				for (var i = 0; i < stat.length; ++i) {
					if (stat[i].verdict == "OK") {
						var pi = stat[i].problem.contestId + stat[i].problem.index;
						if (added[pi] == null || !added[pi]) {
							if (solvedCount[pi] != null) {
								statistics.push(solvedCount[pi]);
								added[pi] = true;
							}
						}
					}
				}

				calculate(statistics);

				console.log("Hi: " + hi);
				console.log("Low: " + low);
				// TODO :
				var indexA = -1, indexB = -1;
				// Use Hi and Low
				for (var i = 0; i < problems.length; ++i) {
					if (problems[i].solvedCount) {

					}
					if (indexA == -1) {

					}
				}
			});
		}
	});
}

function calculate(statistics) {
	statistics.sort(function(a, b) {return a - b});
	console.log(statistics);
	var len = statistics.length;
	var mode = [];

	// Get Arithmetic mean of solvedCount
	var mean = 0;
	for (var i = 0; i < len; ++i) {
		mean += statistics[i];
	}
	mean /= len;
	console.log("Mean: " + mean);

	var median = statistics[Math.floor(len / 2)];
	console.log("Median: " + median);

	var userMode = 0;

	// Get the Standard Deviation
	var sd = 0;
	for (var i = 0; i < len; ++i) {
		var x = statistics[i];
		sd += Math.pow(x - mean, 2);
	}
	sd /= len;
	console.log("Variance: " + sd);
	sd = Math.sqrt(sd);
	console.log("Standard Deviation: " + sd);

	hi = round(Math.min(median, mean), 2);
	low = hi - FLEXIBILITY;
}

function round(x, digits) {
	var roundTo = Math.pow(10, digits);
	x = Math.floor(x / roundTo);
	x *= roundTo;
	return x;
}
