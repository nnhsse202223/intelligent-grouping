openDisplayMode.addEventListener("click", () => {
    // switchMultipleSections(displayMode, groupScatter)
    // showFullscreen(groupScatter)
    fullGroupScatter.innerHTML = groupScatter.innerHTML;
    fullGroupScatter.querySelector("#add-group").remove()
    fullGroupScatter.querySelectorAll('.group-container').forEach(child => {
        const closeBtn = child.querySelector('.close-group');
        if (closeBtn) {
          closeBtn.remove();
        }
      });
      
    showFullscreen(fullGroupScatter)
    switchSection(displayMode)
})

closeDisplayMode.addEventListener("click", () => {
    hideFullscreen(fullGroupScatter)
    switchSection(editGroupSection)
})