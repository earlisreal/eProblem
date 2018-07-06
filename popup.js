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
	var lastCheckDate = localStorage.getItem('lastCheckDate');
	if (lastCheckDate == null || lastCheckDate != currentDate) {
		localStorage.setItem('lastCheckDate', currentDate);
		getProblemOfTheDay();
	}
	else {
		displayProblem(JSON.parse(localStorage.getItem('lastProblem')));
	}
}

function saveHandle() {
	newHandle = document.getElementById('handle').value;
	if (newHandle == handle) {
		// TODO
		// Do something Here
	}
	chrome.storage.sync.set({handle: newHandle}, function() {
		getProblem();
	});
}

function getCurrentDate() {
	var d = new Date();
	return d.getFullYear() + "-" + d.getMonth() + "-" + d.getDate();
}

function getProblemOfTheDay() {
	getSubmissions(function(result) {
		if (this.readyState == 4 && this.status == 200) {
			var submissions = this.response.result;
			sendRequest("http://codeforces.com/api/problemset.problems", function(result) {
				if (this.readyState == 4 && this.status == 200) {
					// Parse result
					var result = this.response.result;
					var problems = result.problems;
					var statistics = result.problemStatistics;

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
				}
			});
		}
	});
}

function sendRequest(url, callback) {
	var xhttp = new XMLHttpRequest();
	xhttp.responseType = 'json';
	xhttp.onreadystatechange = callback;
	xhttp.open("GET", url, true);
	xhttp.send();
}

function displayProblem(problem) {
	// Create the Link
	var link = document.getElementById('problem');
	link.setAttribute('href', "http://codeforces.com/problemset/problem/" + problem.contestId + "/" + problem.index);
	link.innerHTML = problem.name;

	checkSolved(problem);
}

function checkSolved(problem) {
	if (localStorage.getItem("SOLVED" +problem.contestId +"-" +problem.index)) {
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
				localStorage.setItem("SOLVED" +problem.contestId +"-" +problem.index, true);

				hideElement(document.getElementById('pending'));
				showElement(document.getElementById('solved'));
			}
			else if (verdict == 1){
				hideElement(document.getElementById('pending'));
				showElement(document.getElementById('wrong-answer'));
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
