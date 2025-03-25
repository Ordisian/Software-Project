
// hub.js

const { ipcRenderer } = require('electron');

let selectedFolderId = null; // Track the selected folder
let folderStack = []; // Stack to track folder navigation history

// Request the note list when the hub loads
ipcRenderer.send('request-note-list');

// Get modal elements
const modal = document.getElementById('input-modal');
const closeModal = document.getElementById('close-modal');
const modalTitle = document.getElementById('modal-title');
const inputField = document.getElementById('input-field');
const submitButton = document.getElementById('submit-button');

// Get confirmation modal elements
const confirmModal = document.getElementById('confirm-modal');
const closeConfirmModal = document.getElementById('close-confirm-modal');
const confirmModalTitle = document.getElementById('confirm-modal-title');
const confirmModalMessage = document.getElementById('confirm-modal-message');
const confirmDeleteButton = document.getElementById('confirm-delete-button');
const cancelDeleteButton = document.getElementById('cancel-delete-button');

// Function to show the input modal
function showInputModal(title, callback) {
    modalTitle.textContent = title; // Set the modal title
    inputField.value = ''; // Clear the input field
    modal.style.display = 'block'; // Show the modal

    // Handle submit button click
    submitButton.onclick = () => {
        const value = inputField.value.trim();
        if (value) {
            callback(value); // Pass the input value to the callback
            modal.style.display = 'none'; // Hide the modal
        }
    };

    // Handle close button click
    closeModal.onclick = () => {
        modal.style.display = 'none'; // Hide the modal
    };

    // Handle clicks outside the modal
    window.onclick = (event) => {
        if (event.target === modal) {
            modal.style.display = 'none'; // Hide the modal
        }
    };
}

// Function to show the confirmation modal
function showConfirmModal(title, message, callback) {
    confirmModalTitle.textContent = title; // Set the modal title
    confirmModalMessage.textContent = message; // Set the modal message
    confirmModal.style.display = 'block'; // Show the modal

    // Handle confirm delete button click
    confirmDeleteButton.onclick = () => {
        callback(true); // Confirm deletion
        confirmModal.style.display = 'none'; // Hide the modal
    };

    // Handle cancel delete button click
    cancelDeleteButton.onclick = () => {
        callback(false); // Cancel deletion
        confirmModal.style.display = 'none'; // Hide the modal
    };

    // Handle close button click
    closeConfirmModal.onclick = () => {
        confirmModal.style.display = 'none'; // Hide the modal
    };

    // Handle clicks outside the modal
    window.onclick = (event) => {
        if (event.target === confirmModal) {
            confirmModal.style.display = 'none'; // Hide the modal
        }
    };
}

// Function to handle folder selection
function selectFolder(folderId) {
    selectedFolderId = folderId; // Update the selected folder
    console.log('Selected Folder ID:', selectedFolderId); // Debugging
    folderStack.push(folderId); // Add the folder to the navigation stack
    renderFolderContents(folderId); // Render the folder's contents
}

// Function to render the contents of a folder
function renderFolderContents(folderId) {
    ipcRenderer.send('request-note-list'); // Request the updated note list
}

// Function to go back to the previous folder
function goBack() {
    if (folderStack.length > 1) {
        folderStack.pop(); // Remove the current folder from the stack
        const previousFolderId = folderStack[folderStack.length - 1]; // Get the previous folder
        selectedFolderId = previousFolderId; // Update the selected folder
        renderFolderContents(previousFolderId); // Render the previous folder's contents
    } else {
        // If no previous folder, go back to the root
        folderStack = []; // Clear the stack
        selectedFolderId = null; // Reset the selected folder
        renderFolderContents(null); // Render the root contents
    }
}

// Listen for updates to the note list
ipcRenderer.on('update-note-list', (event, notes) => {
    const noteList = document.getElementById('note-list');
    noteList.innerHTML = ''; // Clear the current list

    // Add a back button if we're inside a folder
    if (folderStack.length > 0) {
        const backButton = document.createElement('li');
        backButton.className = 'note-item back-button';
        backButton.textContent = '← Back';
        backButton.addEventListener('click', goBack);
        noteList.appendChild(backButton);
    }

    // Filter notes to show only those in the selected folder
    const currentNotes = selectedFolderId
        ? notes.find(item => item.id === selectedFolderId)?.children || []
        : notes;

    // Render the filtered notes
    currentNotes.forEach((item) => {
        const li = document.createElement('li');
        li.className = 'note-item';
        li.setAttribute('data-item-id', item.id); // Add data attribute for ID

        if (item.type === 'folder') {
            // Render folder
            li.textContent = `📁 ${item.name}`;
            li.style.fontWeight = 'bold';

            // Add a click handler to open the folder
            li.addEventListener('click', (e) => {
                if (e.target.classList.contains('menu-button')) return; // Ignore menu button clicks
                selectFolder(item.id); // Open the folder
            });
        } else {
            // Render note
            li.textContent = item.title || 'Untitled Note';

            // Add a click handler to open the note
            li.addEventListener('click', (e) => {
                if (e.target.classList.contains('menu-button')) return;
                ipcRenderer.send('open-note', item.id); // Send the note ID to open it
            });
        }

        // 3-Dot Menu Button
        const menuButton = document.createElement('button');
        menuButton.className = 'menu-button';
        menuButton.textContent = '⋯'; // 3-dot character
        menuButton.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent the item from opening
            showMenu(e, item);
        });
        li.appendChild(menuButton);

        noteList.appendChild(li);
    });
});

// Function to show the 3-dot menu
function showMenu(event, item) {
    // Close any existing menus first
    document.querySelectorAll('.menu-options').forEach(menu => menu.remove());
    
    const menu = document.createElement('div');
    menu.className = 'menu-options three-dot-menu-content'; // Added both classes
    
    // Rename option
    const renameOption = document.createElement('div');
    renameOption.textContent = 'Rename';
    renameOption.addEventListener('click', () => {
        showInputModal(`Rename ${item.type === 'folder' ? 'Folder' : 'Note'}`, (newName) => {
            ipcRenderer.send('rename-item', { id: item.id, newName });
        });
        menu.remove();
    });
    menu.appendChild(renameOption);
    
    // Delete option
    const deleteOption = document.createElement('div');
    deleteOption.textContent = 'Delete';
    deleteOption.addEventListener('click', () => {
        showConfirmModal('Confirm Deletion', `Are you sure you want to delete "${item.title || item.name}"?`, (confirmed) => {
            if (confirmed) {
                ipcRenderer.send('delete-item', item.id);
            }
        });
        menu.remove();
    });
    menu.appendChild(deleteOption);
    
    // Position the menu near the button
    const buttonRect = event.target.getBoundingClientRect();
    menu.style.position = 'fixed';
    menu.style.left = `${buttonRect.right - 120}px`; // Adjust to keep menu visible
    menu.style.top = `${buttonRect.bottom + 5}px`;
    
    document.body.appendChild(menu);
    
    // Close when clicking outside
    const closeMenu = (e) => {
        if (!menu.contains(e.target) && e.target !== event.target) {
            menu.remove();
            document.removeEventListener('click', closeMenu);
        }
    };
    
    document.addEventListener('click', closeMenu);
}

// Add Folder Button
document.getElementById('add-folder-button').addEventListener('click', () => {
    showInputModal('Enter Folder Name', (folderName) => {
        console.log('Adding Folder:', folderName, 'Parent Folder ID:', selectedFolderId); // Debugging
        ipcRenderer.send('add-folder', { folderName, parentFolderId: selectedFolderId });
    });
});

// Add Note Button
document.getElementById('add-note-button').addEventListener('click', () => {
    showInputModal('Enter Note Title', (noteTitle) => {
        console.log('Adding Note:', noteTitle, 'Parent Folder ID:', selectedFolderId); // Debugging
        ipcRenderer.send('add-note', { noteTitle, parentFolderId: selectedFolderId });
    });
});