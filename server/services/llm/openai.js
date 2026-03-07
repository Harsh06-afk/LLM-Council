const { OPENAI_API_KEY } = require('../../config');

const API_URL = 'https://api.openai.com/v1/chat/completions';

async function askOpenAI(question) {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: [{ role: 'user', content: question }]
            })
        });
        const data = await response.json();
        return data.choices[0].message.content;
    } catch (error) {
        console.error('OpenAI error:', error.message);
        return '[OpenAI failed to respond]';
    }
}

module.exports = { askOpenAI };
