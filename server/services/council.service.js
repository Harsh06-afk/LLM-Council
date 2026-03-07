const { askGemini } = require('./llm/gemini');
const { askGroq } = require('./llm/groq');
// const { askOpenAI } = require('./llm/openai');

async function runCouncil(question) {
    // Call all three LLMs at the same time (parallel, not one by one)
    const [geminiAnswer, groqAnswer] = await Promise.all([
        askGemini(question),
        askGroq(question),
    ]);

    const responses = [
        { llm: 'Gemini', answer: geminiAnswer },
        { llm: 'Groq (Llama)', answer: groqAnswer },
        // { llm: 'OpenAI', answer: openaiAnswer }
    ];

    // Build the judge prompt
    const judgePrompt = `
You are a judge synthesizing the best answer from multiple AI responses.

Question: "${question}"

Response 1: ${geminiAnswer}

Response 2: ${groqAnswer}

Give a single, short and crisp answer. No fluff, no repetition, no bullet points unless absolutely necessary.
Do not mention the responses or models. Just answer the question directly in as few words as possible.
    `.trim();

    const verdict = await askGemini(judgePrompt);

    return { question, responses, verdict };
}

module.exports = { runCouncil };
