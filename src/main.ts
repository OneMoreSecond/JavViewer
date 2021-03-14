import { app, BrowserWindow } from 'electron'
import fsPromises from 'fs/promises'

import { Configuration } from './config'
import { dispatchHook } from './hook'

const resourceUrls = {
    javlibrary: 'http://www.javlibrary.com/cn',
}

async function setPacProxy(window: BrowserWindow, pacPath: string) : Promise<void> {
    let pacScriptUrl: string
    try {
        // Handle config.pacPath as a local path
        // "file://" URL is not supported by setProxy
        // so we have to use "data:" protocol
        const pacContent: string = await fsPromises.readFile(pacPath, 'utf-8')
        pacScriptUrl = 'data:text/plain;base64,' + Buffer.from(pacContent, 'utf8').toString('base64')
        console.log(`[config][pacPath] local PAC file ${pacPath} loaded`)
    }
    catch {
        pacScriptUrl = pacPath
        console.log(`[config][pacPath] local PAC file ${pacPath} not found. treat it as URL`)
    }
    await window.webContents.session.setProxy({pacScript: pacScriptUrl})
}

async function createWindow(config: Configuration) : Promise<void> {
    const window = new BrowserWindow({
        webPreferences: {
            nodeIntegration: true
        }
    })
    window.webContents.openDevTools()

    if (config.pacPath !== undefined) {
        setPacProxy(window, config.pacPath)
    }

    window.webContents.on('did-finish-load', async () => {
        const currentURL : string = window.webContents.getURL()
        window.title = currentURL
        await dispatchHook(currentURL, (...args) => window.webContents.executeJavaScript(...args))
    })

    await window.loadURL(resourceUrls.javlibrary)
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
