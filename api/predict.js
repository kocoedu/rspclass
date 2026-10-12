export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const { image } = req.body;
        if (!image) {
            return res.status(400).json({ error: 'Image data is required' });
        }

        const apiKey = process.env.ROBOFLOW_API_KEY;
        const endpoint = process.env.ROBOFLOW_ENDPOINT;

        if (!apiKey || !endpoint) {
            return res.status(500).json({ error: 'Server environment variables not configured' });
        }

        // Roboflow Workflow API 규격에 맞춘 올바른 요청 본문(Body) 구조
        const apiResponse = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                api_key: apiKey,
                inputs: {
                    image: {
                        type: "url",
                        value: `data:image/jpeg;base64,${image}`
                    }
                }
            })
        });

        if (!apiResponse.ok) {
            const errorText = await apiResponse.text();
            return res.status(apiResponse.status).json({ error: 'Roboflow API error', details: errorText });
        }

        const result = await apiResponse.json();
        return res.status(200).json(result);

    } catch (error) {
        console.error('API Server Error:', error);
        return res.status(500).json({ error: 'Internal Server Error', message: error.message });
    }
}