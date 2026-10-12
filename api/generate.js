export default async function handler(req, res) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405.json({ error: `Method ${req.method} Not Allowed` }));
    }

    try {
        const { image } = req.body;

        if (!image) {
            return res.status(400).json({ error: 'Image data is required in base64 format.' });
        }

        const apiKey = process.env.ROBOFLOW_API_KEY;
        const endpoint = process.env.ROBOFLOW_ENDPOINT;

        if (!apiKey || !endpoint) {
            return res.status(500).json({ 
                error: 'Server environment variables ROBOFLOW_API_KEY or ROBOFLOW_ENDPOINT are not configured.' 
            });
        }

        // Construct Roboflow Infer API URL with API key parameter
        const apiURL = `${endpoint}?api_key=${apiKey}`;

        // Forward image to Roboflow API
        const response = await fetch(apiURL, {
            method: 'POST',
            body: image, // Roboflow inference accepts raw base64 string or multipart/form-data depending on version
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

    } catch (err) {
        console.error('Error processing gesture recognition:', err);
        return res.status(500).json({ error: 'Internal Server Error', details: err.message });
    }
}
