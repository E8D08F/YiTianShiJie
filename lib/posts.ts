import Parser from 'rss-parser'

let parser = new Parser({
    customFields: {
        item: [
            ['content:encoded', 'fullContent']
        ]
    }
})

export const getAllPostIds = async () => {
    const feed = await parser.parseURL('https://blog.yitianshijie.net/feed')

    return feed.items.flatMap(item => {
        const re = /blog\.yitianshijie\.net\/(20[0-9]{2})\/([01]\d)\/([0-3]\d)\/([^\/]+)\/?$/
        if (item.link != undefined) {
            const matched = item.link.match(re)
            if (matched != undefined) {

                if (item.guid != undefined) {
                    return [{
                        params: {
                            id: [ matched[1], matched[2], matched[3], matched[4] ]
                        }
                    }]
                }
            }
        }

        return []
    })
}

export const getPostData = async (id: string) => {
    const feed = await parser.parseURL('https://blog.yitianshijie.net/feed')

    
    const item = feed.items.find(item => {
        if (item.link === undefined) { return false }
        return item.link.includes(id)
    })

    if (item != undefined) {
        console.log(item.fullContent)
        return {
            title: item.title,
            author: item.creator,
            link: item.link,
            content: item.fullContent,
            description: item.content
        }
    }

    return {
        content: '<div>Fuck</div>'
    }
}
