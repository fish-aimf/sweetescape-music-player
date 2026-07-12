export default async function handler(req, res) {
  const url = `${process.env.VISITOR_KV_KV_REST_API_URL}/incr/visitors`

  const r = await fetch(url, {
    headers: {
      Authorization: `Bearer ${process.env.VISITOR_KV_KV_REST_API_TOKEN}`,
    },
  })

  const { result } = await r.json()
  res.status(200).json({ count: result })
}
