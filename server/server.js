const express = require('express')
const app = express()

app.use(express.json())

// This is the code to serve our front-end from our server
app.use(express.static(`${__dirname}/../public`))

// This is the rollbar connection
// include and initialize the rollbar library with your access token
var Rollbar = require('rollbar')
var rollbar = new Rollbar({
  accessToken: 'ce067810261f4577b0ea6f50cb912e22',
  captureUncaught: true,
  captureUnhandledRejections: true,
})

// record a generic message and send it to Rollbar
rollbar.log('Hello world!')

const students = ['Jimmy', 'Timothy', 'Jimothy']

app.get('/api/students', (req, res) => {
    // I want to get a rollbar info when student name(s) are loaded
    rollbar.info('The student name(s) were sent.')
    res.status(200).send(students)
})

app.post('/api/students', (req, res) => {
   let {name} = req.body

   const index = students.findIndex(student => {
       return student === name
   })

   try {
       if (index === -1 && name !== '') {
           students.push(name)
           // Get rollbar info when a new name is added and what the name was.
           rollbar.info(`A new name was added: ${name}`)
           res.status(200).send(students)
       } else if (name === ''){
            // Get rollbar warning if the input was submitted with no text
            rollbar.warning('Empty input was sent')
           res.status(400).send('You must enter a name.')
       } else {
            // Get another warning when a duplicate input is submitted
            rollbar.warning('Existing name was attempted to be enetered')
           res.status(400).send('That student already exists.')
       }
   } catch (err) {
       console.log(err)
       // Get a rollbar error message
       rollbar.error(err)
   }
})

app.delete('/api/students/:index', (req, res) => {
    const targetIndex = +req.params.index
    
    let deletedName = students.splice(targetIndex, 1)
    // Get rollbar info when a student name is deleted (clicked on)
    rollbar.info(`${deletedName} was deleted`)
    res.status(200).send(students)
})

const port = 5050

app.listen(port, () => console.log(`Server listening on ${port}`))
