const SEARCH_CACHE = 'public, s-maxage=86400, stale-while-revalidate=604800';
const SHORT_CACHE = 'public, s-maxage=3600, stale-while-revalidate=86400';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', 'https://sweetescape.vercel.app');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
    
    const YOUTUBE_API_KEYS = process.env.YOUTUBE_API_KEYS.split(',');
    const { query, keyIndex, maxResults, type = 'search', pageToken } = req.query;
    const apiKey = YOUTUBE_API_KEYS[parseInt(keyIndex) % YOUTUBE_API_KEYS.length];

    const parsedMaxResults = Math.min(Math.max(parseInt(maxResults) || 5, 1), 50);
    
    try {
        let youtubeUrl;
        
        if (type === 'search') {
            youtubeUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=${parsedMaxResults}&q=${encodeURIComponent(query)}&type=video&order=relevance&key=${apiKey}`;
            if (pageToken) youtubeUrl += `&pageToken=${encodeURIComponent(pageToken)}`;
        } else if (type === 'statistics') {
            youtubeUrl = `https://www.googleapis.com/youtube/v3/videos?part=statistics&id=${encodeURIComponent(query)}&key=${apiKey}`;
        } else if (type === 'combined') {
            let searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=${parsedMaxResults}&q=${encodeURIComponent(query)}&type=video&order=relevance&key=${apiKey}`;
            if (pageToken) searchUrl += `&pageToken=${encodeURIComponent(pageToken)}`;
            const searchResponse = await fetch(searchUrl);
            const searchData = await searchResponse.json();
            if (!searchResponse.ok) {
                return res.status(searchResponse.status).json({ data: searchData, status: searchResponse.status });
            }
            const items = searchData.items || [];
            const nextPageToken = searchData.nextPageToken || null;
            if (items.length === 0) {
                res.setHeader('Cache-Control', SHORT_CACHE);
                return res.status(200).json({ data: { items: [], nextPageToken: null }, status: 200 });
            }
            const videoIds = items.map(item => item.id.videoId).join(',');
            const statsUrl = `https://www.googleapis.com/youtube/v3/videos?part=statistics&id=${encodeURIComponent(videoIds)}&key=${apiKey}`;
            const statsResponse = await fetch(statsUrl);
            const statsData = await statsResponse.json();
            const statsMap = {};
            (statsData.items || []).forEach(stat => {
                statsMap[stat.id] = stat.statistics;
            });
            const enrichedItems = items.map(item => ({
                ...item,
                statistics: statsMap[item.id.videoId] || null
            }));
            if (statsResponse.ok) {
                res.setHeader('Cache-Control', SEARCH_CACHE);
            }
            return res.status(200).json({
                data: { items: enrichedItems, nextPageToken },
                status: 200
            });
        } else {
            return res.status(400).json({ error: 'Invalid type parameter' });
        }
        const response = await fetch(youtubeUrl);
        const data = await response.json();
        if (response.ok) {
            res.setHeader('Cache-Control', type === 'statistics' ? SHORT_CACHE : SEARCH_CACHE);
        }
        return res.status(response.status).json({ data, status: response.status });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
