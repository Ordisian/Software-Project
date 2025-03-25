const { ipcMain, Notification, shell, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');
const schedule = require('node-schedule');
const NoteManager = require('./NoteManager');
const WindowManager = require('./windowManager');

let scheduledJobs = {};

function scheduleReminder(noteId, reminder) {
    if (!reminder?.time || !reminder?.days?.length) return;

    // Cancel existing job if any
    if (scheduledJobs[noteId]) {
        scheduledJobs[noteId].cancel();
    }

    // Parse time (handle both 12h and 24h formats)
    const [time, modifier] = reminder.time.split(' ');
    let [hours, minutes] = time.split(':');
    
    hours = parseInt(hours);
    minutes = parseInt(minutes || '0');

    // Handle 12-hour format
    if (modifier?.toLowerCase() === 'pm' && hours < 12) {
        hours += 12;
    }
    if (modifier?.toLowerCase() === 'am' && hours === 12) {
        hours = 0;
    }

    // Schedule for each selected day
    reminder.days.forEach(day => {
        const rule = new schedule.RecurrenceRule();
        rule.dayOfWeek = parseInt(day);
        rule.hour = hours;
        rule.minute = minutes;

        scheduledJobs[noteId] = schedule.scheduleJob(rule, () => {
            const note = NoteManager.getNoteById(noteId);
            if (!note) return;

            // Play sound
            playNotificationSound();

            // Flash window
            const noteWindow = BrowserWindow.getAllWindows().find(win => 
                win.webContents.getURL().includes('note.html')
            );
            if (noteWindow) {
                noteWindow.flashFrame(true);
                noteWindow.show();
            }

            // Show notification
            new Notification({
                title: note.title || 'Reminder',
                body: note.content || 'You have a reminder!',
                silent: false
            }).show();
        });
    });
}

function playNotificationSound() {
    const soundPath = path.join(__dirname, 'sounds', 'sound_notification.wav');
    if (fs.existsSync(soundPath)) {
      const player = require('play-sound')();
      player.play(soundPath);
    }
}

function updateHubNoteList() {
    const hubWindow = WindowManager.getAllWindows().find(win => 
        win.webContents.getURL().includes('hub.html')
    );
    if (hubWindow) {
        hubWindow.webContents.send('update-note-list', NoteManager.getNotes());
    }
}

function setupIpcHandlers() {
    // Initialize notes
    NoteManager.loadNotes();
    
    // Then schedule existing reminders
    NoteManager.getNotes().forEach(note => {
        if (note.reminder) {
            scheduleReminder(note.id, note.reminder);
        }
    });

    ipcMain.on('set-reminder', (event, { noteId, reminder }) => {
        scheduleReminder(noteId, reminder);
        NoteManager.updateNote(noteId, null, null, reminder);
    });

    ipcMain.on('save-note', (event, { id, title, content, reminder }) => {
        NoteManager.updateNote(id, title, content, reminder);
        updateHubNoteList();
    });

    ipcMain.on('delete-note', (event, id) => {
        if (scheduledJobs[id]) {
            scheduledJobs[id].cancel();
            delete scheduledJobs[id];
        }
        NoteManager.deleteItem(id);
        updateHubNoteList();
    });

    ipcMain.on('request-note-list', (event) => {
        event.sender.send('update-note-list', NoteManager.getNotes());
    });

    ipcMain.on('open-note', (event, id) => {
        const note = NoteManager.getNoteById(id);
        if (note) {
            const noteWindow = WindowManager.createNoteWindow(note.id);
            noteWindow.webContents.on('did-finish-load', () => {
                noteWindow.webContents.send('load-note', note);
            });
        }
    });

    ipcMain.on('open-hub', () => {
        const hubWindow = WindowManager.getAllWindows().find(win => 
            win.webContents.getURL().includes('hub.html')
        );
        if (hubWindow) {
            hubWindow.show();
        } else {
            WindowManager.createHubWindow();
        }
    });

    ipcMain.on('add-folder', (event, { folderName, parentFolderId }) => {
        NoteManager.addFolder(folderName, parentFolderId);
        updateHubNoteList();
    });

    ipcMain.on('add-note', (event, { noteTitle, parentFolderId }) => {
        NoteManager.addNote(noteTitle, '', parentFolderId);
        updateHubNoteList();
    });

    ipcMain.on('rename-item', (event, { id, newName }) => {
        NoteManager.renameItem(id, newName);
        updateHubNoteList();
    });
}

module.exports = { setupIpcHandlers };