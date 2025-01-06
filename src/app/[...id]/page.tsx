import { getAllPostIds, getPostData } from "../posts"
import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { Analytics } from "@vercel/analytics/react"


// Incremental Static Regeneration
export const revalidate = 60
export const dynamicParams = true

type Params = { id: string[] }  // `path/to/page` -> `[ 'path', 'to', 'page' ]`
export const generateStaticParams = async (): Promise<Params[]> => {
  const indices = await getAllPostIds()

  return indices.map(path => ({
    id: path.params.id
  }))
}

export const generateMetadata = async ({ params }: {
  params: Promise<Params>
}): Promise<Metadata> => {
  const { id } = await params
  if (!id) notFound()

  const postData = await getPostData(id.join('/'))
  if (!postData) notFound()
  const { title, description, link } = postData

  return {
    title: `${title === '' ? '' : title + ' – '}一天世界`,
    openGraph: {
      title,
      description,
      url: link,
      siteName: "一天世界",
      images: [
        {
          url: "https://secure.gravatar.com/blavatar/3dd84179782d9f57210943aa1bf5064e?s=200",
          width: 200,
          height: 200,
        },
      ],
      locale: "zh_HK",
      type: "article",
    },
    twitter: {
      title,
      description,
      card: "summary",
      images: {
        url: "https://secure.gravatar.com/blavatar/3dd84179782d9f57210943aa1bf5064e?s=240",
      }
    }
  }
}

const Page = async ({ params }: {
  params: Promise<Params>
}) => {
  const { id } = await params
  if (!id) notFound()

  const postData = await getPostData(id.join('/'))
  if (!postData) notFound()

  return <>
    <Analytics />

    <div className="side-mask"
      dangerouslySetInnerHTML={{ __html: postData.content }}
    ></div>
  </>
}

export default Page
