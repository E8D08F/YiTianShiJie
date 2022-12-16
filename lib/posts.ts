import Parser from 'rss-parser'
import fetch from 'node-fetch'
import { parseHTML } from 'linkedom'
import { Tategaki } from 'tategaki'
import { convert } from 'html-to-text'

const baseURL = process.env.BASE_URL

export interface PostData {
    title: string
    author: string
    id?: string
    slug?: string
    content: string
    description?: string
    link?: string
}

interface Slug {
    params: { id: string[] }
}

let rssParser = new Parser({
    customFields: {
        item: [ [ 'content:encoded', 'fullContent' ] ]
    }
})

export const getAllPostIds = async () => {
    let remoteIDs = new Set<string>()
    const feed = await rssParser.parseURL('https://blog.yitianshijie.net/feed')
    const posts = feed.items.flatMap(item => {
        if (!item.guid) { return }
        remoteIDs.add(item.guid)

        const re = /blog\.yitianshijie\.net\/(20[0-9]{2})\/([01]\d)\/([0-3]\d)\/([^\/]+)\/?$/
        if (item.link) {
            const matched = item.link.match(re)
            if (matched) {
                return [{
                    params: { id: [ ...matched.slice(1, 5) ] }
                }]
            }
        }

        return []
    }) as Slug[]

    return posts
}

const getStandardID = (id: string, seperated: boolean=false) => {
    const re = /(20[0-9]{2})\/([01]\d)\/([0-3]\d)\/([^\/]+)$/
    const matched = id.match(re)
    return matched ? (seperated ? matched : matched[0]) : null
}

const getChunghwanDate = (year: string, month: number, day: number) => {
    const chunghwanNumbers = [
        [ '〇', '一', '二', '三', '四', '五', '六', '七', '八', '九' ],
        [ '', '十', '廿', '卅' ]
    ]

    const twoDigitsNumber = (x: number) => 
        chunghwanNumbers[1][Math.floor(x / 10)] + 
        chunghwanNumbers[0][x % 10] 

    let date = Array.from(year).map(ch => chunghwanNumbers[0][parseInt(ch)]).join('') + '年'
    date += twoDigitsNumber(month) + '月'
    date += twoDigitsNumber(day) + '日'
    return date
}

const getProcessedHTML = ({ link, title, author, content }: PostData) => {
    let chunghwanDate: string | null = null
    if (title === '') {
        const ids = getStandardID(link!, true)!
        chunghwanDate = getChunghwanDate(
            ids[1],
            parseInt(ids[2]),
            parseInt(ids[3])
        )
    }

    const { window: { document } } = parseHTML(`
    <!DOCTYPE html>
    <html>
    <body>
        <article>
            <div id="heading">
                <h1><a href="${link}">${chunghwanDate ? chunghwanDate : title}</a></h1>
                <p class="no-indent">${author}</p>
            </div>
        
            ${content}
        </article>
    </body>
    </html>`)

    let paragraphs = Array.from(document.body.querySelectorAll('p'))

    let para = paragraphs[paragraphs.length-1]
    if (para.innerHTML.trim().match(/读竖排版）$/)) {
        para.classList.add('original-post')
        para.innerHTML = `（<a href=${link}>原载</a>《一天世界》博客）`
    } else if (para.innerHTML.trim().match(/讀(豎|竪)排版）$/)) {
        para.classList.add('original-post')
        para.innerHTML = `（<a href=${link}>原載</a>《一天世界》博客）`
    }

    let article = document.body.querySelector('article')!
    let tategaki = new Tategaki(article, {
        imitatePcS: true,
        shouldAdjustOrphanLine: true,
        // shouldRemoveStyle: true
        // Browser detection is of no use in generating HTML 
    }, document)
    tategaki.parse()

    return document.body.innerHTML
}

const retrieveDataDirectlyFromWebsite = async (id: string) => {
    const link = `https://blog.yitianshijie.net/${id}`
    const r_2 = await fetch(link)
    const rawHTML = r_2.ok ? await r_2.text() : null

    if (!rawHTML) { return null }

    const { window: { document } } = parseHTML(rawHTML)
    const article = document.querySelector('article')
    if (!article) { return null }
    const title = convert(article.querySelector('h1.entry-title')!.innerHTML)
    const author = article.querySelector('.byline .author a')!.innerHTML
    const contentElement = article.querySelector('.entry-content')! as HTMLElement
    const content = contentElement.innerHTML


    const descriptionRaw = contentElement.innerText.trim().replaceAll('\n', ' ')
    const description = descriptionRaw.slice(0, Math.min(55, descriptionRaw.length)) + '…'

    return {
        title,
        author,
        content: getProcessedHTML({ link, title, author, content }),
        description,
        link,
    }
}

export const getPostData = async (rawID: string) => {
    const feed = await rssParser.parseURL('https://blog.yitianshijie.net/feed')
    const id = getStandardID(rawID)

    if (!id) { return null }
    
    const item = feed.items.find(item => {
        if (!item.link) { return false }
        return item.link.endsWith(id + '/')
    })

    if (item && item.title && item.creator) {
        const content = getProcessedHTML({
            link: item.link,
            title: item.title,
            author: item.creator,
            content: item.fullContent,
        })
        return {
            title: item.title,
            author: item.creator,
            content,
            description: (item.content as string).replace(' [&#8230;]', '…'),
            link: item.link,
        }
    }

    return retrieveDataDirectlyFromWebsite(id)
}
