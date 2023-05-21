// initialize the npm packages
const express = require('express')
// for creating an express server
const app = express()
// for serving static files
const path = require('path')
// for setting up a development server
const DEV_PORT = 3001
// process.env.PORT is for when we deploy to a server like Heroku
const PORT = process.env.PORT || DEV_PORT
// for reading and writing to the db.json file
const fs = require('fs')
// for the creation of unique ids
const uuid = require('uuid')

// try to read the db.json file
const dbFilePath = './db/db.json'
// if the file doesn't exist, create it with an empty array
if (!fs.existsSync(dbFilePath)) {
  fs.writeFileSync(dbFilePath, '[]')
}
// if the file is not a valid json file, create it with an empty array
try {
  JSON.parse(fs.readFileSync(dbFilePath))
} catch (err) {
  fs.writeFileSync(dbFilePath, '[]')
}
// read the db.json file
const notesData = require('./db/db.json')

// Sets up the Express app to handle data parsing
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

// Serve images, css files, js files from the public directory
// Allows us to reference files with their relative path
app.use(express.static('public'))

// respond to requests
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'))
})

// return all notes
app.get('/api/notes', (req, res) => {
  res.json(notesData)
})

// default response for any other get request
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, './public/index.html'))
})

// receive a new note with a post request
app.post('/api/notes', (req, res) => {
  // create a new note object if valid data has been sent
  if (!req.body.title || !req.body.text) {
    return res.status(400).json({ msg: 'Please include a title and text' })
  }

  const newNote = req.body
  newNote.id = uuid.v4()
  // add the new note to the notesData array
  notesData.push(newNote)
  // return the new note object
  res.json(newNote)
  // save the notesData to the db.json file
  fs.writeFileSync('./db/db.json', JSON.stringify(notesData), (err) => {
    err
      ? console.error(err)
      : console.log(
            `New Note ${newNote.title} has been written to the JSON db file`
      )
  })
})

// delete a note with a delete request
app.delete('/api/notes/:id', (req, res) => {
  // find the note with the matching id
  const found = notesData.some((note) => note.id === req.params.id)
  // if the note exists, delete it
  if (found) {
    // get the deleted note from the array of notes
    const deletedNote = notesData.filter((note) => note.id === req.params.id)
    // remove the deleted note from the array of notes
    const index = notesData.findIndex(item => item.id === req.params.id)
    console.log(notesData)
    if (index !== -1) {
      notesData.splice(index, 1)
    }
    console.log(notesData)
    // return the new notesData array and a success message
    res.json({
      msg: `Note ${deletedNote[0].title} has been deleted`,
      notesData: notesData.filter((note) => note.id !== req.params.id)
    })
    // save the updated notesData to the db.json file
    fs.writeFileSync('./db/db.json', JSON.stringify(notesData), (err) => {
      err
        ? console.error(err)
        : console.log(
                    `Note ${deletedNote[0].title} has been deleted from the JSON db file`
        )
    })
  } else {
    // if the note doesn't exist, return an error
    res.status(400).json({ msg: `No note with the id of ${req.params.id}` })
  }
})

app.listen(PORT, () =>
  console.log(`Serving static asset routes on port ${PORT}!`)
)
