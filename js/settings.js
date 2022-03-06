const {remote} = require('electron');

function openModal() {
    let win = new remote.BrowserWindow({
        parent: remote.getCurrentWindow(),
        modal: true,
        width: 500,
        height: 240,
        icon: __dirname + "/img/logo.png",
        resizable: false,
        autoHideMenuBar: true,
        webPreferences: {
            nodeIntegration: true
        }
    });

    var theUrl = 'file://' + __dirname + '/settings.html';
    win.loadURL(theUrl);
}