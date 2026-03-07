import ReactMarkdown from 'react-markdown';

function CouncilResult({ result }) {
    return (
        <div className="council-result">
            <div className="result-question">
                <span className="result-question-label">Question</span>
                <p>{result.question}</p>
            </div>

            <div className="verdict-box">
                <div className="verdict-label">Council Verdict</div>
                <div className="verdict-text"><ReactMarkdown>{result.verdict}</ReactMarkdown></div>
            </div>
        </div>
    );
}

export default CouncilResult;
