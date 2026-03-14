export default async function handler(req, res) {
  const baseUrl = `https://api.vercel.com/v1/edge-config/ecfg_rppgupnqb0nwmnkyx4bshenbg0ff`
  const headers = {
    Authorization: `Bearer ${process.env.VERCEL_API_TOKEN}`,
    'Content-Type': 'application/json',
  }

  const readRes = await fetch(`${baseUrl}/item/visitors`, { headers })
  const { value } = await readRes.json()
  const count = Number(value ?? 9979) + 1

  await fetch(`${baseUrl}/items`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({
      items: [{ operation: 'upsert', key: 'visitors', value: count }]
    })
  })

  res.status(200).json({ count })
}
