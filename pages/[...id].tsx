import { GetStaticProps, GetStaticPaths } from 'next';
import Head from 'next/head'
import Script from 'next/script'
import DefaultErrorPage from 'next/error'
import { getAllPostIds, getPostData, PostData } from '../lib/posts'

export const getStaticPaths: GetStaticPaths = async () => {
    const paths = await getAllPostIds()

    return { paths, fallback: 'blocking' }
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
    const postData = params ?
        await getPostData((params.id as string[]).join('/')) : null

    return {
        props: { postData },
        revalidate: 10
    }
}

export default function Post({ postData }: { postData?: PostData }) {
    if (!postData) { return <DefaultErrorPage statusCode={404} /> }
    const { title, content, description, link } = postData

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
            <meta property="og:locale" content="zh_HK" />
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
        <Script type="text/javascript" src="//typesquare.com/3/tsst/script/zh_tw/typesquare.js?631f3e24d50445ffb32d203eac1e02e5&fadein=-1" charSet="utf-8"></Script>
        <div className="side-mask" dangerouslySetInnerHTML={{ __html: content }}></div>
    </>
}


