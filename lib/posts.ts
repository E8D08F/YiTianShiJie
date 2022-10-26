import Parser from 'rss-parser'
import fetch from 'node-fetch'

const baseURL = process.env.BASE_URL

interface Post {
    title: string
    author: string
    id: string
    slug: string
    description: string
    content: string
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
    const savedPosts = await response.json() as Post[]
    const requiredPosts = savedPosts.filter(post => !remoteIDs.has(post.id)).map(post => {
        const re = /(20[0-9]{2})\/([01]\d)\/([0-3]\d)\/([^\/]+)\/?$/
        const matched = post.slug.match(re)
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

export const getPostData = async (rawID: string) => {
    const feed = await rssParser.parseURL('https://blog.yitianshijie.net/feed')
    const id = getStandardID(rawID)
    
    const item = feed.items.find(item => {
        if (!item.link) { return false }
        return item.link.endsWith(id + '/')
    })

    if (item) {
        return {
            title: item.title,
            author: item.creator,
            link: item.link,
            content: item.fullContent,
            description: (item.content as string).replace(' [&#8230;]', '…')
        }
    }

    const response = await fetch(`${baseURL}/backup.json`)
    const savedPosts = await response.json() as Post[]
    const post = savedPosts.find(post => post.slug.endsWith(id + '/'))

    if (post) {
        return {
            title: post.title,
            author: post.author,
            link: 'https://blog.yitianshijie.net/' + post.slug,
            content: post.content,
            description: post.description.replace(' [&#8230;]', '…')
        }
    }

    return null
}
