import { NextRequest, NextResponse } from "next/server"
import { Vercel } from "@vercel/sdk"


const vercel = new Vercel({
  bearerToken: process.env["BEARER_TOKEN"],
})

const PUBLICATION_DATE = /<news:publication_date>([^<]+)<\/news:publication_date>/
export const GET = async (req: NextRequest) => {
  try {
    if (req.headers.get("authorization") !== `Bearer ${process.env["CRON_SECRET"]}`)
      return new Response('Unauthorised', {
        status: 401,
      })

    const publication = await fetch(
      "https://blog.yitianshijie.net/news-sitemap.xml", {
        cache: "no-store",
      })
      .then(fetched => fetched.text())
      .then(raw => {
        return raw.match(PUBLICATION_DATE)
      })

    if (!publication)
      throw new Error("No Publication Information")

    const publication_date = new Date(publication[1])

    const result = await vercel.deployments.getDeployments({
      app: "yitianshijie",
      target: "production",
      state: "READY",
      limit: 1,
    })

    if (result.deployments.length == 0)
      throw new Error("No Deployment Found")

    const deployment = result.deployments[0]
    const ready = deployment.ready
    if (!ready)
      throw new Error("Unready Deployment")

    const redeploy = publication_date.getTime() >= ready
    if (redeploy) {
      const { id, status } = await vercel.deployments.createDeployment({
        requestBody: {
          name: "yitianshijie",
          target: "production",
          deploymentId: deployment.uid,
        }
      })

      console.log(`Deployment created: ${id}, status ${status}`)
    } else { console.log(`No Newer Publication`) }

    return NextResponse.json({
      ok: true,
      redeploy,
      publication: publication_date.getTime(),
      deployment: ready,
    })
  } catch (error) {
    const message = error instanceof Error ? `Error: ${error.message}` : String(error)
    console.error(message)
    return NextResponse.json({
      error: message,
    }, { status: 500 })
  }
}
