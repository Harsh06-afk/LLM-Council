const { runCouncil } = require('../services/council.service');

async function askCouncil(req, res) {
    const { question } = req.body;

    if (!question || question.trim() === '') {
        return res.status(400).json({ error: 'Question is required' });
    }

    try {
        const result = await runCouncil(question.trim());
        res.json(result);
    } catch (error) {
        console.error('Council error:', error.message);
        res.status(500).json({ error: 'Something went wrong. Please try again.' });
    }
}

module.exports = { askCouncil };
