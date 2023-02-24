// (() => {
// Elements \\

//-------\\

// Data (local) \\
let classes = {}
let state = {mode: 0, info: {}}
/*
0 = logged out
1 = dashboard
2 = adding class manually
3 = editing class manually
4 = class view
5 = create group
6 = edit group
7 = seating chart
8 = student responses overview
*/
//-------\\

startLoad()

/*
 * @param {number} mode - The mode to set the app to
 * @param {object} info - Any additional information to pass to the app
 */
function setState(mode, info={}) {
  state.mode = mode
  state.info = info
}

/*
 * @description - resets the entire app
 */
function resetApp() {
  username.innerText = ""
  clearDiv(classListDiv)
  switchSection(welcomeSection)
  classes = []
}