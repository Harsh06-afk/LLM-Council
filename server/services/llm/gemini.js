const { GEMINI_API_KEY } = require('../../config');

const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

async function askGemini(question) {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: question }] }]
            })
        });
        const data = await response.json();
        if (!data.candidates) {
            console.error('Gemini unexpected response:', JSON.stringify(data));
            return '[Gemini failed to respond]';
        }
        return data.candidates[0].content.parts[0].text;
    } catch (error) {
        console.error('Gemini error:', error.message);
        return '[Gemini failed to respond]';
    }
}

module.exports = { askGemini };
