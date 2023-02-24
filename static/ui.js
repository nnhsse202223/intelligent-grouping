let modalExit

/*
 * @param {string} size - The size of the modal (small, medium, large)
 * @param {function} construct - The function to construct the modal
 * @param {function} cancel - The function to run when the modal is closed
 * @description - Creates a modal
 * @returns {function} modalExit - The function to close the modal
 */
function createModal(size, construct, cancel = () => {}) {
  const blind = document.createElement("div")
  blind.classList = "modal-blind"
  const modal = document.createElement("div")
  modal.classList = `modal ${size}`
  const close = document.createElement("i")
  close.classList = "fa fa-times modal-close"
  modalExit = () => {
    hideFade(blind)
    hideFade(modal)
    setTimeout(() => {
      app.removeChild(blind)
      app.removeChild(modal)
    }, 300)
    cancel()
  }
  blind.addEventListener("click", modalExit)
  close.addEventListener("click", modalExit)
  modal.appendChild(close)
  app.appendChild(blind)
  construct(modal, modalExit)
  app.appendChild(modal)
  blind.offsetHeight
  modal.offsetHeight
  showFade(blind)
  showFade(modal)
  return modalExit
}

/*
 * @param div - The div to clear
 * @description - Clears the div of all children other than those with the class "persist"
 */
function clearDiv(div) {
  for (const child of Array.from(div.children)) {
    if (!child.classList || !child.classList.contains("persist")) {
      div.removeChild(child)
    }
  }
}

/*
 * @param node - The node to clone
 * @param target - The node to clone to
 * @description - Clones the node and returns the height of the clone
 * @returns {number} height - The height of the clone
 */
function getNodeHeight(node, target) {
  let height, clone = node.cloneNode(true)
  let parentClone = document.createElement("div")
  parentClone.style.cssText = `height:${target.clientHeight}; width: ${target.clientWidth}; position:fixed; top:-9999px; opacity:0;`
  parentClone.appendChild(clone)
  document.body.appendChild(parentClone)
  height = clone.clientHeight
  parentClone.parentNode.removeChild(parentClone)
  return height
}

/*
 * @param element - The element to show
 * @description - Shows the element with a fade in
 */
function showFade(element) {
  element.classList.add("visible")
}

/*
 * @param element - The element to hide
 * @description - Hides the element with a fade out
 */
function hideFade(element) {
  element.classList.remove("visible")
}

/*
 * @param to - The section to switch to
 * @description - Switches to the section
 */
function switchSection(to) {
  const sections = Array.from(document.getElementsByClassName("section"))
  for (const section of sections) {
    if (section != to) {
      hideFade(section)
    }
  }
  showFade(to)
}

/*
 * @param element - The element to remove
 * @description - Removes a list
 */
function removeList(element) {
  element.style.height = element.clientHeight + "px"
  element.style.opacity = 1
  element.offsetHeight
  element.classList.add("hidden")
  setTimeout(() => {
    element.parentNode.removeChild(element)
  }, 300)
}

/*
 * @param element - The element to add
 * @param target - The target to add the element to
 * @description - Adds a list
 */
function addList(element, target) {
  const height = getNodeHeight(element, target)
  element.classList.add("hidden")
  element.style.height = height + "px"
  target.appendChild(element)
  element.offsetHeight
  element.classList.remove("hidden")
  setTimeout(() => {
    element.style.height = "auto"
  }, 300)
 
}

/*
 * @param errorText - The error text to display
 * @description - Creates an error message and displays it
 */
function createError(errorText) {
  const errorElement = document.createElement("p")
  errorElement.classList = "error"
  errorElement.innerText = "Error: " + errorText
  document.body.appendChild(errorElement)
  errorElement.offsetHeight
  errorElement.style.top = "55px"
  setTimeout(() => {
    errorElement.style.top = "0"
    setTimeout(() => {
      document.body.removeChild(errorElement)
    }, 600)
  }, 5000)
}

/*
 * @param func - The function to run
 * @description - Runs the function and displays a loading bar
 */
async function loadAround(func) {
  startLoad()
  await func()
  endLoad()
}

/*
 * @description - Starts the loading bar
 */
async function startLoad() {
  clearTimeout(resetLoadTimeout)
  loadingBar.style.width = "30%"
  loadingBar.style.opacity = 1
  loadingBar.style.height = "4px"
}

/*
 * @description - Ends the loading bar
 */
async function endLoad() {
  loadingBar.style.width = "100%"
  setTimeout(() => {
    loadingBar.style.height = 0
    loadingBar.style.opacity = 0
    resetLoadTimeout = setTimeout(() => {
      loadingBar.style.width = 0
      setTimeout(() => {
        loadingBar.style.opacity = 1
        loadingBar.style.height = "4px"
      }, 500)
    }, 500)
  }, 750)
}

/*
 * @description - Deselects all classes
 */
function deselectAllClasses() {
  for (const element of Array.from(classListDiv.children)) {
    element.classList.remove("selected")
  }
}

/*
 * @param text - The text to display
 * @param inputClassName - The class name of the input
 * @param value - The value of the input
 * @description - Creates a placeholder input
 * @returns {HTMLLabelElement} labelContainer - The label container
 */
function createPlaceholderInput(text, inputClassName, value="") {
  const labelContainer = document.createElement("label")
  labelContainer.classList = "label"
  const input = document.createElement("input")
  input.classList.add("input")
  input.classList.add(inputClassName)
  input.required = true
  input.value = value
  const span = document.createElement("span")
  span.innerText = text
  labelContainer.appendChild(input)
  labelContainer.appendChild(span)
  return labelContainer
}

let resetLoadTimeout