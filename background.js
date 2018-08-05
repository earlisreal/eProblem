var hi = 5000, low = 4000;
var solvedCount = [];
var added = [];
var indexA, indexB;
var statistics;

chrome.browserAction.disable();

if (localStorage.getItem("problemStatus") == null) {
	localStorage.setItem("problemStatus", "pending");
}

if (isNewDay()) {
	localStorage.setItem("problemStatus", "pending");
	localStorage.setItem("lastCheckDate", getCurrentDate());
}
else {

}

getSolvedCount();

updatePopupIcon();

function getSolvedCount() {
	sendRequest(API_PROBLEMS, function(response) {
		// console.log(response);
		statistics = response.result.problemStatistics;
		problems = response.result.problems;
		// Sort by Solved Count
		statistics.sort(function(a, b) {
			return a.solvedCount - b.solvedCount;
		});

		// Cache the solved count
		for (var i = 0; i < statistics.length; ++i) {
			var p = statistics[i];
			solvedCount[p.contestId + p.index] = p.solvedCount;
		}

		getUserLevel();
	});
}

function getUserLevel() {
	chrome.storage.sync.get(['handle'], function(result) {
		// console.log(result);
		if (result.handle != null) {
			sendRequest(API_USER_STATUS +result.handle, function(response) {
				stat = response.result;
				var statistics = [];
				for (var i = 0; i < stat.length; ++i) {
					if (stat[i].verdict == "OK") {
						var pi = stat[i].problem.contestId + stat[i].problem.index;
						if (added[pi] == false) {
							if (solvedCount[pi] != null) {
								statistics.push(solvedCount[pi]);
								added[pi] = true;
							}
						}
					}
				}

				// Calculate mean, median, Hi / Low Indexes
				calculate(statistics);

				console.log("Hi: " + hi);
				console.log("Low: " + low);

				// Use Hi and Low
				// Get sorted statistics by userSolved
				getHiLowIndex();
			});
		}
	});
}

function calculate(statistics) {
	statistics.sort(function(a, b) {return a - b});
	var len = statistics.length;
	if (len < 1) return;

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

function getHiLowIndex() {
	sendRequest(API_PROBLEMS, function(response) {
		var l = 0, r = statistics.length - 1;
		while (l < r) {
			var mid = Math.floor((l + r) / 2);
			if (statistics[mid].solvedCount >= low) {
				r = mid;
			}
			else {
				l = mid + 1;
			}
		}
		indexA = r;

		console.log("A index: " +indexA);

		l = 0, r = statistics.length - 1;
		while (l < r) {
			var mid = Math.floor((l + r + 1) / 2);
			if (statistics[mid].solvedCount <= hi) {
				l = mid;
			}
			else {
				r = mid - 1;
			}
		}
		indexB = l;

		console.log("B index: " +indexB);
	});
}

function round(x, digits) {
	var roundTo = Math.pow(10, digits);
	x = Math.floor(x / roundTo);
	x *= roundTo;
	return x;
}
