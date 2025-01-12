import { getAllPostIds, getPostData } from "@/app/posts"
import type { Params } from "@/app/posts"
import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/next"


// Incremental Static Regeneration
// MARK: Default `revalidate` to false, allowing resource cached indefinitely
// export const revalidate = 600

export const generateStaticParams = async (): Promise<Params[]> => {
  const indices = await getAllPostIds()

  return indices.slice(0, 30)
}

export const generateMetadata = async ({ params }: {
  params: Promise<Params>
}): Promise<Metadata> => {
  const postData = await getPostData(await params)
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
  const postData = await getPostData(await params)
  if (!postData) notFound()

  return <>
    <Analytics />
    <SpeedInsights />

    <div className="side-mask"
      dangerouslySetInnerHTML={{ __html: postData.content }}
    ></div>
  </>
}

export default Page
