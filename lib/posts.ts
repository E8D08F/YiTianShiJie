import Parser from 'rss-parser'
import fetch from 'node-fetch'
import { parseHTML } from 'linkedom'
import { Tategaki } from 'tategaki'

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
    const remotePosts = feed.items.flatMap(item => {
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

    const response = await fetch(`${baseURL}/backup.json`)
    const savedPosts = await response.json() as PostData[]
    const requiredPosts = savedPosts.filter(post => post.id && !remoteIDs.has(post.id)).map(post => {
        const re = /(20[0-9]{2})\/([01]\d)\/([0-3]\d)\/([^\/]+)\/?$/
        const matched = post.slug!.match(re)
        if (matched) {
            return {
                params: { id: [ ...matched.slice(1, 5) ] }
            }
        }
    }) as Slug[]

    const combinedPosts = remotePosts.concat(requiredPosts)

    return combinedPosts
}

const getStandardID = (id: string) => {
    const re = /(20[0-9]{2})\/([01]\d)\/([0-3]\d)\/([^\/]+)$/
    const matched = id.match(re)
    return matched ? matched[0] : null
}

const getProcessedHTML = ({ link, title, author, content }: PostData) => {
    const { window: { document } } = parseHTML(`
    <!DOCTYPE html>
    <html>
    <body>
        <article>
            <div id="heading">
                <h1><a href="${link}">${title}</a></h1>
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
    } else if (para.innerHTML.trim().match(/讀豎排版）$/)) {
        para.classList.add('original-post')
        para.innerHTML = `（<a href=${link}>原載</a>《一天世界》博客）`
    }

    let article = document.body.querySelector('article')!
    let tategaki = new Tategaki(article, {
        imitatePcS: true,
        shouldAdjustOrphanLine: true
        // Browser detection is of no use in generating HTML 
    }, document)
    tategaki.parse()

    return document.body.innerHTML
}

export const getPostData = async (rawID: string) => {
    const feed = await rssParser.parseURL('https://blog.yitianshijie.net/feed')
    const id = getStandardID(rawID)
    
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

    const response = await fetch(`${baseURL}/backup.json`)
    const savedPosts = await response.json() as PostData[]
    const post = savedPosts.find(post => post.slug!.endsWith(id + '/'))

    if (post) {
        const link = 'https://blog.yitianshijie.net/' + post.slug
        const content = getProcessedHTML({ link, ...post })

        return {
            title: post.title,
            author: post.author,
            content,
            description: post.description!.replace(' [&#8230;]', '…'),
            link
        }
    }

    return null
}
