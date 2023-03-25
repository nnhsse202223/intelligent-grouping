openDisplayMode.addEventListener("click", () => {
    // switchMultipleSections(displayMode, groupScatter)
    // showFullscreen(groupScatter)
    fullGroupScatter.innerHTML = groupScatter.innerHTML;
    showFullscreen(fullGroupScatter)
    switchSection(displayMode)
})