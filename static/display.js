openDisplayMode.addEventListener("click", () => {
    // switchMultipleSections(displayMode, groupScatter)
    // showFullscreen(groupScatter)
    fullGroupScatter.innerHTML = groupScatter.innerHTML;
    fullGroupScatter.querySelector("#add-group").remove()
    showFullscreen(fullGroupScatter)
    switchSection(displayMode)
})

closeDisplayMode.addEventListener("click", () => {
    hideFullscreen(fullGroupScatter)
    switchSection(editGroupSection)
})


let rainbowOn = false;

let rainbow = function() {
  
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

document.addEventListener("keypress", function(event) {
    if (event.key === "~") {
        if (!rainbowOn) {
            rainbowInterval = setInterval(rainbow, 1000)
            rainbowOn = true;
        } else {
            endRainbow()
            rainbowOn = false;
        }
    }
  });
  
