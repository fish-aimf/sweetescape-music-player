export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
    
    const YOUTUBE_API_KEYS = process.env.YOUTUBE_API_KEYS.split(',');
    const { query, keyIndex, maxResults = 5, type = 'search', pageToken } = req.query;
    const apiKey = YOUTUBE_API_KEYS[parseInt(keyIndex) % YOUTUBE_API_KEYS.length];
    
    try {
        let youtubeUrl;
        
        if (type === 'search') {
            youtubeUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=${maxResults}&q=${encodeURIComponent(query)}&type=video&order=relevance&key=${apiKey}`;
            if (pageToken) youtubeUrl += `&pageToken=${encodeURIComponent(pageToken)}`;

        } else if (type === 'statistics') {
            youtubeUrl = `https://www.googleapis.com/youtube/v3/videos?part=statistics&id=${encodeURIComponent(query)}&key=${apiKey}`;

        } else if (type === 'combined') {
            // Step 1: search
            let searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=${maxResults}&q=${encodeURIComponent(query)}&type=video&order=relevance&key=${apiKey}`;
            if (pageToken) searchUrl += `&pageToken=${encodeURIComponent(pageToken)}`;

            const searchResponse = await fetch(searchUrl);
            const searchData = await searchResponse.json();

            if (!searchResponse.ok) {
                return res.status(searchResponse.status).json({ data: searchData, status: searchResponse.status });
            }

            const items = searchData.items || [];
            const nextPageToken = searchData.nextPageToken || null;

            if (items.length === 0) {
                return res.status(200).json({ data: { items: [], nextPageToken: null }, status: 200 });
            }

            // Step 2: batch statistics for all video IDs in one call
            const videoIds = items.map(item => item.id.videoId).join(',');
            const statsUrl = `https://www.googleapis.com/youtube/v3/videos?part=statistics&id=${encodeURIComponent(videoIds)}&key=${apiKey}`;
            const statsResponse = await fetch(statsUrl);
            const statsData = await statsResponse.json();

            // Merge statistics into search items
            const statsMap = {};
            (statsData.items || []).forEach(stat => {
                statsMap[stat.id] = stat.statistics;
            });

            const enrichedItems = items.map(item => ({
                ...item,
                statistics: statsMap[item.id.videoId] || null
            }));

            return res.status(200).json({
                data: { items: enrichedItems, nextPageToken },
                status: 200
            });

        } else {
            return res.status(400).json({ error: 'Invalid type parameter' });
        }

        // For search and statistics types
        const response = await fetch(youtubeUrl);
        const data = await response.json();
        return res.status(response.status).json({ data, status: response.status });

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
