const path = require('path');
const url = require('url');
const {app, BrowserWindow} = require('electron');

let win;

function createWindow() {
    win = new BrowserWindow({
        width: 705,
        height: 500,
        icon: path.join(__dirname, "../img/logo.png"),
        resizable: false,
        autoHideMenuBar: true,
        webPreferences: {
            nodeIntegration: true
        }
    });

    win.loadURL(url.format({
        pathname: path.join(__dirname, '../html/index.html'),
        protocol: 'file:',
        slashes: true
    }));

    win.on('closed', () => {
        win = null;
    });
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
    app.quit();
});