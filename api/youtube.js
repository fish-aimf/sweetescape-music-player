export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const YOUTUBE_API_KEYS = process.env.YOUTUBE_API_KEYS.split(',');
    const YOUTUBE_API_URL = 'https://www.googleapis.com/youtube/v3/search';
    
    const { query, keyIndex } = req.query;
    const apiKey = YOUTUBE_API_KEYS[parseInt(keyIndex) % YOUTUBE_API_KEYS.length];
    
    try {
        const response = await fetch(`${YOUTUBE_API_URL}${query}&key=${apiKey}`);
        const data = await response.json();
        
        return res.status(response.status).json({
            data,
            status: response.status
        });
        
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
