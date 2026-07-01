export default function QueryCard({
    question,
    setQuestion,
    handleAsk,
    handleInsights,
    thinking,
    suggestions,
}) {
    return (
        <div className="card query-card">
            <div className="query-row">
                <span className="query-caret">›_</span>

                <input
                    className="query-input"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="Ask your data anything in plain English..."
                    onKeyDown={(e) => {
                        if (e.key === "Enter") handleAsk();
                    }}
                    disabled={thinking}
                />

                <button
                    className={`run-btn ${thinking ? "busy" : ""}`}
                    onClick={() => handleAsk()}
                    disabled={thinking || !question.trim()}
                >
                    {thinking ? <span className="spinner" /> : "Run"}
                </button>

                <button
                    className="run-btn"
                    onClick={handleInsights}
                    style={{ marginLeft: 10, background: "#22c55e" }}
                >
                    Insights
                </button>
            </div>

            <div className="chips">
                {suggestions.map((s, i) => (
                    <button
                        key={i}
                        className="chip"
                        onClick={() => {
                            setQuestion(s);
                            handleAsk(s);
                        }}
                    >
                        {s}
                    </button>
                ))}
            </div>
        </div>
    );
}