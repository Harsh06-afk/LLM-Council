const BASE_URL = 'http://localhost:5000';

export async function askCouncil(question) {
    const response = await fetch(`${BASE_URL}/api/council/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question })
    });

    if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Server error');
    }

    return response.json();
}
