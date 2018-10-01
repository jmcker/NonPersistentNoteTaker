let globalNoteComp = (function() {

    // Collect DOM elements
    let searchInput = document.getElementById("searchInput");
    let domNoteList = document.getElementById("noteList");

    let noteTitle = document.getElementById("noteTitle");
    let noteEditor = document.getElementById("noteEditor");

    let newButton = document.getElementById("newButton");

    // Fetch the id of the currently selected note
    function selectedNote() {
        return document.getElementsByClassName("selected")[0];
    }

    // Fetch a note by id
    function getDomNote(id) {
        return document.getElementById(id);
    }

    // Highlight the found query
    function highlightQuery(id, query) {
        let note = getDomNote(id);
        let title = note.getElementsByClassName("note-title")[0];

        let regEx = new RegExp(query, "ig");
        title.innerHTML = title.innerHTML.replace(regEx, '<span class="highlighted">$&</span>');
    }

    // From: https://gist.github.com/gordonbrander/2230317
    function generateId() {
        return '_' + Math.random().toString(36).substr(2, 9);
    }

    class Note {

        constructor(name, description = "") {
            this.name = name;
            this.description = description;
            this.id = generateId();
        }

        generateDOMElem() {

            let li = document.createElement("li");
            li.id = this.id;

            // Note title
            let hFour = document.createElement("h4");
            hFour.className = "note-title";
            hFour.innerHTML = this.name;

            // Delete button
            let button = document.createElement("div");
            button.className = "note-delete rounded";
            button.innerHTML = "&#9587;";

            // Note description
            let div = document.createElement("div");
            div.className = "note-subtitle";
            div.innerHTML = this.description;

            li.appendChild(hFour);
            li.appendChild(button);
            li.appendChild(div);

            button.setAttribute("onclick", "event.stopPropagation(); globalNoteComp.removeNote('" + this.id + "');");
            li.setAttribute("onclick", "globalNoteComp.selectNote('" + this.id + "')");

            return li;

        }
    
    }
    
    class NoteComponent {
    
        constructor() {
            this.noteDict = {};
        }
    
        filterList(noteList, query) {

            if (query.length === 0)
                return Object.values(this.noteDict);
    
            let filteredList = [];
    
            for (let i = 0; i < noteList.length; i++) {
                let note = noteList[i];
                if (note.name.toLowerCase().includes(query.toLowerCase())) // || note.description.includes(query)
                    filteredList.push(note);
            }
            
            return filteredList;
    
        }
    
        generateNoteList(noteList) {
            if (noteList.length === 0)
                return;

            for (let i = noteList.length - 1; i >= 0; i--) {
                let domNote = noteList[i].generateDOMElem();
                
                if (i === noteList.length - 1)
                    domNote.classList.add("selected");

                domNoteList.appendChild(domNote);
            }

            this.selectNote(noteList[noteList.length - 1].id);
        }

        clearNoteList() {
            // From: https://stackoverflow.com/questions/3955229/remove-all-child-elements-of-a-dom-node-in-javascript
            while (domNoteList.firstChild) {
                domNoteList.removeChild(domNoteList.firstChild);
            }
        }
    
        addNote(title, description = "") {
            this.clearNoteList();

            let note = new Note(title, description);
            this.noteDict[note.id] = note;

            this.generateNoteList(Object.values(this.noteDict));
            this.selectNote(note.id);

            // Unfreeze the UI
            noteTitle.disabled = false;
            noteEditor.disabled = false;
        }

        selectNote(id) {
            // Toggle the selected class
            if (typeof (selectedNote()) !== "undefined")
                selectedNote().classList.toggle("selected");
            document.getElementById(id).classList.toggle("selected");

            let note = this.noteDict[id];

            if (note === null) {
                alert("Note does not exist!");
                return;
            }

            noteTitle.value = note.name;
            noteEditor.value = note.description;
        }

        updateNote(id, title = "", description = "") {

            let note = this.noteDict[id];

            if (note === null) {
                alert("Note does not exist!");
                return;
            }

            if (title.length === 0)
                title = "Untitled";

            note.name = title;
            note.description = description;
            getDomNote(id).getElementsByClassName("note-title")[0].innerHTML = title;
            getDomNote(id).getElementsByClassName("note-subtitle")[0].innerHTML = description;
        }
    
        removeNote(id) {
            this.clearNoteList();

            delete this.noteDict[id];

            // Disable editing if no notes are present
            if (Object.keys(this.noteDict).length === 0) {
                noteTitle.value = "";
                noteTitle.disabled = true;
                noteEditor.disabled = true;
            }

            this.generateNoteList(Object.values(this.noteDict));
        }
    
    }

    newButton.onclick = function() {
        searchInput.value = "";
        noteComp.addNote("New Note");
        noteTitle.select();
    };

    searchInput.oninput = function() {
        noteComp.clearNoteList();

        let filteredList = noteComp.filterList(Object.values(noteComp.noteDict), searchInput.value);
        noteComp.generateNoteList(filteredList);

        for (let i = 0; i < filteredList.length; i++) {
            highlightQuery(filteredList[i].id, searchInput.value);
        }
    }

    noteTitle.oninput = function() {
        noteComp.updateNote(selectedNote().id, noteTitle.value, noteEditor.value);
    }

    noteEditor.oninput = function() {
        noteComp.updateNote(selectedNote().id, noteTitle.value, noteEditor.value);
    }

    // Initialize component
    let noteComp = new NoteComponent();

    // Create a new note by default
    newButton.click();

    return noteComp;

})();