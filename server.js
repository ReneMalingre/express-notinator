const express = require('express')

const app = express()
const path = require('path')
const DEV_PORT = 3001
const PORT = process.env.PORT || DEV_PORT
const notesData = require('./db/db.json')

// Sets up the Express app to handle data parsing
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

// Serve images, css files, js files from the public directory
// Allows us to reference files with their relative path
// Example: http://localhost:3001/images/cat.jpg
app.use(express.static('public'))

// respond to requests
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'))
})

// return all notes
app.get('/api/notes', (req, res) => {
  res.json(notesData)
})

app.listen(PORT, () =>
  console.log(`Serving static asset routes on port ${PORT}!`)
)
