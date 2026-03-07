import { useState } from 'react';
import QuestionInput from '../components/QuestionInput';
import CouncilResult from '../components/CouncilResult';
import { askCouncil } from '../services/api';

function Home() {
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    async function handleSubmit(question) {
        setIsLoading(true);
        setResult(null);
        setError(null);

        try {
            const data = await askCouncil(question);
            setResult(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="home">
            <header className="header">
                <h1 className="title">LLM Council</h1>
                <p className="subtitle">Three AIs deliberate. One verdict.</p>
            </header>

            <main className="main">
                <QuestionInput onSubmit={handleSubmit} isLoading={isLoading} />

                {error && <div className="error-box">{error}</div>}

                {isLoading && (
                    <div className="loading-box">
                        <div className="spinner" />
                        <p>The council is deliberating...</p>
                    </div>
                )}

                {result && <CouncilResult result={result} />}
            </main>
        </div>
    );
}

export default Home;
