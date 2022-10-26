import { useEffect } from 'react'
import Head from 'next/head'
import Script from 'next/script'
import { GetStaticProps, GetStaticPaths } from 'next';
import { getAllPostIds, getPostData } from '../lib/posts'
import { Tategaki } from 'tategaki'
import { detect } from 'detect-browser'

export const getStaticPaths: GetStaticPaths = async () => {
    const paths = await getAllPostIds()

    return {
        paths,
        fallback: 'blocking'
    }
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
    let id = ""
    if (params) {
        let slugs = params.id as string[]
        id = slugs[3]
    }

    const postData = await getPostData(id)

    return {
        props: {
            postData
        },
        revalidate: 10
    }
}

export default function Post({
    postData
}: {
    postData: {
        title: string
        author: string
        link: string
        content: string
        description: string
    }
}) {

    useEffect(() => {
        if (!!document.querySelector('#heading')) return
        let heading = document.createElement('div')
        heading.id = 'heading'
        let h1 = document.createElement('h1')
        h1.innerHTML = `<a href=${postData.link}>${postData.title}</a>`
        let author = document.createElement('p')
        author.classList.add('no-indent')
        author.innerHTML = postData.author
        heading.appendChild(h1)
        heading.appendChild(author)

        let article = document.querySelector('article')
        if (article === null) return
        article.insertBefore(heading, article.firstChild)

        Array.from(article.children)
            .filter(div => div.tagName === 'P')
            .forEach(para => {
                if (para.innerHTML.trim().match(/读竖排版）$/)) {
                    para.classList.add('original-post')
                    para.innerHTML = `（<a href=${postData.link}>原载</a>《一天世界》博客）`
                }
            })

        const browser = detect()
        let tategaki = new Tategaki(article, {
            imitatePcS: true,
            shouldAdjustOrphanLine: browser ? browser.name !== 'firefox' : false
        })
        tategaki.parse()
    }, [ postData.author, postData.link, postData.title ])

    return <>
        <Head>
            <title>{`${postData.title} – 一天世界`}</title>
            <meta name="viewport" content="width=device-width, initial-scale=0.936, viewport-fit=cover" />
            <meta property="og:type" content="article" />
            <meta property="og:title" content={postData.title} />
            <meta property="og:url" content={postData.link} />
            <meta property="og:description" content={postData.description} />
            <meta property="og:site_name" content="一天世界" />
            <meta property="og:image" content="https://secure.gravatar.com/blavatar/3dd84179782d9f57210943aa1bf5064e?s=200&amp;ts=1662488619" />
            <meta property="og:image:width" content="200" />
            <meta property="og:image:height" content="200" />
            <meta property="og:locale" content="zh_CN" />
            <meta name="twitter:text:title" content={postData.title} />
            <meta name="twitter:image" content="https://secure.gravatar.com/blavatar/3dd84179782d9f57210943aa1bf5064e?s=240" />
            <meta name="twitter:card" content="summary" />
            <meta name="theme-color"
                  content="#fdfdfc"
                  media="(prefers-color-scheme: light)" />
            <meta name="theme-color"
                  content="#181a1b"
                  media="(prefers-color-scheme: dark)" />
        </Head>
        <Script type="text/javascript" src="//typesquare.com/3/tsst/script/zh_tw/typesquare.js?631f3e24d50445ffb32d203eac1e02e5&fadein=-1" charSet="utf-8"></Script>
        <div className="side-mask">
            <article dangerouslySetInnerHTML={{ __html: postData.content }}>
            </article>
        </div>
    </>
}


