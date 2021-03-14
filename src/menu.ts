import { Menu } from 'electron'

export function initMenu(): void {
    const template = [
        { role: 'editMenu' as const },
        { role: 'viewMenu' as const },
        { role: 'windowMenu' as const },
        {
            label: 'Navigation',
            submenu: [
                { role: 'recentDocuments' as const },
                { role: 'toggleTabBar' as const },
            ]
        },
    ]

    const menu = Menu.buildFromTemplate(template)
    Menu.setApplicationMenu(menu)
}
