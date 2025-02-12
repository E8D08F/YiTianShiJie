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

  return indices.slice(0, 10)
}

export const generateMetadata = async ({ params }: {
  params: Promise<Params>
}): Promise<Metadata> => {
  const postData = await getPostData(await params)
  if (!postData) notFound()
  const { title, description, link } = postData

  return {
    title: `${title === '' ? '' : title + ' – '}一天世界`,
    description,
    openGraph: {
      title,
      description,
      url: link,
      siteName: "一天世界",
      images: [
        {
          url: "/media/og.png",
          width: 1200,
          height: 630,
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
        url: "/media/twitter.png",
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
