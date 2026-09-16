import ResultsTable from "./ResultsTable";
import ChartView from "./ChartView";

export default function OutputCard({
    sql,
    copied,
    copySQL,
    explanation,
    results,
    activeTab,
    setActiveTab,
}) {
    if (!sql) return null;

    return (
        <div className="card output-card">
            {/* SQL */}
            <div className="output-section">
                <div className="output-header">
                    <span className="output-label">SQL</span>

                    <button className="copy-btn" onClick={copySQL}>
                        {copied ? "✓ Copied" : "Copy"}
                    </button>
                </div>

                <pre className="sql-pre">{sql}</pre>
            </div>

            {/* Explanation */}
            {explanation && (
                <div className="explanation">
                    <svg
                        width="13"
                        height="13"
                        viewBox="0 0 13 13"
                        fill="none"
                    >
                        <circle
                            cx="6.5"
                            cy="6.5"
                            r="5.5"
                            stroke="#6366f1"
                            strokeWidth="1.2"
                        />
                        <path
                            d="M6.5 5.5v3.5M6.5 4v.5"
                            stroke="#6366f1"
                            strokeWidth="1.3"
                            strokeLinecap="round"
                        />
                    </svg>

                    <p>{explanation}</p>
                </div>
            )}

            {/* Results */}
            {results?.rows?.length > 0 && (
                <div className="results-section">
                    <div className="tabs">
                        <button
                            className={`tab ${activeTab === "table" ? "active" : ""}`}
                            onClick={() => setActiveTab("table")}
                        >
                            Table
                            <span className="tab-badge">{results.rows.length}</span>
                        </button>

                        <button
                            className={`tab ${activeTab === "chart" ? "active" : ""}`}
                            onClick={() => setActiveTab("chart")}
                        >
                            Chart
                        </button>
                    </div>

                    <div className="tab-body">
                        {activeTab === "table" && (
                            <ResultsTable
                                columns={results.columns}
                                rows={results.rows}
                            />
                        )}

                        {activeTab === "chart" && (
                            <ChartView
                                columns={results.columns}
                                rows={results.rows}
                            />
                        )}
                    </div>
                </div>
            )}

            {results?.rows?.length === 0 && (
                <div className="no-rows">
                    No rows returned.
                </div>
            )}
        </div>
    );
}


