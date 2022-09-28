import Parser from 'rss-parser'

const baseURL = process.env.BASE_URL

let parser = new Parser({
    customFields: {
        item: [
            [ 'content:encoded', 'fullContent' ]
        ]
    }
})

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

export const getAllPostIds = async () => {
    let remoteIDs = new Set<string>()
    const feed = await parser.parseURL('https://blog.yitianshijie.net/feed')
    const remotePosts = feed.items.flatMap(item => {
        if (!item.guid) { return }
        remoteIDs.add(item.guid)

        const re = /blog\.yitianshijie\.net\/(20[0-9]{2})\/([01]\d)\/([0-3]\d)\/([^\/]+)\/?$/
        if (item.link != undefined) {
            const matched = item.link.match(re)
            if (matched != undefined) {
                return [{
                    params: {
                        id: [ matched[1], matched[2], matched[3], matched[4] ]
                    }
                }]
            }
        }

        return []
    }) as Slug[]

    const response = await fetch(`${baseURL}/backup.json`)
    const backupPosts = await response.json() as Post[]
    const localPosts = backupPosts.filter(post => !remoteIDs.has(post.id)).map(post => {
        const re = /(20[0-9]{2})\/([01]\d)\/([0-3]\d)\/([^\/]+)\/?$/
        const matched = post.slug.match(re)
        if (matched != undefined) {
            return {
                params: {
                    id: [ matched[1], matched[2], matched[3], matched[4] ]
                }
            }
        }
    }) as Slug[]

    const combinedPosts = remotePosts.concat(localPosts)

    return combinedPosts
}

export const getPostData = async (id: string) => {
    const feed = await parser.parseURL('https://blog.yitianshijie.net/feed')
    
    const item = feed.items.find(item => {
        if (item.link === undefined) { return false }
        return item.link.includes(id)
    })

    if (item != undefined) {
        return {
            title: item.title,
            author: item.creator,
            link: item.link,
            content: item.fullContent,
            description: (item.content as string).replace('[&#8230;]', '…')
        }
    } else {
        const response = await fetch(`${baseURL}/backup.json`)
        const backupPosts = await response.json() as Post[]
        const found =backupPosts.find(post => post.slug.includes(id))

        if (found != undefined) {
            return {
                title: found.title,
                author: found.author,
                link: 'https://blog.yitianshijie.net/' + found.slug,
                content: found.content,
                description: found.description.replace('[&#8230;]', '…')
            }
        }
    }

    return {
        content: '<div>Not Found</div>'
    }
}
