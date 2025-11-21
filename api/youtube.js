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
    
    const { query, keyIndex } = req.query;
    
    if (!query || keyIndex === undefined) {
        return res.status(400).json({ error: 'Missing query or keyIndex parameter' });
    }
    
    const apiKey = YOUTUBE_API_KEYS[parseInt(keyIndex) % YOUTUBE_API_KEYS.length];
    
    try {
        // Determine which YouTube API endpoint to use
        let baseUrl;
        if (query.includes('part=statistics') || query.includes('part=snippet,statistics')) {
            // Use videos endpoint for video details/statistics
            baseUrl = 'https://www.googleapis.com/youtube/v3/videos';
        } else {
            // Use search endpoint for searches
            baseUrl = 'https://www.googleapis.com/youtube/v3/search';
        }
        
        // Build the full URL
        const fullUrl = `${baseUrl}?${query}&key=${apiKey}`;
        
        const response = await fetch(fullUrl);
        const data = await response.json();
        
        return res.status(response.status).json({
            data,
            status: response.status
        });
        
    } catch (error) {
        console.error('YouTube API error:', error);
        return res.status(500).json({ 
            error: error.message,
            details: 'Failed to fetch from YouTube API'
        });
    }
}
