var bg;
var handle;

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	if (request.msg == "ready") {
		showMain();
	}
});

document.addEventListener('DOMContentLoaded', function () {
	// reset();

	// Get the background page
	chrome.runtime.getBackgroundPage(function(background) {
		bg = background;
		console.log(bg);

		// INITIALIZATIONS
		handle = localStorage.getItem('handle');
		document.getElementById('handle').value = handle;
		document.getElementById('settings').onclick = function() {
			showElement(document.getElementById('handle-form'));
			hideElement(document.getElementById('main-div'));
		}

		// MAIN LOGIC STARTS HERE
		if (handle == null) {
			// Show Get user handle input
			console.log("Has no handle");
			showElement(document.getElementById('handle-form'));
			document.getElementById('save').onclick = function(element) {
				saveHandle();
			}
		}
		else {
			console.log("display problem from content load");
			displayProblem(bg.getProblem());
		}

	});

});

function reset() {
	localStorage.clear();
	localStorage.setItem("problemStatus", "pending");
}

function saveHandle() {
	console.log("save handle");
	newHandle = document.getElementById('handle').value;
	sendRequest("http://codeforces.com/api/user.info?handles=" + newHandle, function (result){
			var resultStatus = result.status;
			if (resultStatus == "OK") {
				if (newHandle == handle) {
					// Go back
					showMain();
				}
				else {
					showElement(document.getElementById('loading'));
					localStorage.setItem('handle', newHandle);
					handle = newHandle;

					bg.getUserLevel(handle);
				}
				hideElement(document.getElementById('handle-form'));
			}
			else {
				console.log("Invalid Handle!");
				// Invalid Handle
				// TODO : Change the textbox to red, then add error label
			}
	});
}

function displayProblem(problem) {
	console.log(problem);
	// Create the Link
	var link = document.getElementById('problem');
	link.setAttribute('href', "http://codeforces.com/problemset/problem/" + problem.contestId + "/" + problem.index);
	link.innerHTML = problem.name;

	updateStatus();
}

function updateStatus() {
	var problemStatus = localStorage.getItem("problemStatus");
	if (problemStatus == "solved") {
		hideElement(document.getElementById('pending'));
		showElement(document.getElementById('solved'));
		showMain();
		return;
	}

	hideElement(document.getElementById('pending'));
	showElement(document.getElementById(problemStatus));
	updatePopupIcon();
	showMain();
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
