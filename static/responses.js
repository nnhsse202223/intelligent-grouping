let currentStudent;

function showResponses() {
    statusTitle.innerText = "Student Responses"
    switchSection(responsesSection)
    setState(8, {id: state.info.id/*, groupingId: grouping.id, currentGroup:grouping*/})

    clearSideText(document.getElementById("given-responses"))
    let info = document.createElement('h2')
    info.innerHTML = "Click on a Student"
    document.getElementById("given-responses").append(info)
    appendClassStudents();
}

function somethingOrOther(){
  for(let i = 0; i < classes[state.info.id].obj.students.length; i++) {
    
    console.log(classes[state.info.id].obj.students[i])
    console.log(classes[state.info.id].obj.students[i].preferences)
  }
}

/***
 * Adds student names to dropdown menu
 */
function appendClassStudents(){
  while(document.getElementById("student-selector").firstChild) {
    document.getElementById("student-selector").removeChild(document.getElementById("student-selector").firstChild)
  }

  for(let i = 0; i < classes[state.info.id].obj.students.length; i++) {
    classes[state.info.id].obj.students[i]
    let newOption = document.createElement('option');
    newOption.setAttribute('id', classes[state.info.id].obj.students[i].id)
    newOption.setAttribute('index', i)
    newOption.addEventListener('click', function(){
      // updateStudentInformation(newOption.getAttribute('index'));
      currentStudent = newOption.getAttribute('index');
      reloadPreferencesDisplay(currentStudent);
    });
    newOption.innerText = classes[state.info.id].obj.students[i].first + " " + classes[state.info.id].obj.students[i].last

    document.getElementById("student-selector").appendChild(newOption)
  }
}

function clearSideText(list) {
  while(list.firstChild) {
    list.removeChild(list.firstChild);
  }
}

function updateStudentInformation(index) {

  let thisStudent = classes[state.info.id].obj.students[index]

  let list = document.getElementById("given-responses")
  clearSideText(list);

  // Preferred Students
  if(thisStudent.preferences.studentLike.length > 0) {
    let head = document.createElement('h2')
    head.innerHTML = "Preferred Classmate(s)"
    list.appendChild(head)
    for(let i = 0; i < thisStudent.preferences.studentLike[0].inputs.length; i++)
    {
      let student = findStudentById(thisStudent.preferences.studentLike[0].inputs[i])
      let info = document.createElement('li')
      info.innerHTML = `${student.first} ${student.last}`
      list.appendChild(info) 
    }
  }
  
  // Unpreferred Students
  if(thisStudent.preferences.studentDislike.length > 0) {
    let head = document.createElement('h2')
    head.innerHTML = "Unpreferred Classmate(s)"
    list.appendChild(head)
    for(let i = 0; i < thisStudent.preferences.studentDislike[0].inputs.length; i++)
    {
      let student = findStudentById(thisStudent.preferences.studentDislike[0].inputs[i])
      let info = document.createElement('li')
      info.innerHTML = `${student.first} ${student.last}`
      list.appendChild(info)
    }
  }

  // Preferred Topics
  if(thisStudent.preferences.topicLike.length > 0) {
    let head = document.createElement('h2')
    head.innerHTML = "Preferred Topic(s)"
    list.appendChild(head)
    for(let i = 0; i < thisStudent.preferences.topicLike[0].inputs.length; i++)
    {
      let topic = thisStudent.preferences.topicLike[0].inputs[i]
      let info = document.createElement('li')
      info.innerHTML = topic
      list.appendChild(info)
    }
  }

  // Unpreferred Topics
  if(thisStudent.preferences.topicDislike.length > 0) {
    let head = document.createElement('h2')
    head.innerHTML = "Unpreferred Topic(s)"
    list.appendChild(head)
    for(let i = 0; i < thisStudent.preferences.topicDislike[0].inputs.length; i++)
    {
      let topic = thisStudent.preferences.topicDislike[0].inputs[i]
      let info = document.createElement('li')
      info.innerHTML = topic
      list.appendChild(info)
    }
  }

  if(!list.firstChild) {
    let info = document.createElement('h2')
    info.innerHTML = "This student has not responded"
    list.append(info)
  }
}

function findStudentById(id){
  for(let i = 0; i < classes[state.info.id].obj.students.length; i++) {
    if(classes[state.info.id].obj.students[i].id == id) {
      return classes[state.info.id].obj.students[i]
    }
  }
}

// reloadResponses.addEventListener("click", async (e) =>{
//   //e.stopPropagation()
//   let databaseClasses = await fetch("/getClasses", {
//     method: "GET",
//     headers: {
//       "Content-Type": "application/json",
//       token: auth2.currentUser.get().getAuthResponse().id_token
//     }}).then(response => response.json())//.then((json)=> {console.log(json.classes)})
//     // console.log(classes)
//     // console.log(databaseClasses)

//     //Things surrounded by // and \\ are important notes
//     //classes structure (classes is an object where every key is a class id and the value is an object with the class object and an array of student ids)
//     //classes = {classId: {obj: classObj, element: //this is an important div element for the button for the specific class on the left panel we need to find a way to not lose this when recreating the classes array\\}
    
//     //json structure from database (json is an array of class objects)
//     //[{groupings:groupings, id:classId //<-very important... is the same as the object key in the classes array\\, name:name, period:period, students:students, _id:_id}]

//     //loops through the classes array from the GET requst (json)
//     for(let i = 0; i < databaseClasses.classes.length; i++) {
//       //recreates the classes array from the GET request restoring the old element and new class object
//       classes[databaseClasses.classes[i].id] = {element:classes[databaseClasses.classes[i].id].element, obj:databaseClasses.classes[i]}
//       // console.log(databaseClasses[i].id)
//     }
// })

async function reloadPreferencesDisplay(index) {
  console.log("reloading classes")
  //e.stopPropagation()
  let databaseClasses = await fetch("/getClasses", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      token: auth2.currentUser.get().getAuthResponse().id_token
    }}).then(response => response.json())//.then((json)=> {console.log(json.classes)})
    // console.log(classes)
    // console.log(databaseClasses)

    //Things surrounded by // and \\ are important notes
    //classes structure (classes is an object where every key is a class id and the value is an object with the class object and an array of student ids)
    //classes = {classId: {obj: classObj, element: //this is an important div element for the button for the specific class on the left panel we need to find a way to not lose this when recreating the classes array\\}
    
    //json structure from database (json is an array of class objects)
    //[{groupings:groupings, id:classId //<-very important... is the same as the object key in the classes array\\, name:name, period:period, students:students, _id:_id}]

    //loops through the classes array from the GET requst (json)
    for(let i = 0; i < databaseClasses.classes.length; i++) {
      //recreates the classes array from the GET request restoring the old element and new class object
      classes[databaseClasses.classes[i].id] = {element:classes[databaseClasses.classes[i].id].element, obj:databaseClasses.classes[i]}
      // console.log(databaseClasses[i].id)
    }

    updateStudentInformation(index)
}

// reloads classes every 10 seconds 
setInterval(() => {reloadPreferencesDisplay(currentStudent)}, 10000)

/*
SOULTION TO THE REFRESH PROBLEM \'o'/

setInterval(functionName,howeverManyMillisecondsBetweenFunctionCalls)

funtionName - function that gets form data and puts it into the database and UI
                    Might need to make a new function for this
*/