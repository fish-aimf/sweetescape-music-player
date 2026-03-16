export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

    const { videoId, lang } = req.query;

    if (!videoId) {
        return res.status(400).json({ error: 'videoId is required' });
    }

    try {
        // Step 1: fetch the video page
        const pageResponse = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept-Language': 'en-US,en;q=0.9',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            }
        });

        if (!pageResponse.ok) {
            return res.status(404).json({ error: 'Video not found' });
        }

        const pageHtml = await pageResponse.text();

        // Step 2: try multiple regex patterns to extract player response
        let playerResponse = null;

        const patterns = [
            /ytInitialPlayerResponse\s*=\s*({.+?})\s*;/s,
            /ytInitialPlayerResponse\s*=\s*({[\s\S]+?})\s*(?:;|\n)/,
            /"ytInitialPlayerResponse"\s*:\s*({.+?})\s*,\s*"/s,
        ];

        for (const pattern of patterns) {
            const match = pageHtml.match(pattern);
            if (match) {
                try {
                    playerResponse = JSON.parse(match[1]);
                    if (playerResponse?.captions) break;
                } catch (e) {
                    continue;
                }
            }
        }

        // Step 3: fallback — try extracting from ytInitialData or innertubeApiKey approach
        if (!playerResponse?.captions) {
            // Try the /youtubei/v1/player endpoint directly
            const innertube = pageHtml.match(/"innertubeApiKey"\s*:\s*"([^"]+)"/);
            const clientVersion = pageHtml.match(/"clientVersion"\s*:\s*"([^"]+)"/);

            if (innertube && clientVersion) {
                const apiKey = innertube[1];
                const version = clientVersion[1];

                const playerApiResponse = await fetch(
                    `https://www.youtube.com/youtubei/v1/player?key=${apiKey}`,
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                        },
                        body: JSON.stringify({
                            videoId,
                            context: {
                                client: {
                                    clientName: 'WEB',
                                    clientVersion: version,
                                    hl: 'en',
                                    gl: 'US',
                                }
                            }
                        })
                    }
                );

                if (playerApiResponse.ok) {
                    playerResponse = await playerApiResponse.json();
                }
            }
        }

        if (!playerResponse) {
            return res.status(404).json({ error: 'Could not parse video page' });
        }

        const captionTracks = playerResponse?.captions?.playerCaptionsTracklistRenderer?.captionTracks;

        if (!captionTracks || captionTracks.length === 0) {
            return res.status(404).json({ error: 'No captions available for this video' });
        }

        // Step 4: pick the right track
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

        // Step 5: fetch captions
        const captionResponse = await fetch(`${track.baseUrl}&fmt=json3`);
        const captionData = await captionResponse.json();

        const transcript = (captionData.events || [])
            .filter(e => e.segs)
            .map(e => ({
                text: e.segs.map(s => s.utf8).join('').replace(/\n/g, ' ').trim(),
                offset: e.tStartMs,
                duration: e.dDurationMs || 0
            }))
            .filter(e => e.text && e.text !== ' ');

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
