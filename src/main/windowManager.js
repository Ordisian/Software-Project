const { BrowserWindow } = require('electron');
const path = require('path');

function createHubWindow() {
    const hubWindow = new BrowserWindow({
        minWidth: 800,
        minHeight: 400,
        autoHideMenuBar: true,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
    });

    hubWindow.loadFile(path.join(__dirname, '../renderer/hub/hub.html'));
    return hubWindow;
}

function createNoteWindow(noteId) {
    const noteWindow = new BrowserWindow({
        width: 500,
        height: 500,
        minHeight: 300,
        minWidth: 300,
        frame: false,
        alwaysOnTop: true,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
    });

    noteWindow.loadFile(path.join(__dirname, '../renderer/note/note.html'));
    noteWindow.webContents.on('did-finish-load', () => {
        noteWindow.webContents.send('load-note', noteId);
    });

    return noteWindow;
}

function getAllWindows() {
    return BrowserWindow.getAllWindows();
}

module.exports = {
    createHubWindow,
    createNoteWindow,
    getAllWindows
};