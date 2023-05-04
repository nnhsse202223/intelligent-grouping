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