export default function DatasetSummary({ stats }) {
    if (!stats) return null;

    return (
        <div className="card dataset-summary-card">
            <div className="dataset-header">
                <div>
                    <div className="dataset-title">📊 Dataset Summary</div>
                    <div className="dataset-subtitle">
                        Your dataset is ready for AI-powered analysis.
                    </div>
                </div>

                <div className="dataset-status">
                    ✓ Ready
                </div>
            </div>

            <div className="dataset-stats">
                <div className="dataset-stat">
                    <span className="stat-label">Table</span>
                    <span className="stat-value">{stats.table}</span>
                </div>

                <div className="dataset-stat">
                    <span className="stat-label">Rows</span>
                    <span className="stat-value">{stats.rows}</span>
                </div>

                <div className="dataset-stat">
                    <span className="stat-label">Columns</span>
                    <span className="stat-value">{stats.columns}</span>
                </div>
            </div>
        </div>
    );
}