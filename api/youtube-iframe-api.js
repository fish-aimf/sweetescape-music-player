export default async function handler(req, res) {
  try {
    const upstream = await fetch('https://www.youtube.com/iframe_api', {
      headers: { 'User-Agent': req.headers['user-agent'] || 'Mozilla/5.0' },
    })
    if (!upstream.ok) {
      throw new Error(`iframe_api responded ${upstream.status}`)
    }
    const script = await upstream.text()
    res.setHeader('Content-Type', 'text/javascript; charset=utf-8')
    res.setHeader('Cache-Control', 'public, max-age=600, s-maxage=3600, stale-while-revalidate=86400')
    res.status(200).send(script)
  } catch (error) {
    res.setHeader('Cache-Control', 'no-store')
    res.status(502).send(`/* ${error.message} */`)
  }
}
