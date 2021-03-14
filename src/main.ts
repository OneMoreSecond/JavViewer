import { app, BrowserWindow } from 'electron'
import fsPromises from 'fs/promises'

import { Configuration } from './config'
import { dispatchHook } from './hook'
import { initMenu } from './menu'

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

const config = new Configuration()

async function createWindow() : Promise<void> {
    const window = new BrowserWindow({
        webPreferences: {
            nodeIntegration: true
        }
    })

    if (config.pacPath !== undefined) {
        setPacProxy(window, config.pacPath)
    }

    window.webContents.on('dom-ready', async () => {
        const currentURL : string = window.webContents.getURL()
        await dispatchHook(currentURL, (...args) => window.webContents.executeJavaScript(...args))
    })

    await window.loadURL(resourceUrls.javlibrary)
}

async function initApp() : Promise<void> {
    initMenu()
    await config.load(Configuration.getDefaultConfigPath())
    await createWindow()
}

app.whenReady().then(initApp)

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', async () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        await createWindow()
    }
})
