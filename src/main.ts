import { app, BrowserWindow } from 'electron'

function createWindow() {
    const win = new BrowserWindow({
        webPreferences: {
            nodeIntegration: true
        }
    })
    win.loadURL('https://bing.com')
}

function initApp() {
    createWindow()
}

app.whenReady().then(initApp)

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow()
    }
})
