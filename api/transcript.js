export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

    const { videoId, lang } = req.query;
    if (!videoId) return res.status(400).json({ error: 'videoId is required' });

    try {
        // Step 1: use the youtubei player API directly — not page scraping
        const playerApiResponse = await fetch(
            'https://www.youtube.com/youtubei/v1/player',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'X-YouTube-Client-Name': '1',
                    'X-YouTube-Client-Version': '2.20240101.00.00',
                    'Origin': 'https://www.youtube.com',
                    'Referer': 'https://www.youtube.com/',
                },
                body: JSON.stringify({
                    videoId,
                    context: {
                        client: {
                            clientName: 'WEB',
                            clientVersion: '2.20240101.00.00',
                            hl: lang || 'en',
                            gl: 'US',
                        }
                    }
                })
            }
        );

        if (!playerApiResponse.ok) {
            return res.status(404).json({ error: 'Could not reach YouTube player API' });
        }

        const playerResponse = await playerApiResponse.json();
        const captionTracks = playerResponse?.captions?.playerCaptionsTracklistRenderer?.captionTracks;

        if (!captionTracks || captionTracks.length === 0) {
            return res.status(404).json({ error: 'No captions available for this video' });
        }

        // Step 2: pick the right track
        let track;
        if (lang) {
            track = captionTracks.find(t => t.languageCode === lang)
                   || captionTracks.find(t => t.languageCode.startsWith(lang))
                   || captionTracks[0];
        } else {
            // Prefer manual captions over auto-generated
            track = captionTracks.find(t => !t.kind)
                   || captionTracks.find(t => t.kind === 'asr')
                   || captionTracks[0];
        }

        // Step 3: fetch the captions
        const captionResponse = await fetch(`${track.baseUrl}&fmt=json3`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Referer': 'https://www.youtube.com/',
            }
        });

        if (!captionResponse.ok) {
            return res.status(500).json({ error: 'Failed to fetch caption data' });
        }

        const captionData = await captionResponse.json();

        const transcript = (captionData.events || [])
            .filter(e => e.segs)
            .map(e => ({
                text: e.segs.map(s => s.utf8).join('').replace(/\n/g, ' ').trim(),
                offset: e.tStartMs,
                duration: e.dDurationMs || 0
            }))
            .filter(e => e.text && e.text !== ' ');

        if (!transcript.length) {
            return res.status(404).json({ error: 'Transcript was empty after parsing' });
        }

        const availableLanguages = captionTracks.map(t => ({
            code: t.languageCode,
            name: t.name?.simpleText || t.languageCode,
            isAuto: t.kind === 'asr'
        }));

        return res.status(200).json({
            data: { transcript, availableLanguages, usedLang: track.languageCode },
            status: 200
        });

    } catch (error) {
        console.error('Transcript fetch error:', error);
        return res.status(500).json({ error: error.message });
    }
}
