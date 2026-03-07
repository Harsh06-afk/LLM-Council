function LLMCard({ llmName, answer }) {
    return (
        <div className="llm-card">
            <div className="llm-card-header">{llmName}</div>
            <p className="llm-card-answer">{answer}</p>
        </div>
    );
}

export default LLMCard;
