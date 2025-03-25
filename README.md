# reMind

A simple sticky note habit tracking desktop application built using Electron. This app provides a seamless sticky-note experience with a central hub and multiple sticky note windows.

## Features
- Create, edit, and delete sticky notes
- Multi-window support
- Persistent storage for notes
- Schedule reminders
- Mark reminders as habits
- Habit tracking

## Prerequisites
Make sure you have the following installed on your machine:

- [Node.js](https://nodejs.org/) (v16 or higher)

## Installation
Follow these steps to set up the project:

1. Clone the repository:
    ```bash
    git clone https://github.com/Ordisian/Software-Project.git
    cd software-project
    ```

2. Install dependencies:
    ```bash
    npm install
    ```

## Installing Electron
If Electron is not installed, you can install it and other modules using npm:

```bash
npm install electron --save-dev
npm install play-sound --save-dev
npm install node-schedule --save-dev
npm install electron-builder --save-dev
```

## Running the App
To start the app in development mode, run the following command:

```bash
npm start
```

## Packaging the App
To build the app for production:

```bash
npm run build
```

## Project Structure
```plaintext
reMind/
├── data/
├── node_modules/             # Installing electron will add this directory
├── dist/                     # This is where the setup exe will be found after building
├── sounds/
├── assets/
├── src/
│   ├── main/                 # Main process files (Electron backend)
│   │   ├── main.js           
│   │   ├── ipcHandlers.js    
│   │   ├── noteManager.js    
│   │   ├── windowManager.js  
│   ├── renderer/             # Frontend files
│   │   ├── hub/
│   │   │   ├── hub.css
│   │   │   ├── hub.html
│   │   │   └── hub.js
│   │   ├── note/
│   │   │   ├── note.css
│   │   │   ├── note.html
│   │   │   └── note.js
├── package.json              # Project configuration
└── README.md
```

## License
This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more information.

