var handle;

document.addEventListener('DOMContentLoaded', function () {
	// localStorage.clear();
	chrome.storage.sync.get(['handle'], function(result) {
		if (result.handle == null) {
			showElement(document.getElementById('handle-form'));
			document.getElementById('save').onclick = function(element) {
				saveHandle();
			}
		}
		else {
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
	getSubmissions(function(result) {
		var submissions = this.response.result;
		sendRequest(API_PROBLEMS, function(response) {
			// Parse result
			var result = response.result;
			var problems = response.problems;
			var statistics = response.problemStatistics;

			var randomProblem;
			// Get Random Problem
			// Check if the problem is solved, else generate another random
			while (true) {

				var index = Math.floor(Math.random() * problems.length);
				randomProblem = problems[index];
				if (getVerdict(randomProblem, submissions) != 0) break;
			}

			localStorage.setItem('lastProblem', JSON.stringify(randomProblem));

			displayProblem(randomProblem);
		});
	});
}

function displayProblem(problem) {
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

	getSubmissions(function(result) {
		if (this.readyState == 4 && this.status == 200) {
			var submissions = this.response.result;

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
		}
	});
}

function getSubmissions(callback) {
	var submissions;
	sendRequest("http://codeforces.com/api/user.status?handle=" +handle, callback);
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
