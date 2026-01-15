export default async function handler(req, res) {
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
    
    const { query, keyIndex } = req.query;
    const apiKey = YOUTUBE_API_KEYS[parseInt(keyIndex) % YOUTUBE_API_KEYS.length];
    
    try {
        const youtubeUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=8&q=${encodeURIComponent(query)}&type=video&key=${apiKey}`;
        
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
