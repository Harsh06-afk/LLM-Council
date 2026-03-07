const { GROQ_API_KEY } = require('../../config');

const API_URL = 'https://api.groq.com/openai/v1/chat/completions';

async function askGroq(question) {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${GROQ_API_KEY}`
            },
            body: JSON.stringify({
                model: 'llama-3.1-8b-instant',
                messages: [{ role: 'user', content: question }]
            })
        });
        const data = await response.json();
        if (!data.choices) {
            console.error('Groq unexpected response:', JSON.stringify(data));
            return '[Groq failed to respond]';
        }
        return data.choices[0].message.content;
    } catch (error) {
        console.error('Groq error:', error.message);
        return '[Groq failed to respond]';
    }
}

module.exports = { askGroq };
