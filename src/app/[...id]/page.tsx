import { getAllPostIds, getPostData } from "../posts"
import type { Metadata } from "next"
import { notFound } from "next/navigation"


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
    },
    twitter: {
      title,
      description,
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
    <div className="side-mask"
      dangerouslySetInnerHTML={{ __html: postData.content }}
    ></div>
  </>
}

export default Page
