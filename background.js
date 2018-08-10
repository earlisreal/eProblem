// On Page == codeforces and submission problem == current problem Update Status

// MAIN LOGIC STARTS HERE

var hi = 5000, low = 4000;
var solvedCount = [];
var added = [];
var indexA, indexB;
var statistics;
var handle;
var isDisabled = true;

// The problem of the day
var problem;

// TODO : Find event that will check problem simultaniously

chrome.browserAction.disable();

if (localStorage.getItem("problemStatus") == null) {
	localStorage.setItem("problemStatus", "pending");
}

handle = localStorage.getItem('handle');

if (isNewDay()) {
	console.log("its a new Day!");
	localStorage.setItem("problemStatus", "pending");
	getSolvedCount();
	updatePopupIcon();
}
else {
	console.log("same day!");
	checkSolved();
}

function getSolvedCount() {
	console.log("get solved count");
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

		if (handle != null) {
			getUserLevel(handle);
		}
		else {
			console.log("handle is null");
			isDisabled = false;
			chrome.browserAction.enable();
		}
	});
}

function getUserLevel(handle) {
	console.log("get user level");
	sendRequest(API_USER_STATUS +handle, function(response) {
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

		// Get problem of the day
		getProblemOfTheDay();
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
}

function getProblemOfTheDay() {
	console.log("Get problem of the day");
	sendRequest(API_USER_STATUS +handle, function(response) {
		var submissions = response.result;

		// Get Random Problem
		// Check if the problem is solved, else get tougher problem
		getHiLowIndex();
		var index = Math.floor(random(indexA, indexB));
		console.log(index);
		while (getVerdict(statistics[index], submissions) == 0) {
			--index;
			if (index < 0) {
				// TODO:
			}
		}

		// Search the problem using index and contestId
		var rps = statistics[index];
		var randomProblem;
		for (var i = 0; i < problems.length; ++i) {
			if (problems[i].index == rps.index && problems[i].contestId == rps.contestId) {
				randomProblem = problems[i];
				break;
			}
		}

		localStorage.setItem('lastProblem', JSON.stringify(randomProblem));
		localStorage.setItem("problemStatus", "pending");
		localStorage.setItem("lastCheckDate", getCurrentDate());

		problem = randomProblem;

		if (isDisabled) {
			chrome.browserAction.enable();
		}
		else {
			chrome.runtime.sendMessage({
				msg: "ready", 
				data: {
				}
			});
		}
	});
}

function checkSolved() {
	problem = JSON.parse(localStorage.getItem('lastProblem'));
	sendRequest(API_USER_STATUS +handle, function(response) {
		var submissions = response.result;

		var verdict = getVerdict(problem, submissions);
		console.log("verdict: " +verdict);
		if (verdict == 0) {
			localStorage.setItem("problemStatus", "solved");
		}
		else if (verdict == 1){
			localStorage.setItem("problemStatus", "wrong");
		}

		updatePopupIcon();
		chrome.browserAction.enable();
	});
}

function getVerdict(problem, submissions) {
	var verdict = 2;
	for (var i = 0; i < submissions.length; ++i) {
		var submissionProblem = submissions[i].problem;
		if (submissionProblem.contestId == problem.contestId && submissionProblem.index == problem.index) {
			if (submissions[i].verdict == "OK") {
				return 0;
			}
			else {
				verdict = 1;
			}
		}
	}
	return verdict;
}

function getProblem() {
	return problem;
}
