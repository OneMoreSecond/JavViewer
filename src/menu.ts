import { BrowserWindow, Menu, MenuItem } from 'electron'

export function initMenu(): void {
    const template = [
        { role: 'fileMenu' as const },
        { role: 'editMenu' as const },
        { role: 'viewMenu' as const },
        {
            label: 'Navigation',
            submenu: [
                {
                    label: 'Go forward',
                    accelerator: 'CommandOrControl+Right',
                    click: (item: MenuItem, window: BrowserWindow | undefined) => {
                        window?.webContents.goForward()
                    }
                },
                {
                    label: 'Go back',
                    accelerator: 'CommandOrControl+Left',
                    click: (item: MenuItem, window: BrowserWindow | undefined) => {
                        window?.webContents.goBack()
                    }
                },
            ]
        },
    ]

    const menu = Menu.buildFromTemplate(template)
    Menu.setApplicationMenu(menu)
}
