const fs = require('fs');
const path = require('path');
const { app } = require('electron');
const { v4: uuidv4 } = require('uuid');

const dataPath = path.join(__dirname, '../../data');
const saveDataPath = path.join(app.getPath('userData'), 'saveData.json');
let notes = [];

// Initialize data directory
if (!fs.existsSync(dataPath)) {
    fs.mkdirSync(dataPath);
}

// Save with metadata
function saveNotes() {
    try {
        const data = {
            version: "1.0",
            createdAt: new Date().toISOString(),
            lastModified: new Date().toISOString(),
            data: notes
        };
  
        // Ensure directory exists
        const dir = path.dirname(saveDataPath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
  
        // Write to file
        fs.writeFileSync(saveDataPath, JSON.stringify(data, null, 2), 'utf-8');
        console.log(`Notes saved to ${saveDataPath}`);
    }   catch (error) {
            console.error('Error saving notes:', error);
    }
}
  
// Load with validation
function loadNotes() {
    if (!fs.existsSync(saveDataPath)) {
        console.warn("No save file found. Starting with an empty notes array.");
        notes = [];
        return [];
    }
  
    try {
        const rawData = fs.readFileSync(saveDataPath, 'utf-8');
        const parsedData = JSON.parse(rawData);
  
        // Validate data format
        if (!Array.isArray(parsedData.data)) {
            throw new Error("Invalid data format: Expected an array of notes.");
        }
  
        notes = parsedData.data;
        console.log(`Loaded ${notes.length} notes from ${saveDataPath}`);
        return notes;
    } catch (error) {
        console.error(`Error loading notes from ${saveDataPath}:`, error);
        notes = [];
        return [];
    }
}

function findItemById(items, targetId) {
    for (const item of items) {
        if (item.id === targetId) return item;
        if (item.type === 'folder' && item.children) {
            const found = findItemById(item.children, targetId);
            if (found) return found;
        }
    }
    return null;
}

function addFolder(folderName, parentFolderId = null) {
    const newFolder = {
        id: uuidv4(),
        type: 'folder',
        name: folderName || 'Untitled Folder',
        children: [],
    };

    if (parentFolderId) {
        const parentFolder = findItemById(notes, parentFolderId);
        if (parentFolder) parentFolder.children.push(newFolder);
    } else {
        notes.push(newFolder);
    }

    saveNotes();
    return newFolder;
}

function addNote(title, content, parentFolderId = null, reminder = null) {
    const newNote = {
        id: uuidv4(),
        type: 'note',
        title: title || 'Untitled Note',
        content: content || '',
        reminder: reminder || null
    };

    if (parentFolderId) {
        const parentFolder = findItemById(notes, parentFolderId);
        if (parentFolder) parentFolder.children.push(newNote);
    } else {
        notes.push(newNote);
    }

    saveNotes();
    return newNote;
}

function deleteItem(id) {
    const deleteRecursive = (items, targetId) => {
        return items.filter(item => {
            if (item.id === targetId) return false;
            if (item.type === 'folder' && item.children) {
                item.children = deleteRecursive(item.children, targetId);
            }
            return true;
        });
    };

    notes = deleteRecursive(notes, id);
    saveNotes();
}

function renameItem(id, newName) {
    const renameRecursive = (items, targetId, name) => {
        items.forEach(item => {
            if (item.id === targetId) {
                item.type === 'folder' ? item.name = name : item.title = name;
            }
            if (item.type === 'folder' && item.children) {
                renameRecursive(item.children, targetId, name);
            }
        });
    };

    renameRecursive(notes, id, newName);
    saveNotes();
}

function getNoteById(id) {
    return findItemById(notes, id);
}

function updateNote(id, title, content, reminder = null) {
    const note = getNoteById(id);
    if (note) {
        note.title = title;
        note.content = content;
        note.reminder = reminder;
        saveNotes();
        return note;
    }
    return null;
}

function getNotes() {
    return Array.isArray(notes) ? notes : [];
}

module.exports = {
    loadNotes,
    saveNotes,
    addFolder,
    addNote,
    deleteItem,
    renameItem,
    getNoteById,
    updateNote,
    getNotes
};