import { app, BrowserWindow } from 'electron'
import fsPromises from 'fs/promises'

import { Configuration } from './config'

const resourceUrls = {
    javlibrary: 'http://www.javlibrary.com/cn',
}

function showUrl(window: BrowserWindow, url: string) : Promise<void> {
    window.title = url
    return window.loadURL(url)
}

async function createWindow(config: Configuration) : Promise<void> {
    const window = new BrowserWindow({
        webPreferences: {
            nodeIntegration: true
        }
    })

    if (config.pacPath !== undefined) {
        // file protocol is not supported by setProxy
        const pacContent: string = await fsPromises.readFile(config.pacPath, 'utf-8')
        const encodedPacContent: string = 'data:text/plain;base64,' + Buffer.from(pacContent, 'utf8').toString('base64')
        await window.webContents.session.setProxy({pacScript: encodedPacContent})
    }

    await showUrl(window, resourceUrls.javlibrary)
}

const config = new Configuration()

async function initApp() : Promise<void> {
    await config.load(Configuration.getDefaultConfigPath())
    await createWindow(config)
}

app.whenReady().then(initApp)

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', async () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        await createWindow(config)
    }
})
