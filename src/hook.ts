export async function dispatchHook(url: string, javascriptExecutor: (code: string) => Promise<unknown>) : Promise<void> {
    const logPrefix = `[Hook][dispatchHook]`
    function log(message: string) : void
    {
        console.log(logPrefix + ' ' + message)
    }
    async function execFunc(func: () => unknown) {
        await javascriptExecutor('(' + func.toString() + ')();')
    }

    log(url)

    if (url.startsWith('http://www.javlibrary.com')) {
        log('remove ads')
        await execFunc(javlibraryRemoveAds)
    }
    if (url.startsWith('http://www.javlibrary.com/cn/?v=')) {
        log('modify DOM')
        await execFunc(javlibraryModifyDOM)
    }
}

// Since following function will executed in its string form
// they should be self-contained
function javlibraryRemoveAds() : void {
    for (const bannerId of ['topbanner11', 'sidebanner11', 'middlebanner11', 'bottombanner12']) {
        const bannerDiv: HTMLElement | null = document.getElementById(bannerId)
        bannerDiv?.remove()
    }
}

function javlibraryModifyDOM() : void {
    const DEBUG = true
    const logPrefix = `[Hook][javlibraryModifyDOM]`

    function logd(message: string) : void
    {
        if (DEBUG)
        {
            console.log(logPrefix + ' ' + message)
        }
    }

    function logThrow(message: string) : never
    {
        const log_message : string = logPrefix + ' ' + message
        console.log(log_message)
        throw new Error(log_message)
    }

    const videoMakerMap = new Map([
        ['プレステージ', '118'],
    ])

    const videoIdPrefixMap = new Map([
        ['aby', '118'],
        ['abp', '118'],
        ['abs', '118'],
        ['abw', '118'],
        ['aka', '118'],
        ['dic', '118'],
        ['ppt', '118'],
        ['pxh', '118'],
        ['tem', '118'],
        ['bgn', '118'],
        ['mgt', '118'],
        ['dtt', '118'],
        ['kbi', '118'],
        ['wps', '118'],
        ['chn', '118'],
        ['sga', '118'],
        ['tre', '118'],
        ['onez', '118'],
        ['kpb', '118'],
        ['mkmp', '84'],
        ['star', '1'],
        ['stars', '1'],
        ['sdnm', '1'],
        ['sdab', '1'],
        ['fsdss', '1'],
        ['fcdss', '1'],
        ['fadss', '1'],
        ['kmhrs', '1'],
        ['msfh', '1'],
        ['sdmf', '1'],
        ['kire', '1'],
        ['gvh', '13'],
        ['nitr', '49'],
        ['honb', 'h_1133'],
    ])

    const noZeroSet = new Set([
        'sqte',
        'pfes',
        'mrss',
    ])

    logd('Starting running!')

    function getInfo(infoName: string) : {row: HTMLTableRowElement, text: string}
    {
        const infoDiv: HTMLElement | null = document.getElementById(infoName)
        if (infoDiv === null) {
            logThrow(`div with name ${infoName} is not found`)
        }

        const infoRows = infoDiv.getElementsByTagName('tr')
        if (infoRows.length !== 1) {
            logThrow(`div with name ${infoName} contains ${infoRows.length} table rows (expected 1)`)
        }
        const infoRow: HTMLTableRowElement = infoRows[0]
        if (infoRow.cells.length < 2) {
            logThrow(`div with name ${infoName} contains ${infoRow.cells.length} table columns (expected >=2)`)
        }
        const infoCell: HTMLElement = infoRow.cells[1]
        if (infoCell.textContent === null) {
            logThrow(`div with name ${infoName} contains a null textContent`)
        }
        const infoText = infoCell.textContent.trim()

        logd(infoName + ': ' + infoText)
        return {
            row: infoRow,
            text: infoText
        }
    }

    logd('Starting getting info!')

    const {text: videoMaker} = getInfo('video_maker')
    const {text: videoLabel} = getInfo('video_label')
    const {row: videoIdRow, text: videoId} = getInfo('video_id')

    let videoIdPrefix: string = videoId.slice(0, -4).toLowerCase()
    if (videoMakerMap.has(videoMaker))
    {
        videoIdPrefix = videoMakerMap.get(videoMaker) + videoIdPrefix
    }
    else if (videoIdPrefixMap.has(videoIdPrefix))
    {
        videoIdPrefix = videoIdPrefixMap.get(videoIdPrefix) + videoIdPrefix
    }
    else if (!noZeroSet.has(videoIdPrefix))
    {
        videoIdPrefix += '00'
    }

    const videoIdSuffix: string = videoId.slice(-3)
    const dmmId: string = videoIdPrefix + videoIdSuffix
    function getUrl(version: string) : string {
        return `http://cc3001.dmm.co.jp/litevideo/freepv/${dmmId[0]}/${dmmId.substring(0,3)}/${dmmId}/${dmmId}_${version}_w.mp4`
    }

    function addLink(text: string, url: string) : void {
        const linkTag = document.createElement('a')
        linkTag.href = url
        linkTag.innerHTML = text
        videoIdRow.insertCell().appendChild(linkTag)
    }

    logd('Starting adding links!')

    const insertPlace = document.getElementById('video_jacket_info')
    if (insertPlace === undefined || !(insertPlace instanceof HTMLTableElement)) {
        logThrow(`the table with name video_jacket_info is not found`)
    }

    let isVideoInserted = false

    for (const version of ['mhb', 'dmb', 'dm', 'sm'])
    {
        const url: string = getUrl(version)
        addLink(version, url)

        if (isVideoInserted)
        {
            continue
        }

        const http = new XMLHttpRequest()
        http.open('HEAD', url, false)
        http.send()
        if (http.status < 400)
        {
            const videoTag = document.createElement('video')
            videoTag.src = url
            videoTag.controls = true

            const previewRow = insertPlace.insertRow()
            previewRow.insertCell().appendChild(videoTag)

            const previewThumbs = document.getElementsByClassName('previewthumbs')[0]
            if (previewThumbs !== undefined)
            {
                previewThumbs.remove()
                previewRow.insertCell().appendChild(previewThumbs)
            }

            isVideoInserted = true
            addLink('√', '')

            logd('successful version: ' + version)
        }
    }

    if (!isVideoInserted)
    {
        addLink('×', '')
    }
}