// server.js — Node.js + Express backend for AI-powered Figma to Code tool

const express = require('express');
const fileUpload = require('express-fileupload');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { parseFigmaJson } = require('./parser/ai');

const app = express();
const PORT = 3000;

const FIGMA_TOKEN = process.env.FIGMA_TOKEN || 'figd_HlmFvpQySPenZKLY9_cD7ODx9cXXw7VUjhpQ8XL5';

app.use(cors());
app.use(express.static('public'));
app.use('/result', express.static(path.join(__dirname, 'result')));
app.use(express.json());
app.use(fileUpload());

// Extract file ID from Figma URL
function extractFileId(url) {
    const match = url.match(/(?:file|design)\/([a-zA-Z0-9]+)\//);
    return match ? match[1] : null;
}

// GET Figma JSON via API
async function fetchFigmaJson(fileId) {
    const apiUrl = `https://api.figma.com/v1/files/${fileId}`;
    const res = await axios.get(apiUrl, {
        headers: { 'X-Figma-Token': FIGMA_TOKEN }
    });
    return res.data;
}

// POST /generate-url — accepts Figma link, fetches and processes JSON
app.post('/generate-url', async (req, res) => {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: 'No URL provided' });

    const fileId = extractFileId(url);
    if (!fileId) return res.status(400).json({ error: 'Invalid Figma URL' });

    try {
        const json = await fetchFigmaJson(fileId);
        const { html, css } = parseFigmaJson(json);

        const resultDir = path.join(__dirname, 'result');
        if (!fs.existsSync(resultDir)) fs.mkdirSync(resultDir);

        fs.writeFileSync(path.join(resultDir, 'result.html'), html);
        fs.writeFileSync(path.join(resultDir, 'result.css'), css);

        res.json({
            htmlPath: '/result/result.html',
            cssPath: '/result/result.css'
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch or generate from Figma' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
