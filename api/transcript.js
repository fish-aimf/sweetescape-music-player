export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

    const { videoId, lang } = req.query;
    if (!videoId) return res.status(400).json({ error: 'videoId is required' });

    const headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://www.youtube.com/',
        'Origin': 'https://www.youtube.com',
    };

    try {
        // Step 1: get list of available tracks
        const listResponse = await fetch(
            `https://www.youtube.com/api/timedtext?v=${videoId}&type=list`,
            { headers }
        );

        if (!listResponse.ok) {
            return res.status(404).json({ error: 'Could not fetch caption list' });
        }

        const listXml = await listResponse.text();
        console.log('Caption list XML:', listXml.substring(0, 500));

        // Step 2: parse available tracks from XML
        // Format: <track id="0" name="" lang_code="en" lang_original="English" lang_translated="English" lang_default="true"/>
        const trackMatches = [...listXml.matchAll(/<track[^>]+lang_code="([^"]+)"[^>]*name="([^"]*)"[^>]*\/?>/g)];

        if (!trackMatches.length) {
            return res.status(404).json({ error: 'No captions available for this video' });
        }

        const availableLanguages = trackMatches.map(m => ({
            code: m[1],
            name: m[2] || m[1],
            isAuto: false
        }));

        // Step 3: pick language
        let selectedLang;
        if (lang) {
            selectedLang = availableLanguages.find(t => t.code === lang)?.code
                        || availableLanguages.find(t => t.code.startsWith(lang))?.code
                        || availableLanguages[0].code;
        } else {
            selectedLang = availableLanguages.find(t => t.code === 'en')?.code
                        || availableLanguages[0].code;
        }

        // Step 4: fetch the actual transcript
        const transcriptUrl = `https://www.youtube.com/api/timedtext?v=${videoId}&lang=${selectedLang}&fmt=json3`;
        const transcriptResponse = await fetch(transcriptUrl, { headers });

        if (!transcriptResponse.ok) {
            return res.status(500).json({ error: 'Failed to fetch transcript' });
        }

        const transcriptData = await transcriptResponse.json();
        console.log('Transcript events count:', transcriptData.events?.length);

        const transcript = (transcriptData.events || [])
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

        return res.status(200).json({
            data: { transcript, availableLanguages, usedLang: selectedLang },
            status: 200
        });

    } catch (error) {
        console.error('Transcript fetch error:', error);
        return res.status(500).json({ error: error.message });
    }
}
