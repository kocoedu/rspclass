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

        // Roboflow Workflow API 호출 (cURL/HTTP 예제 기준)
        const apiResponse = await fetch(`${endpoint}?api_key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                inputs: {
                    image: {
                        type: "base64",
                        value: image
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
