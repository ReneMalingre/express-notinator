let noteTitle
let noteText
let saveNoteBtn
let newNoteBtn
let noteList

if (window.location.pathname === '/notes.html') {
  noteTitle = document.querySelector('.note-title')
  noteText = document.querySelector('.note-textarea')
  saveNoteBtn = document.querySelector('.save-note')
  newNoteBtn = document.querySelector('.new-note')
  noteList = document.querySelectorAll('.list-container .list-group')
}

// Show an element
const show = (elem) => {
  elem.style.display = 'inline'
}

// Hide an element
const hide = (elem) => {
  elem.style.display = 'none'
}

// activeNote is used to keep track of the note in the textarea
let activeNote = {}

const getNotes = () =>
  fetch('/api/notes', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  })
    .catch((error) => {
      console.error('Error in GET request:', error)
    })

const saveNote = (note) =>
  fetch('/api/notes', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(note)
  })
    .then((response) => response.json())
    .then((data) => {
      // console.log('Success in saving note:', data)
    })
    .catch((error) => {
      console.error('Error in POST request:', error)
    })

const deleteNote = (id) =>
  fetch(`/api/notes/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json'
    }
  })
    .then((response) => response.json())
    .then((data) => {
      // console.log('Success in deleting note:', data)
    })
    .catch((error) => {
      console.error('Error in DELETE request:', error)
    })

const renderActiveNote = () => {
  hide(saveNoteBtn)

  if (isValidObjectActiveNote() && activeNote.id) {
    noteTitle.setAttribute('readonly', true)
    noteText.setAttribute('readonly', true)
    noteTitle.value = activeNote.title
    noteText.value = activeNote.text
  } else {
    noteTitle.removeAttribute('readonly')
    noteText.removeAttribute('readonly')
    noteTitle.value = ''
    noteText.value = ''
  }
}

const handleNoteSave = () => {
  const newNote = {
    title: noteTitle.value,
    text: noteText.value
  }
  saveNote(newNote).then(() => {
    getAndRenderNotes()
    renderActiveNote()
  })
}

// Delete the clicked note
const handleNoteDelete = (e) => {
  // Prevents the click listener for the list from being called when the button inside of it is clicked
  e.stopPropagation()

  const note = e.target
  const noteId = JSON.parse(note.parentElement.getAttribute('data-note')).id

  // If the active note is the one being deleted, clear the activeNote object
  if (!isValidObjectActiveNote()) {
    activeNote = {}
  } else {
    if (activeNote.id === noteId) {
      activeNote = {}
    }
  }

  deleteNote(noteId).then(() => {
    getAndRenderNotes()
    renderActiveNote()
  })
}

// Sets the activeNote and displays it
const handleNoteView = (e) => {
  e.preventDefault()
  activeNote = JSON.parse(e.target.parentElement.getAttribute('data-note'))
  renderActiveNote()
}

// Sets the activeNote to and empty object and allows the user to enter a new note
const handleNewNoteView = (e) => {
  activeNote = {}
  renderActiveNote()
  // set the focus to the Note Title
  noteTitle.focus()
}

const handleRenderSaveBtn = () => {
  if (!noteTitle.value.trim() || !noteText.value.trim()) {
    hide(saveNoteBtn)
  } else {
    show(saveNoteBtn)
  }
}

// Render the list of note titles
const renderNoteList = async (notes) => {
  const jsonNotes = await notes.json()
  if (window.location.pathname === '/notes.html') {
    noteList.forEach((el) => (el.innerHTML = ''))
  }

  const noteListItems = []

  // Returns HTML element with or without a delete button
  const createLi = (text, delBtn = true) => {
    const liEl = document.createElement('li')
    liEl.classList.add('list-group-item')

    const spanEl = document.createElement('span')
    spanEl.classList.add('list-item-title')
    spanEl.innerText = text
    spanEl.addEventListener('click', handleNoteView)

    liEl.append(spanEl)

    if (delBtn) {
      const delBtnEl = document.createElement('i')
      delBtnEl.classList.add(
        'fas',
        'fa-trash-alt',
        'float-right',
        'text-danger',
        'delete-note'
      )
      delBtnEl.addEventListener('click', handleNoteDelete)

      liEl.append(delBtnEl)
    }

    return liEl
  }

  if (jsonNotes.length === 0) {
    noteListItems.push(createLi('No saved Notes', false))
  }

  jsonNotes.forEach((note) => {
    const li = createLi(note.title)
    li.dataset.note = JSON.stringify(note)
    noteListItems.push(li)
  })

  if (window.location.pathname === '/notes.html') {
    noteListItems.forEach((note) => noteList[0].append(note))
  }
}
// END OF RENDER NOTE LIST

// Gets notes from the db and renders them to the sidebar
const getAndRenderNotes = () => getNotes().then(renderNoteList)

// create event listeners for the notes.html file
if (window.location.pathname === '/notes.html') {
  saveNoteBtn.addEventListener('click', handleNoteSave)
  newNoteBtn.addEventListener('click', handleNewNoteView)
  noteTitle.addEventListener('keyup', handleRenderSaveBtn)
  noteText.addEventListener('keyup', handleRenderSaveBtn)
}

// ensure that the activeNote object is valid, to avoid errors
// upon clicking the placeholder note
function isValidObjectActiveNote () {
  if (activeNote === null) return false
  if (typeof activeNote !== 'object') return false
  if (Object.keys(activeNote).length === 0) return false
  return 'id' in activeNote
}

// call the getAndRenderNotes function once on page load to display the list of notes
getAndRenderNotes()
