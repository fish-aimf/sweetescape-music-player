export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', 'https://sweetescape.vercel.app');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

    const { type = 'search', query, artistId, index = 0, limit = 8 } = req.query;

    if (!query && type !== 'artist_top') {
        return res.status(400).json({ error: 'Missing query parameter' });
    }

    try {
        let url;

        if (type === 'search') {
            url = `https://api.deezer.com/search?q=${encodeURIComponent(query)}&limit=${limit}`;
        } else if (type === 'search_artist') {
            url = `https://api.deezer.com/search/artist?q=${encodeURIComponent(query)}&limit=${limit}`;
        } else if (type === 'artist_top') {
            if (!artistId) return res.status(400).json({ error: 'Missing artistId parameter' });
            url = `https://api.deezer.com/artist/${encodeURIComponent(artistId)}/top?limit=${limit}&index=${index}`;
        } else {
            return res.status(400).json({ error: 'Invalid type parameter' });
        }

        const response = await fetch(url);
        const data = await response.json();

        if (data && data.error) {
            return res.status(429).json({ data, status: 429 });
        }

        return res.status(response.status).json({ data, status: response.status });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
