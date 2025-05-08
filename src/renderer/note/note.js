const { ipcRenderer } = require('electron');

let noteId = null;
let noteContent = '';
let saveTimeout = null;
let selectedDays = new Set();
let notes = [];

Notification.requestPermission().then(permission => {
    if (permission !== 'granted') {
        console.log('Notification permission not granted');
    }
});

function updateReminderIndicator() {
    const titleElement = document.getElementById('header-title');
    const hasReminder = document.getElementById('reminder-time').value && selectedDays.size > 0;
    titleElement.classList.toggle('reminder-active', hasReminder);
}

function saveNote() {
    const title = document.getElementById('header-title').textContent;
    const reminderTime = document.getElementById('reminder-time').value;
    noteContent = document.getElementById('text').value;
    
    const reminder = {
        time: reminderTime,
        days: Array.from(selectedDays)
    };

    ipcRenderer.send('save-note', { 
        id: noteId, 
        title, 
        content: noteContent,
        reminder: reminderTime && selectedDays.size > 0 ? reminder : null
    });

    updateReminderIndicator();
}

ipcRenderer.on('load-note', (event, note) => {
    noteId = note.id;
    document.getElementById('header-title').textContent = note.title || 'Untitled Note';
    document.getElementById('text').value = note.content || '';
    
    // Reset reminder UI
    document.getElementById('reminder-time').value = '';
    selectedDays.clear();
    document.querySelectorAll('.day-button').forEach(btn => {
        btn.classList.remove('selected');
    });
    
    // Load existing reminder
    if (note.reminder) {
        document.getElementById('reminder-time').value = note.reminder.time || '';
        if (note.reminder.days) {
            note.reminder.days.forEach(day => {
                const button = document.querySelector(`.day-button[data-day="${day}"]`);
                if (button) {
                    button.classList.add('selected');
                    selectedDays.add(day);
                }
            });
        }
    }
    updateReminderIndicator();
});

// Event listeners
document.getElementById('text').addEventListener('input', () => {
    noteContent = document.getElementById('text').value;
    const firstLine = noteContent.split('\n')[0];
    if (firstLine) {
        document.getElementById('header-title').textContent = firstLine;
    }
    
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(saveNote, 1000);
});

document.querySelectorAll('.day-button').forEach(button => {
    button.addEventListener('click', (e) => {
        const day = e.target.dataset.day;
        e.target.classList.toggle('selected');
        if (e.target.classList.contains('selected')) {
            selectedDays.add(day);
        } else {
            selectedDays.delete(day);
        }
        saveNote();
    });
});

document.getElementById('reminder-time').addEventListener('change', saveNote);
document.getElementById('close-button').addEventListener('click', () => {
    saveNote();
    window.close();
});
document.getElementById('hub-button').addEventListener('click', () => {
    saveNote();
    ipcRenderer.send('open-hub');
});

ipcRenderer.on('trigger-reminder', (event, note) => {
    // Create modal overlay
    const modal = document.createElement('div');
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100%';
    modal.style.height = '100%';
    modal.style.backgroundColor = 'rgba(0,0,0,0.7)';
    modal.style.zIndex = '1000';
    modal.style.display = 'flex';
    modal.style.flexDirection = 'column';
    modal.style.alignItems = 'center';
    modal.style.justifyContent = 'center';
  
    // Modal content
    modal.innerHTML = `
      <div style="background: #1e1e1e; padding: 20px; border-radius: 8px; max-width: 80%;">
        <h2 style="color: #b47cff;">${note.title || 'Reminder'}</h2>
        <p style="color: #e0e0e0; margin: 10px 0;">${note.content || ''}</p>
        <button id="complete-reminder" style="
          background: #7c4dff;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 4px;
          cursor: pointer;
        ">Complete</button>
      </div>
    `;
  
    // Add to DOM
    document.body.appendChild(modal);
  
    // Handle button click
    document.getElementById('complete-reminder').addEventListener('click', () => {
      document.body.removeChild(modal);
      ipcRenderer.send('reminder-completed', note.id);
    });
  });