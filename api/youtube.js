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
    
    const { query, keyIndex, maxResults = 5, type = 'search' } = req.query;
    const apiKey = YOUTUBE_API_KEYS[parseInt(keyIndex) % YOUTUBE_API_KEYS.length];
    
    try {
        let youtubeUrl;
        
        if (type === 'search') {
            // Search for videos
            youtubeUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=${maxResults}&q=${encodeURIComponent(query)}&type=video&order=relevance&key=${apiKey}`;
        } else if (type === 'statistics') {
            // Get video statistics
            youtubeUrl = `https://www.googleapis.com/youtube/v3/videos?part=statistics&id=${encodeURIComponent(query)}&key=${apiKey}`;
        } else {
            return res.status(400).json({ error: 'Invalid type parameter' });
        }
        
        const response = await fetch(youtubeUrl);
        const data = await response.json();
        
        return res.status(response.status).json({
            data,
            status: response.status
        });
        
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
