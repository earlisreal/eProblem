var handle;

document.addEventListener('DOMContentLoaded', function () {
	// localStorage.clear();
	chrome.storage.sync.get(['handle'], function(result) {
		if (result.handle == null) {
			console.log("Has no handle");
			showElement(document.getElementById('handle-form'));
			document.getElementById('save').onclick = function(element) {
				saveHandle();
			}
		}
		else {
			console.log("Has a handle");
			showElement(document.getElementById('loading'));
			handle = result.handle;
			document.getElementById('handle').value = handle;

			getProblem();
		}
	}); 

	document.getElementById('settings').onclick = function() {
		showElement(document.getElementById('handle-form'));
		hideElement(document.getElementById('main-div'));
	}
});

function getProblem() {
	var currentDate = getCurrentDate();
	var lastCheckDate = localStorage.getItem("lastCheckDate");
	if (lastCheckDate != currentDate) {
		localStorage.setItem("problemStatus", "pending");
		localStorage.setItem("lastCheckDate", currentDate);
		getProblemOfTheDay();
	}
	else {
		console.log("displaying problem");
		displayProblem(JSON.parse(localStorage.getItem('lastProblem')));
	}
}

function saveHandle() {
	console.log("save handle");
	newHandle = document.getElementById('handle').value;
	sendRequest("http://codeforces.com/api/user.info?handles=" + newHandle, function (result){
			var resultStatus = result.status;
			if (resultStatus == "OK") {
				if (newHandle == handle) {
					// TODO
					// Do something Here
				}
				chrome.storage.sync.set({handle: newHandle}, function() {
					getProblem();
				});
			}
			else {
				// Invalid Handle
				// TODO : Change the textbox to red, then add error label
			}
	});
}

function getProblemOfTheDay() {
	console.log("Get problem of the day");
	sendRequest(API_USER_STATUS +handle, function(response) {
		var submissions = response.result;

		// Get Random Problem
		// Check if the problem is solved, else get tougher problem
		var indexA, indexB;
		chrome.runtime.getBackgroundPage(function(background){
			background.indexA;
			console.log("index a: " + background.indexA);
			console.log("index b: " + background.indexB);
			var index = Math.floor(random(background.indexA, background.indexB));
			console.log(index);
			while (getVerdict(background.statistics[index], submissions) != 0) {
				--index;
				if (index < 0) {
					// TODO:
				}
			}

			// Search the problem using index and contestId
			var rps = background.statistics[index];
			var problems = background.problems;
			var randomProblem;
			for (var i = 0; i < problems.length; ++i) {
				if (problems[i].index == rps.index && problems[i].contestId == rps.contestId) {
					randomProblem = problems[i];
					break;
				}
			}

			localStorage.setItem('lastProblem', JSON.stringify(randomProblem));

			displayProblem(randomProblem);
		});
	});
}

function displayProblem(problem) {
	console.log(problem);
	// Create the Link
	var link = document.getElementById('problem');
	link.setAttribute('href', "http://codeforces.com/problemset/problem/" + problem.contestId + "/" + problem.index);
	link.innerHTML = problem.name;

	checkSolved(problem);
}

function checkSolved(problem) {
	var problemStatus = localStorage.getItem("problemStatus");
	if (problemStatus == "solved") {
		hideElement(document.getElementById('pending'));
		showElement(document.getElementById('solved'));
		showMain();
		return;
	}

	sendRequest(API_USER_STATUS +handle, function(response) {
		var submissions = response.result;

		var verdict = getVerdict(problem, submissions);
		if (verdict == 0) {
			localStorage.setItem("problemStatus", "solved");

			hideElement(document.getElementById('pending'));
			showElement(document.getElementById('solved'));
			changePopupIcon();
		}
		else if (verdict == 1){
			hideElement(document.getElementById('pending'));
			showElement(document.getElementById('wrong-answer'));
			localStorage.setItem("problemStatus", "wrong");
			changePopupIcon();
		}

		showMain();
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

function showMain() {
	showElement(document.getElementById('main-div'));
	hideElement(document.getElementById('loading'));
}

function showElement(element) {
	element.style.display = "block"; 
}

function hideElement(element) {
	element.style.display = "none";
}

function getOption() {
	// get codeforces username on option
}
