let rainbowInterval;
function rainbow(startStop) {

    let startRainbow = function() {
        // Loop through all div elements and set background color and transition
        var divs = document.querySelectorAll("div");
        for (var i = 0; i < divs.length; i++) {
          divs[i].style.backgroundColor = "rgb(" + Math.floor(Math.random() * 255) + "," + Math.floor(Math.random() * 255) + "," +  Math.floor(Math.random() * 255) + ")";
          divs[i].style.transition = "background-color 1s";
        }
    }
    
    let endRainbow = function() {
        var divs = document.querySelectorAll("div");
        for (var i = 0; i < divs.length; i++) {
          divs[i].style.backgroundColor = "";
          divs[i].style.transition = "";
        }
        clearInterval(rainbowInterval);
    }

    if (startStop === "start") {
        rainbowInterval = setInterval(startRainbow, 1000);
    } else if (startStop === "stop") {
        endRainbow();
    }
}

function createConsoleModal(modal, modalExit) {
    modal.classList.add("console-modal")
    modal.innerHTML += "<p>Enter Command:</p>"
    let consoleInput = document.createElement("input")
    consoleInput.setAttribute("type", "text")
    consoleInput.value = "/"
    consoleInput.addEventListener("keypress", function(event) {
        if (event.key === "Enter") {
            runConsoleCommand(consoleInput.value)
            modalExit()
        }
    })
    modal.appendChild(consoleInput)
}

document.addEventListener("keypress", function(event) {
    if(event.key === "~") {
        createModal("xsmall", createConsoleModal)
    }
})

function runConsoleCommand(command) {
    switch (command) {
        case "/rainbow":
            rainbow("start");
            break;
        case "/endrainbow":
            rainbow("stop");
            break;
    }
}
  
