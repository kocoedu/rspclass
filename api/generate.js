export default async function handler(req, res) {
    // Enable CORS for safety
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

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
        console.error('Missing environment variables: ROBOFLOW_API_KEY or ROBOFLOW_ENDPOINT');
        return res.status(500).json({ error: 'Server environment variables ROBOFLOW_API_KEY or ROBOFLOW_ENDPOINT are missing.' });
    }

    try {
        // Ensure endpoint does not have trailing query params or handle them safely
        const separator = endpoint.includes('?') ? '&' : '?';
        const roboflowUrl = `${endpoint}${separator}api_key=${apiKey}`;
        
        // Roboflow serverless inference often expects raw image base64 string or url-encoded body depending on the version.
        // Sending raw base64 or urlencoded base64. Standard Roboflow workflow accepts raw base64 string directly in the body.
        const response = await fetch(roboflowUrl, {
            method: 'POST',
            body: image,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Roboflow upstream error [${response.status}]:`, errorText);
            return res.status(response.status).json({ error: `Roboflow API error: ${errorText}` });
        }

        const result = await response.json();
        return res.status(200).json(result);

    } catch (error) {
        console.error('Roboflow proxy execution error:', error);
        return res.status(500).json({ error: 'Internal Server Error during model inference proxy: ' + error.message });
    }
}
