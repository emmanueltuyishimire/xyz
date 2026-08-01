import type { Config } from '@netlify/functions'

const SITE_HOST = 'www.seniorsaudit.com'
const INDEXNOW_KEY = '32b9a01e14d84e20bbab8cc55b5a13b3'
const KEY_LOCATION = `https://${SITE_HOST}/${INDEXNOW_KEY}.txt`
const SITEMAP_URL = `https://${SITE_HOST}/sitemap.xml`

async function getSitemapUrls(): Promise<string[]> {
  const res = await fetch(SITEMAP_URL)
  if (!res.ok) {
    throw new Error(`Failed to fetch sitemap (${res.status})`)
  }
  const xml = await res.text()
  return [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1])
}

export default async () => {
  try {
    const urlList = await getSitemapUrls()

    if (urlList.length === 0) {
      console.warn('IndexNow: sitemap returned no URLs, skipping submission')
      return new Response('No URLs found in sitemap', { status: 200 })
    }

    const submission = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({
        host: SITE_HOST,
        key: INDEXNOW_KEY,
        keyLocation: KEY_LOCATION,
        urlList,
      }),
    })

    const message = `IndexNow: submitted ${urlList.length} URLs (status ${submission.status})`
    console.log(message)
    return new Response(message, { status: submission.ok ? 200 : 502 })
  } catch (error) {
    const message = `IndexNow submission failed: ${(error as Error).message}`
    console.error(message)
    return new Response(message, { status: 500 })
  }
}

export const config: Config = {
  schedule: '@daily',
}
