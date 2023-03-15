openDisplayMode.addEventListener("click", () => {
    // mainSidebar.style.display = "none";
    showFade(displayMode)
    showFade(groupScatter)
    fullscreen(groupScatter)
    // for(const child in groupScatter.children) {
        // displayGroupScatter.insertBefore(child, null)
    // }
    switchSection(displayMode)
})