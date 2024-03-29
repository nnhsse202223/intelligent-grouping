// Imports \\
const app = require('express')()
const http = require('http').createServer(app)
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const dotenv = require('dotenv').config()
const {OAuth2Client} = require('google-auth-library')
const oAuth2Client = new OAuth2Client(process.env.CLIENT_ID)
const fs = require("fs")
const md5 = require("./md5.js")

// Constants \\

// Database \\
const connectionStr = `mongodb+srv://${process.env.DBUSER}:${process.env.DBPASS}@${process.env.DBID}.mongodb.net/${process.env.DBNAME}?retryWrites=true&w=majority`;
console.log(connectionStr);
mongoose.connect(connectionStr, {useNewUrlParser: true, useUnifiedTopology: true})
const db = mongoose.connection

db.on('error', console.error.bind(console, 'Connection Error:'))
db.once('open', function() {
  console.log("Connected to Database")
})

//Schema
const userSchema = new mongoose.Schema({
  id: String,
  classes: [
    {
      id: String,
      name: String,
      period: String,
      preferences: [],
      students: [
        {
          id: String,
          first: String,
          last: String,
          middle: String,
          email: String,
          preferences: {
            studentLike: [],
            studentDislike: [],
            previouslyWith: [],
            topicLike: [],
            topicDislike: [],
          }
        }
      ],
      groupings: [
        {
          id: String,
          name: String,
          excluded: [],
          groups: [{
            ids: [String],
            row: Number,
            col: Number,
          }],
        }
      ]
    }
  ]
})



const User = mongoose.model("User", userSchema)




// Express \\
const sendFileOptions = {
    root: __dirname + '/static',
    dotfiles: 'deny'
}

app.use(bodyParser.json());

//Routing
app.get('/', async (req, res) => {
  res.sendFile('/index.html', sendFileOptions)
})

app.get("/form/:userId/:classId", async (req, res) => {
  const user = await User.findOne({id: req.params.userId}).exec()
  if (user) {
    const classObj = user.classes.find(c => c.id == req.params.classId)
    if (classObj) {
      res.sendFile('/form/index.html', sendFileOptions)
    } else {
      res.sendFile('/404/index.html', sendFileOptions)
    }
  } else {
    res.sendFile('/404/index.html', sendFileOptions)
  }
})

//Endpoints
app.get("/login", async (req, res) => {
  const verification = await verifyUser(req.header("token"))
  const user = await User.findOne({id: verification.user.sub}).exec()
  if (verification.status && !user) {
    new User({id: verification.user.sub}).save((e) => {
      if (e) return console.log(e)
    })
    res.json({...verification, classes: []})
  } else {
    // console.log(user.classes[0].preferences)
    // console.log(user.classes[0].students[0].preferences.studentLike[0].inputs)
    // console.log(user.classes[0].students[0].preferences.topicLike[0].inputs)
    res.json({...verification, classes: user.classes})
  }
})

// sends the correct user data to the script that is loading the form page
app.get("/formData", async (req, res) => {
  const user = await User.findOne({id: req.query.user}).exec()
  if (user) {
    const classObj = user.classes.find(c => c.id == req.query.class)
    if (classObj) {
      //console.log("\nPreferences", classObj.preferences);
      res.json({status: true, preferences: classObj.preferences, className: classObj.name, period: classObj.period, students: classObj.students.map(s => (
        {name: `${s.first} ${s.middle ? `${s.middle}. ` : ""}${s.last}`, id: md5(s.id)}
      ))})
    } else {
      res.json({status: false, error: "No Form Found"})
    }
  } else {
    res.json({status: false, error: "No Form Found"})
  }
})

// saves preferences for a student
app.post("/saveStudentPreferences", async (req, res) => {
  const user = await User.findOne({id: req.body.userId, classes: {$elemMatch: {id: req.body.id}}}).exec()
  if (user) {
    const classObj = user.classes.find(c => c.id == req.body.id)
    const student = classObj.students.find(s => s.id == req.body.studentId)
    if (student) {
      for (const preference of req.body.preferences) {
        if (["studentLike", "studentDislike"].includes(preference.type)) {
          //explanation of next line: for each id in the preference, find the student with that id and replace it with the md5 hash of the student's id
          preference.inputs = preference.inputs.map(id => classObj.students.find(s => id == md5(s.id)).id)
        }
        student.preferences[preference.type] = preference
      }
      await user.save()
      res.json({status: true})
    } else {
      res.json({status: false, error: "No Student Found"})
    }
  } else {
    res.json({status: false, error: "No Class Found"})
  }
})

// saves groups within a grouping
app.post("/saveChart", async (req,res) => {
  const verification = await verifyUser(req.header("token"))
  console.log("verification", verification.status)
  if(verification.status){
    const user = await User.findOne({id: req.body.userId, classes: {$elemMatch: {id: req.body.id}}}).exec()
    if(user){
      const groupingObj = user.classes.find(c => c.id == req.body.id).groupings.find(g => g.id == req.body.groupId);
      const newGroups = req.body.newGroups;
      console.log(groupingObj, '\n',newgroups);
      if(groupingObj){
        for(let i = 0; i < groupingObj.groups; i++){
          groupingObj[i] = newGroups[i];
        }
        await user.save();
      } else{
        res.json({status: false, error:"No Grouping Found"})
      }
    } else{
      res.json({status: false, error: "No Class Found"})
    }
  }
})

// adds a new class to the user's list of classes
app.post("/addClasses", async (req, res) => {
  const verification = await verifyUser(req.header("token"))
  if (verification.status) {
    const newClasses = []
    for (const classObj of req.body.classObjs) {
      if (!await User.findOne({id: verification.user.sub, classes: {$elemMatch: {id: classObj.id}}}).exec()) {
        await User.updateOne({id: verification.user.sub}, {$push: {classes: classObj}})
        console.log(classObj)
        newClasses.push(classObj)
      }
    }
    if (newClasses.length) {
      res.json({status: true, newClasses: newClasses})
    } else {
      res.json({status: false, error: "All Duplicate Classes - Make sure you are uploading new classes"})
    }
  }
})

app.post("/editClass", async (req, res) => {
  const verification = await verifyUser(req.header("token"))
  if (verification.status) {
    const classObj = req.body.classObj
    const user = await User.findOne({id: verification.user.sub, classes: {$elemMatch: {id: req.body.oldId}}}).exec()
    if (user) {
      const existingClassObj = user.classes.find(c => c.id == req.body.oldId)
      //saves student preferences and ids in an array
      const studentPreferences = []
      for (const student of existingClassObj.students) {
        studentPreferences.push({id: student.id, preferences: student.preferences})
      }

      // checks if student preferences are valid (aka exist)
      for(let i=0; i<studentPreferences.length; i++){
         // gets the specific preferences object from the studentPreferences array
         let preferences = studentPreferences[i].preferences
          // checks if the studentLike array is not empty
          if(preferences.studentLike.length>0) {
          let valid = false;
          // keeps track of the index of the id in the array
          let num = 0;
          // loops through the studentLike[0].inputs array
          for(const id of preferences.studentLike[0].inputs) {
            // sets the valid variable to false by default
            valid = false;
            // checks if the id exists in the array of students
            if(classObj.students.find(s => s.id == id))
            {
              // if the id exists, it is valid
              valid = true;
            }
            // if the id does not exist, it is removed from the array
            if(valid==false){
              // removes the id from the array
              preferences.studentLike[0].inputs.splice(num,1) 
              // checks if the array is empty
              if(preferences.studentLike[0].inputs.length<=0) {
                // sets the studentLike array to an empty array
                preferences.studentLike = [];
                break;
              }
              // decrements the index of the array to account for the removed id
              num--;
            }
            // increments the index of the array to check the next id
            num++;
          }
        }
        // checks if the studentDislike array is not empty
        if(preferences.studentDislike.length>0) {
          let valid = false;
          let num = 0;
          // loops through the studentDislike[0].inputs array
          for(const id of preferences.studentDislike[0].inputs) {
            valid = false;
            if(classObj.students.find(s => s.id == id))
            {
              valid = true;
            }
            if(valid==false){
              preferences.studentDislike[0].inputs.splice(num,1) 
              if(preferences.studentDislike[0].inputs.length<=0) {
                preferences.studentDislike = [];
                break;
              }
              num--;
            }
            num++;
          }
        }
      }


      //transfers student preferences to new class
      for(const student of classObj.students){
        for(const preference of studentPreferences){
          if(student.id==preference.id){
            student.preferences = preference.preferences
            // console.log("Students Name\n"+ student.name)
            // console.log("Student Preferences\n"+ student.preferences)
            // console.log("Student ID\n"+ student.id)
            // console.log("Student Inputs\n"+ student.preferences.studentLike[0].inputs)
          }
        }
      }


      existingClassObj.id = classObj.id
      existingClassObj.name = classObj.name
      existingClassObj.period = classObj.period
      existingClassObj.students = classObj.students
      await user.save()
      res.json({status: true, updatedClass: existingClassObj})
    } else {
      res.json({status: false, error: "The class you are editing does not exist - Please reload"})
    }
  }
})

// deletes a class from the database
app.post("/deleteClass", async (req, res) => {
  const verification = await verifyUser(req.header("token"))
  if (verification.status) {
    const user = await User.findOne({id: verification.user.sub, classes: {$elemMatch: {id: req.body.id}}}).exec()
    if (user) {
      user.classes.splice(user.classes.indexOf(user.classes.find(c => c.id == req.body.id)), 1)
      await user.save()
      res.json({status: true})
    } else {
      res.json({status: false, error: "No Class Found"})
    }
  }
})

// generates random groups
app.post("/randomGroups", async (req, res) => {
  const verification = await verifyUser(req.header("token"))
  if (verification.status) {
    const user = await User.findOne({id: verification.user.sub}).exec()
    if (req.body.type == 0) {
      res.json({status: true, groups: makeGroupsByNumGroups(user.classes.find(c => c.id == req.body.id).students.map(s => s.id).filter(s => !req.body.excluded.includes(s)), req.body.num)})
    } else {
      res.json({status: true, groups: makeGroupsByNumStudents(user.classes.find(c => c.id == req.body.id).students.map(s => s.id).filter(s => !req.body.excluded.includes(s)), req.body.num)})
    }
  }
})

// adds a grouping to the database
app.post("/addGrouping", async (req, res) => {
  const verification = await verifyUser(req.header("token"))
  if (verification.status) {
    const user = await User.findOne({id: verification.user.sub}).exec()
    classObj = user.classes.find(c => c.id == req.body.id)
    classObj.groupings.push(req.body.grouping)
    
    //updates previouslywith
    for(group of req.body.grouping.groups) {
      for(studentID of group.ids) {
        // gets index of student
        index = classObj.students.findIndex(s => s.id == studentID)
        // adds all other students in the group to the previouslyWith array if they are not already in it                                                        //remove this to increase negative weight of repeats the more they happen\\
        classObj.students[index].preferences.previouslyWith = [...classObj.students[index].preferences.previouslyWith, ...group.ids.filter(id => id != studentID).filter(id => !classObj.students[index].preferences.previouslyWith.includes(id))]
      }
    }

    user.save()
    res.json({status: true})
  }
})

// edits a grouping from the database
app.post("/editGrouping", async (req, res) => {
  const verification = await verifyUser(req.header("token"))
  if (verification.status) {
    
    const user = await User.findOne({id: verification.user.sub}).exec()
    classObj = user.classes.find(c => c.id == req.body.id)
    const groupings = classObj.groupings
    groupings.splice(groupings.indexOf(groupings.find(g => g.id == req.body.oldId)), 1)
    
    classObj.groupings.push(req.body.grouping)

    //updates previouslywith
    for(group of req.body.grouping.groups) {
      for(studentID of group.ids) {
        // gets index of student
        index = classObj.students.findIndex(s => s.id == studentID)
        // adds all other students in the group to the previouslyWith array if they are not already in it
        classObj.students[index].preferences.previouslyWith = [...classObj.students[index].preferences.previouslyWith, ...group.ids.filter(id => id != studentID).filter(id => !classObj.students[index].preferences.previouslyWith.includes(id))]
      }
    }
  
    user.save()
    res.json({status: true})
  }
})

app.post("/clearPreviouslyWith", async (req, res) => {
  const verification = await verifyUser(req.header("token"))
  if (verification.status) {
    const user = await User.findOne({id: verification.user.sub}).exec()
    classObj = user.classes.find(c => c.id == req.body.id)
    for(student of classObj.students) {
      student.preferences.previouslyWith = []
    }
    user.save()
    res.json({status: true})
  }
})

// deletes a grouping from the database
app.post("/deleteGroup", async (req, res) => {
  const verification = await verifyUser(req.header("token"))
  if (verification.status) {
    const user = await User.findOne({id: verification.user.sub, classes: {$elemMatch: {id: req.body.id}}}).exec()
    if (user) {
      const groupings = user.classes.find(c => c.id == req.body.id).groupings
      const grouping = groupings.find(g => g.id == req.body.groupingId)
      if (grouping) {
        groupings.splice(groupings.indexOf(grouping), 1)
        await user.save()
      res.json({status: true})
      } else {
        res.json({status: false, error: "No Group Found"})
      }
    } else {
      res.json({status: false, error: "No Class Found"})
    }
  }
})

// adds a preference to the database
app.post("/addPreference", async (req, res) => {
  const verification = await verifyUser(req.header("token"))
  if (verification.status) {
    const user = await User.findOne({id: verification.user.sub, classes: {$elemMatch: {id: req.body.id}}}).exec()
    if (user) {
      user.classes.find(c => c.id == req.body.id).preferences.push(req.body.preference)
      await user.save()
      res.json({status: true})
    } else {
      res.json({status: false, error: "No Class Found"})
    }
  }
})

// deletes a preference from the database
app.post("/deletePreference", async (req, res) => {
  const verification = await verifyUser(req.header("token"))
  if (verification.status) {
    const user = await User.findOne({id: verification.user.sub, classes: {$elemMatch: {id: req.body.id}}}).exec()
    if (user) {
      const preferences = user.classes.find(c => c.id == req.body.id).preferences
      const preference = preferences.find(p => p.id == req.body.preferenceId)
      if (preference) {
        preferences.splice(preferences.indexOf(preference), 1)
        await user.save()
        res.json({status: true})
      } else {
        res.json({status: false, error: "No Preference Found"})
      }
    } else {
      res.json({status: false, error: "No Class Found"})
    }
  }
})

app.get("/getClasses", async (req, res) => {
  const verification = await verifyUser(req.header("token"))
  if (verification.status) {
    let user = await User.findOne({id: verification.user.sub}).exec()
    res.json({classes: user.classes})
  }
})

// adds middlewear to send user to 404 page on invalid url
app.use((req, res) => {
  res.sendFile(req.url, sendFileOptions, (e) => {
    if (e) {
      res.status(404).sendFile('/404/index.html', sendFileOptions)
    }
  })
})

//Listen
http.listen(process.env.PORT, function(){
	console.log(`Server listening on *:${process.env.PORT}`)
})

// verifies the user
async function verifyUser(token) {
  const ticket = await oAuth2Client.verifyIdToken({
    idToken: token,
    audience: process.env.CLIENT_ID
  }).catch(e => {
    return {status: false}
  })
  return {status: true, user: ticket.getPayload()}
}

// makes groups by number of groups specified
function makeGroupsByNumGroups(students, numGroups) {
  students = [...students]
  let groups = []
  for (let i = 0; i < numGroups; i++) {
    groups.push({
      ids: [],
      row: -1,
      col: -1,
    })
  }

  let counter = 0
  while (students.length) {
    const randomIndex = Math.floor(Math.random() * students.length)
    groups[counter].ids.push(students[randomIndex])
    students.splice(randomIndex, 1)
    counter = (counter+1) % groups.length
  }
  return groups
}

// makes groups by number of students per group specified
function makeGroupsByNumStudents(students, numStudents) {
  students = [...students]
  let groups = []
  let numGroups = Math.floor(students.length/numStudents)
  if ((students.length % numStudents > numStudents / 2 || students % numStudents > numGroups / 2)) {
    numGroups += 1
  }
  
  for (let i = 0; i < numGroups; i++) {
    groups.push({
      ids: [],
      row: -1,
      col: -1,
    })
  }

  let counter = 0
  
  while (students.length) {
    const randomIndex = Math.floor(Math.random() * students.length)
    groups[counter].ids.push(students[randomIndex])
    students.splice(randomIndex, 1)
    counter = (counter+1) % groups.length
  }
  
  // const avg = groups.reduce((a, b) => a + b.length, 0) / groups.length
  // console.log(avg)

  // if (avg > numStudents + 0.5 || avg < numStudents - 0.5) {
  //   console.log("weird")
  // }

  return groups
}




// mean the #s group > groups of x => warning

// greater > x => Warning


// < Half > Merge last group




/*
User Schema
{
  id: "user id",
  classes: [
    {
      name: "class name",
      period: "period number (as a string)",
      students: [
        {
          id: "student id",
          first: "first name",
          middle: "middle initial",
          last: "last name",
          preferences: [
            {
              name: "name of preference"
              type: integer representing type of preference (categorical, discrete, continuous),
              value: "value of preference" //may change because may not always be a string (ex. rate 1-5)
            }
          ]
        }
      ]
      groups: [
        {
          type: integer representing type of group (random etc),
          groupings: [["student id"]]
        }
      ]
    }
  ]
}
*/