export default async function handler(req, res) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }

    const { image } = req.body;
    if (!image) {
        return res.status(400).json({ error: 'Image payload is required' });
    }

    const apiKey = process.env.ROBOFLOW_API_KEY;
    const endpoint = process.env.ROBOFLOW_ENDPOINT;

    if (!apiKey || !endpoint) {
        return res.status(500).json({ error: 'Server environment variables ROBOFLOW_API_KEY or ROBOFLOW_ENDPOINT are missing.' });
    }

    try {
        const separator = endpoint.includes('?') ? '&' : '?';
        const roboflowUrl = `${endpoint}${separator}api_key=${apiKey}`;
        
        const response = await fetch(roboflowUrl, {
            method: 'POST',
            body: image,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            return res.status(response.status).json({ error: `Roboflow API error: ${errorText}` });
        }

        const result = await response.json();
        return res.status(200).json(result);

    } catch (error) {
        console.error('Roboflow proxy execution error:', error);
        return res.status(500).json({ error: 'Internal Server Error during model inference proxy.' });
    }
}