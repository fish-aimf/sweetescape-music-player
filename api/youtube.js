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
        } else if (type === 'playlist') {
            if (!/^[\w-]{2,64}$/.test(query || '')) {
                return res.status(400).json({ error: 'Invalid playlist id' });
            }
            const base = 'https://www.googleapis.com/youtube/v3';
            const listId = encodeURIComponent(query);
            const itemFields = encodeURIComponent('nextPageToken,pageInfo/totalResults,items(snippet(title,videoOwnerChannelTitle,resourceId/videoId))');
            let itemsUrl = `${base}/playlistItems?part=snippet&maxResults=50&playlistId=${listId}&fields=${itemFields}&key=${apiKey}`;
            if (pageToken) itemsUrl += `&pageToken=${encodeURIComponent(pageToken)}`;
            const metaFields = encodeURIComponent('items(snippet(title,channelTitle,thumbnails/medium/url),contentDetails/itemCount)');
            const metaUrl = `${base}/playlists?part=snippet,contentDetails&id=${listId}&fields=${metaFields}&key=${apiKey}`;
            const [itemsResponse, metaResponse] = await Promise.all([
                fetch(itemsUrl),
                pageToken ? null : fetch(metaUrl)
            ]);
            const itemsData = await itemsResponse.json();
            if (!itemsResponse.ok) {
                const reason = itemsData.error?.errors?.[0]?.reason || '';
                return res.status(itemsResponse.status).json({ status: itemsResponse.status, reason, data: null });
            }
            const rows = (itemsData.items || []).map(item => item.snippet).filter(s => s?.resourceId?.videoId);
            const videos = new Map();
            let complete = true;
            if (rows.length) {
                const videoFields = encodeURIComponent('items(id,contentDetails/duration,status/embeddable)');
                const ids = [...new Set(rows.map(s => s.resourceId.videoId))].join(',');
                const videosResponse = await fetch(`${base}/videos?part=contentDetails,status&id=${ids}&fields=${videoFields}&key=${apiKey}`);
                if (videosResponse.ok) {
                    ((await videosResponse.json()).items || []).forEach(v => videos.set(v.id, v));
                } else {
                    complete = false;
                }
            }
            const seconds = iso => {
                const m = /P(?:(\d+)D)?T?(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/.exec(iso || '');
                return m ? ((+m[1] || 0) * 86400) + ((+m[2] || 0) * 3600) + ((+m[3] || 0) * 60) + (+m[4] || 0) : 0;
            };
            const items = rows.map(s => {
                const id = s.resourceId.videoId;
                const video = videos.get(id);
                let state = 'ok';
                if (complete && !video) state = 'gone';
                else if (video?.status?.embeddable === false) state = 'blocked';
                return { id, title: s.title || '', channel: s.videoOwnerChannelTitle || '', duration: seconds(video?.contentDetails?.duration), state };
            });
            let playlist = null;
            if (metaResponse && metaResponse.ok) {
                const meta = (await metaResponse.json()).items?.[0];
                if (meta) {
                    playlist = {
                        title: meta.snippet?.title || '',
                        channel: meta.snippet?.channelTitle || '',
                        count: meta.contentDetails?.itemCount || 0,
                        thumb: meta.snippet?.thumbnails?.medium?.url || ''
                    };
                }
            }
            if (complete && (pageToken || playlist)) {
                res.setHeader('Cache-Control', SHORT_CACHE);
            }
            return res.status(200).json({
                status: 200,
                data: { playlist, items, total: itemsData.pageInfo?.totalResults || 0, next: itemsData.nextPageToken || null }
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
