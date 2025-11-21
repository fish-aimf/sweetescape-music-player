export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const GEMINI_API_KEYS = process.env.GEMINI_API_KEYS.split(',');
    const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';
    
    const { requestBody, keyIndex } = req.body;
    const apiKey = GEMINI_API_KEYS[keyIndex % GEMINI_API_KEYS.length];
    
    try {
        const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        });
        
        const data = await response.json();
        
        return res.status(response.status).json({
            data,
            status: response.status
        });
        
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
