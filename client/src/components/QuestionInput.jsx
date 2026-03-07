function QuestionInput({ onSubmit, isLoading }) {
    function handleSubmit(e) {
        e.preventDefault();
        const question = e.target.question.value.trim();
        if (question) onSubmit(question);
    }

    return (
        <form className="question-form" onSubmit={handleSubmit}>
            <textarea
                name="question"
                className="question-input"
                placeholder="Ask the council anything..."
                rows={4}
                disabled={isLoading}
            />
            <button className="submit-btn" type="submit" disabled={isLoading}>
                {isLoading ? 'Council is deliberating...' : 'Ask the Council'}
            </button>
        </form>
    );
}

export default QuestionInput;
