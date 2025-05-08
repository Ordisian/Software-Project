const { BrowserWindow } = require('electron');
const { notes } = require('./NoteManager');
const { app } = require('electron');
const NoteManager = require('./NoteManager');
const WindowManager = require('./windowManager');
const { setupIpcHandlers } = require('./ipcHandlers');

function startReminderScheduler() {
    setInterval(() => {
        const now = new Date();
        const currentTime = now.toTimeString().slice(0, 5); // HH:MM
        const currentDay = String(now.getDay()); // "0" = Sunday

        for (const note of notes) {
            if (
                note.reminder &&
                note.reminder.time === currentTime &&
                note.reminder.days.includes(currentDay)
            ) {
                BrowserWindow.getAllWindows().forEach(win => {
                    win.webContents.send('trigger-reminder', note);
                });
            }
        }
    }, 60 * 1000); // every minute
}

app.whenReady().then(() => {
    NoteManager.loadNotes();
	startReminderScheduler();
    setupIpcHandlers();
    WindowManager.createHubWindow();

    app.on('activate', () => {
        if (WindowManager.getAllWindows().length === 0) {
            WindowManager.createHubWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});