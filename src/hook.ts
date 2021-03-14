export async function dispatch_hook(url: string, javascriptExecutor: (code: string) => Promise<unknown>) : Promise<void> {
    if (url.startsWith('http://www.javlibrary.com/cn/?v=')) {
        await javascriptExecutor('(' + javlibrary_modify_dom.toString() + ')();')
        //await javascriptExecutor( javlibrary_modify_dom.toString() + ';' + javlibrary_modify_dom.name + '();')
    }
}

// Since this function will executed in its string form,
// it should be self-contained
function javlibrary_modify_dom() : void {
    const DEBUG = true
    const log_prefix = '[Hook][modify_dom]'

    function logd(message: string) : void
    {
        if (DEBUG)
        {
            console.log(log_prefix + ' ' + message)
        }
    }

    function log_throw(message: string) : never
    {
        const log_message : string = log_prefix + ' ' + message
        console.log(log_message)
        throw new Error(log_message)
    }

    const video_maker_dict = new Map([
        ['プレステージ', '118'],
    ])

    const video_id_prefix_dict = new Map([
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

    const no_zero_set = new Set([
        'sqte',
        'pfes',
        'mrss',
    ])

    logd('Starting running!')

    function get_info(info_name: string) : {row: HTMLTableRowElement, text: string}
    {
        const info_div: HTMLElement | null = document.getElementById(info_name)
        if (info_div === null) {
            log_throw(`div with name ${info_name} is not found`)
        }

        const info_rows = info_div.getElementsByTagName('tr')
        if (info_rows.length !== 1) {
            log_throw(`div with name ${info_name} contains ${info_rows.length} table rows (expected 1)`)
        }
        const info_row: HTMLTableRowElement = info_rows[0]
        if (info_row.cells.length < 2) {
            log_throw(`div with name ${info_name} contains ${info_row.cells.length} table columns (expected >=2)`)
        }
        const info_cell: HTMLElement = info_row.cells[1]
        if (info_cell.textContent === null) {
            log_throw(`div with name ${info_name} contains a null textContent`)
        }
        const info_text = info_cell.textContent.trim()

        logd(info_name + ': ' + info_text)
        return {
            row: info_row,
            text: info_text
        }
    }

    logd('Starting getting info!')

    const {text: video_maker} = get_info('video_maker')
    const {text: video_label} = get_info('video_label')
    const {row: video_id_row, text: video_id} = get_info('video_id')

    let video_id_prefix: string = video_id.slice(0, -4).toLowerCase()
    if (video_maker_dict.has(video_maker))
    {
        video_id_prefix = video_maker_dict.get(video_maker) + video_id_prefix
    }
    else if (video_id_prefix_dict.has(video_id_prefix))
    {
        video_id_prefix = video_id_prefix_dict.get(video_id_prefix) + video_id_prefix
    }
    else if (!no_zero_set.has(video_id_prefix))
    {
        video_id_prefix += '00'
    }

    const video_id_suffix: string = video_id.slice(-3)
    const dmm_id: string = video_id_prefix + video_id_suffix
    function getUrl(version: string) : string {
        return `http://cc3001.dmm.co.jp/litevideo/freepv/${dmm_id[0]}/${dmm_id.substring(0,3)}/${dmm_id}/${dmm_id}_${version}_w.mp4`
    }

    function addLink(text: string, url: string) : void {
        const link_tag = document.createElement('a')
        link_tag.href = url
        link_tag.innerHTML = text
        video_id_row.insertCell().appendChild(link_tag)
    }

    logd('Starting adding links!')

    const right_column_div = document.getElementById('rightcolumn')
    if (right_column_div === null) {
        log_throw(`div with name rightcolumn not found`)
    }

    const insert_place = document.getElementById('video_jacket_info')
    if (insert_place === undefined || !(insert_place instanceof HTMLTableElement)) {
        log_throw(`the table with name video_jacket_info is not found`)
    }

    let is_video_inserted = false

    for (const version of ['mhb', 'dmb', 'dm', 'sm'])
    {
        const url: string = getUrl(version)
        addLink(version, url)

        if (is_video_inserted)
        {
            continue
        }

        const http = new XMLHttpRequest()
        http.open('HEAD', url, false)
        http.send()
        if (http.status < 400)
        {
            const video_tag = document.createElement('video')
            video_tag.src = url
            video_tag.controls = true

            const preview_row = insert_place.insertRow()
            preview_row.insertCell().appendChild(video_tag)

            const preview_thumbs = document.getElementsByClassName('previewthumbs')[0]
            if (preview_thumbs !== undefined)
            {
                right_column_div.removeChild(preview_thumbs)
                preview_row.insertCell().appendChild(preview_thumbs)
            }

            is_video_inserted = true
            addLink('√', '')

            logd('successful version: ' + version)
        }
    }

    if (!is_video_inserted)
    {
        addLink('×', '')
    }
}