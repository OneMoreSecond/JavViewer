import fsPromises from 'fs/promises'
import path from 'path'

export class Configuration {
    pacPath?: string

    async load(configPath: string) : Promise<void> {
        const configStr: string = await fsPromises.readFile(configPath, 'utf8')
        const config = JSON.parse(configStr)

        this.pacPath = config.pacPath
    }

    private static defaultConfigFileName = 'javviewer_config.json'

    static getDefaultConfigPath() : string {
        const configDir: string = process.env.HOME ?? process.cwd()
        const configPath: string = path.join(configDir, Configuration.defaultConfigFileName)
        return configPath
    }
}
