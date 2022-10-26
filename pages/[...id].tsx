import { useEffect } from 'react'
import Head from 'next/head'
import Script from 'next/script'
import { GetStaticProps, GetStaticPaths } from 'next';
import { getAllPostIds, getPostData } from '../lib/posts'
import { Tategaki } from 'tategaki'
import { detect } from 'detect-browser'
import DefaultErrorPage from 'next/error'

export const getStaticPaths: GetStaticPaths = async () => {
    const paths = await getAllPostIds()

    return {
        paths,
        fallback: 'blocking'
    }
}


export const getStaticProps: GetStaticProps = async ({ params }) => {
    const postData = params ?
        await getPostData((params.id as string[]).join('/')) : null

    return {
        props: { notFound: !postData, ...postData },
        revalidate: 10
    }
}

export default function Post({
    notFound, title, author, link, content, description
}: {
    notFound: boolean
    title: string
    author: string
    link: string
    content: string
    description: string
}) {

    useEffect(() => {
        if (!!document.querySelector('.tategaita') || notFound) return

        let article = document.querySelector('article')
        if (article === null) return

        let paragraphs = Array.from(article.querySelectorAll('p'))

        let para = paragraphs[paragraphs.length-1]
        if (para.innerHTML.trim().match(/读竖排版）$/)) {
            para.classList.add('original-post')
            para.innerHTML = `（<a href=${link}>原载</a>《一天世界》博客）`
        }

        const browser = detect()
        let tategaki = new Tategaki(article, {
            imitatePcS: true,
            shouldAdjustOrphanLine: browser ? browser.name !== 'firefox' : false
        })
        tategaki.parse()
        article.classList.add('tategaita')
    }, [ notFound, author, link, title ])
        
    if (notFound) { return <DefaultErrorPage statusCode={404} /> }

    return <>
        <Head>
            <title>{`${title} – 一天世界`}</title>
            <meta name="viewport" content="width=device-width, initial-scale=0.936, viewport-fit=cover" />
            <meta property="og:type" content="article" />
            <meta property="og:title" content={title} />
            <meta property="og:url" content={link} />
            <meta property="og:description" content={description} />
            <meta property="og:site_name" content="一天世界" />
            <meta property="og:image" content="https://secure.gravatar.com/blavatar/3dd84179782d9f57210943aa1bf5064e?s=200&amp;ts=1662488619" />
            <meta property="og:image:width" content="200" />
            <meta property="og:image:height" content="200" />
            <meta property="og:locale" content="zh_CN" />
            <meta name="twitter:text:title" content={title} />
            <meta name="twitter:image" content="https://secure.gravatar.com/blavatar/3dd84179782d9f57210943aa1bf5064e?s=240" />
            <meta name="twitter:card" content="summary" />
            <meta name="theme-color"
                  content="#fdfdfc"
                  media="(prefers-color-scheme: light)" />
            <meta name="theme-color"
                  content="#181a1b"
                  media="(prefers-color-scheme: dark)" />
        </Head>
        <Script type="text/javascript" src="//typesquare.com/3/tsst/script/zh_tw/typesquare.js?631f3e24d50445ffb32d203eac1e02e5" charSet="utf-8"></Script>
        <div className="side-mask" dangerouslySetInnerHTML={{ __html: `
            <article>
                <div id="heading">
                    <h1><a href="${link}">${title}</a></h1>
                    <p class="no-indent">${author}</p>
                </div>

                ${content}
            </article>`
        }}>
        </div>
    </>
}


