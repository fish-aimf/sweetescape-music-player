export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', 'https://sweetescape.vercel.app');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-App-Token');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    if (req.headers['x-app-token'] !== process.env.APP_SHARED_TOKEN) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const { query, keyIndex, maxResults } = req.query;

    if (!query) {
        return res.status(400).json({ error: 'Missing query parameter' });
    }

    const YOUTUBE_API_KEYS = process.env.YOUTUBE_API_KEYS.split(',');

    const parsedKeyIndex = Number.isInteger(parseInt(keyIndex)) ? parseInt(keyIndex) : 0;
    const apiKey = YOUTUBE_API_KEYS[parsedKeyIndex % YOUTUBE_API_KEYS.length];

    const parsedMaxResults = Math.min(Math.max(parseInt(maxResults) || 1, 1), 50);

    try {
        const youtubeUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=${parsedMaxResults}&q=${encodeURIComponent(query)}&type=video&key=${apiKey}`;

        const response = await fetch(youtubeUrl);
        const data = await response.json();

        return res.status(200).json({
            data,
            status: response.status
        });

    } catch (error) {
        return res.status(500).json({
            error: error.message,
            status: 500
        });
    }
}
