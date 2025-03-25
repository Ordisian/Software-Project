const { app } = require('electron');
const NoteManager = require('./NoteManager');
const WindowManager = require('./windowManager');
const { setupIpcHandlers } = require('./ipcHandlers');

app.whenReady().then(() => {
    NoteManager.loadNotes();
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