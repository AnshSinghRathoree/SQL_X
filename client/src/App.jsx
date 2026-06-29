import { useState, useEffect, useRef } from 'react';
import { useDatabase } from './hooks/useDatabase';
import { generateSQL, explainSQL, getInsights } from './utils/api';
import { exportCSV } from './utils/exportCSV';
import SchemaPanel from './components/SchemaPanel';
import ResultsTable from './components/ResultsTable';
import ChartView from './components/ChartView';
import HistoryPanel from './components/HistoryPanel';

const SUGGESTIONS = [
  'Top 5 products by total sales',
  'Sales by region',
  'Monthly revenue trend',
  'Best performing category',
  'Average sales per product',
];

export default function App() {
  const { schema, loading, loadCSV, runQuery } = useDatabase();
  const [dbLoaded, setDbLoaded] = useState(false);
  const [question, setQuestion] = useState('');
  const [sql, setSql] = useState('');
  const [results, setResults] = useState(null);
  const [explanation, setExplanation] = useState('');
  const [history, setHistory] = useState([]);
  const [thinking, setThinking] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('table');
  const [copied, setCopied] = useState(false);
  const [insights, setInsights] = useState([]);
  const fileRef = useRef();

  useEffect(() => {
    const saved = localStorage.getItem('nl_sql_history');
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('nl_sql_history', JSON.stringify(history));
  }, [history]);
  useEffect(() => {
    const savedSession = localStorage.getItem("nl_sql_session");

    if (savedSession) {
      const session = JSON.parse(savedSession);

      setQuestion(session.question || "");
      setSql(session.sql || "");
      setExplanation(session.explanation || "");
      setResults(session.results || null);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      "nl_sql_session",
      JSON.stringify({
        question,
        sql,
        explanation,
        results
      })
    );
  }, [question, sql, explanation, results]);
  useEffect(() => {
    if (schema.length > 0) {
      setDbLoaded(true);
    }
  }, [schema]);


  useEffect(() => {
    const savedSession = localStorage.getItem("nl_sql_session");

    if (savedSession) {
      const session = JSON.parse(savedSession);

      setQuestion(session.question || "");
      setSql(session.sql || "");
      setExplanation(session.explanation || "");
      setResults(session.results || null);
    }
  }, []);
  useEffect(() => {
    localStorage.setItem(
      "nl_sql_session",
      JSON.stringify({
        question,
        sql,
        explanation,
        results
      })
    );
  }, [question, sql, explanation, results]);
  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const tableName = file.name.replace(/\.csv$/i, '').replace(/\W+/g, '_');
      const ok = loadCSV(ev.target.result, tableName);
      if (ok) setDbLoaded(true);
    };
    reader.readAsText(file);
  };

  const cleanSQL = (q) =>
    q.replace(/```sql/gi, '').replace(/```/g, '').replace(/`/g, '').trim();

  const handleAsk = async (q = question) => {
    if (!q.trim() || !dbLoaded) return;
    setThinking(true);
    setError('');
    setSql('');
    setResults(null);
    setExplanation('');
    try {
      const { sql: raw } = await generateSQL(q, schema);
      const finalSQL = cleanSQL(raw);
      setSql(finalSQL);
      let res;
      try {
        res = runQuery(finalSQL);
        setResults(res);

      } catch (e) {
        console.warn("⚠️ SQL failed, trying auto-fix...");

        try {
          const fixRes = await generateSQL(
            `Fix this SQL:\n${finalSQL}\nError: ${e.message}`,
            schema
          );

          const fixedSQL = cleanSQL(fixRes.sql);
          setSql(fixedSQL);

          const retryRes = runQuery(fixedSQL);
          setResults(retryRes);

          setError("⚠️ Query auto-corrected");

        } catch (fixErr) {
          setError("SQL failed even after retry: " + fixErr.message);
        }

        return;
      }
      const { explanation: exp } = await explainSQL(finalSQL, q);
      setExplanation(exp);
      setHistory(prev =>
        [{ question: q, sql: finalSQL, rows: res.rows.length, ts: Date.now() }, ...prev].slice(0, 8)
      );
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setThinking(false);
    }
  };
  const handleInsights = async () => {
    if (!schema?.length) return;

    try {
      setThinking(true);
      const res = await getInsights(schema);
      setInsights(res.insights || []);
    } catch (err) {
      setError("Failed to fetch insights");
    } finally {
      setThinking(false);
    }
  };

  const copySQL = () => {
    navigator.clipboard.writeText(sql);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  if (loading) return (
    <div className="splash">
      <div className="splash-ring" />
      <span>Initialising engine…</span>
    </div>
  );

  return (
    <div className="shell">
      {/* ── Sidebar ── */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-mark">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <rect x="0" y="0" width="8" height="8" rx="2" fill="#6366f1" />
              <rect x="10" y="0" width="8" height="8" rx="2" fill="#6366f1" opacity=".4" />
              <rect x="0" y="10" width="8" height="8" rx="2" fill="#6366f1" opacity=".4" />
              <rect x="10" y="10" width="8" height="8" rx="2" fill="#6366f1" opacity=".15" />
            </svg>
          </div>
          <span className="brand-name">QueryAI</span>
        </div>

        <nav className="sidebar-nav">
          <button className="nav-item active">
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><rect x="1" y="1" width="5" height="5" rx="1" fill="currentColor" /><rect x="9" y="1" width="5" height="5" rx="1" fill="currentColor" opacity=".4" /><rect x="1" y="9" width="5" height="5" rx="1" fill="currentColor" opacity=".4" /><rect x="9" y="9" width="5" height="5" rx="1" fill="currentColor" opacity=".2" /></svg>
            Workspace
          </button>
        </nav>

        <div className="sidebar-divider" />

        <div className="sidebar-section">
          <p className="section-label">Dataset</p>
          <button className="upload-btn" onClick={() => fileRef.current.click()}>
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <path d="M6.5 9V1M3 4l3.5-3.5L10 4M1 10.5h11v1H1z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {dbLoaded ? 'Replace CSV' : 'Upload CSV'}
          </button>
          <input ref={fileRef} type="file" accept=".csv" hidden onChange={handleUpload} />
        </div>

        {schema.length > 0 && (
          <div className="sidebar-section" style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <p className="section-label">Schema</p>
            <div style={{ overflowY: 'auto', flex: 1 }}>
              <SchemaPanel schema={schema} />
            </div>
          </div>
        )}

        {history.length > 0 && (
          <div className="sidebar-section">
            <p className="section-label">Recent</p>
            <HistoryPanel history={history} onSelect={(q) => { setQuestion(q); handleAsk(q); }} />
          </div>
        )}
      </aside>

      {/* ── Main ── */}
      <div className="main">
        {/* Topbar */}
        <header className="topbar">
          <div className="topbar-left">
            <span className="topbar-title">Query workspace</span>
            {dbLoaded && schema[0] && (
              <span className="topbar-pill">{schema[0].table}</span>
            )}
          </div>
          {results && (
            <button className="icon-btn" onClick={() => exportCSV(results.columns, results.rows)}>
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                <path d="M6.5 1v8M3 6l3.5 3.5L10 6M1 11h11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Export
            </button>
          )}
        </header>

        {/* Body */}
        <div className="main-body">
          {!dbLoaded ? (
            <div className="empty-state">
              <div className="empty-icon">
                <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                  <rect x="3" y="7" width="30" height="22" rx="3" stroke="#6366f1" strokeWidth="1.5" />
                  <path d="M3 13h30" stroke="#6366f1" strokeWidth="1.5" />
                  <path d="M9 19h8M9 23h5" stroke="#4b5563" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>
              <h2>Upload a CSV to begin</h2>
              <p>Your data runs entirely in-browser via WebAssembly. Nothing leaves your machine.</p>
              <button className="btn-primary" onClick={() => fileRef.current.click()}>
                Choose file
              </button>
            </div>
          ) : (
            <>
              {/* Query card */}
              <div className="card query-card">
                <div className="query-row">
                  <span className="query-caret">›_</span>
                  <input
                    className="query-input"
                    value={question}
                    onChange={e => setQuestion(e.target.value)}
                    placeholder="Ask your data anything in plain English…"
                    onKeyDown={e => { if (e.key === 'Enter') handleAsk(); }}
                    disabled={thinking}
                  />
                  <button
                    className={`run-btn ${thinking ? 'busy' : ''}`}
                    onClick={() => handleAsk()}
                    disabled={thinking || !question.trim()}
                  >
                    {thinking ? <span className="spinner" /> : 'Run'}
                  </button>
                  <button
                    className="run-btn"
                    onClick={handleInsights}
                    style={{ marginLeft: '10px', background: '#22c55e' }}
                  >
                    Insights
                  </button>
                </div>
                <div className="chips">
                  {SUGGESTIONS.map((s, i) => (
                    <button key={i} className="chip" onClick={() => { setQuestion(s); handleAsk(s); }}>{s}</button>
                  ))}
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="alert error">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.2" /><path d="M7 4v3.5M7 9.5v.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /></svg>
                  {error}
                </div>
              )}
              {/* AI Insights */}
              {insights.length > 0 && (
                <div className="card" style={{ marginBottom: '16px' }}>
                  <div style={{ marginBottom: '10px', fontWeight: 600 }}>
                    AI Insights
                  </div>

                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    {insights.map((item, i) => (
                      <div
                        key={i}
                        onClick={() => {
                          setQuestion(item.title);
                          handleAsk(item.title);
                        }}
                        style={{
                          padding: '10px 14px',
                          background: '#1e1e2f',
                          borderRadius: '10px',
                          cursor: 'pointer',
                          border: '1px solid #2a2a3a'
                        }}
                      >
                        {item.title}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Output */}
              {sql && (
                <div className="card output-card">
                  {/* SQL */}
                  <div className="output-section">
                    <div className="output-header">
                      <span className="output-label">SQL</span>
                      <button className="copy-btn" onClick={copySQL}>
                        {copied ? '✓ Copied' : 'Copy'}
                      </button>
                    </div>
                    <pre className="sql-pre">{sql}</pre>
                  </div>

                  {/* Explanation */}
                  {explanation && (
                    <div className="explanation">
                      <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><circle cx="6.5" cy="6.5" r="5.5" stroke="#6366f1" strokeWidth="1.2" /><path d="M6.5 5.5v3.5M6.5 4v.5" stroke="#6366f1" strokeWidth="1.3" strokeLinecap="round" /></svg>
                      <p>{explanation}</p>
                    </div>
                  )}

                  {/* Tabs + results */}
                  {results?.rows?.length > 0 && (
                    <div className="results-section">
                      <div className="tabs">
                        <button className={`tab ${activeTab === 'table' ? 'active' : ''}`} onClick={() => setActiveTab('table')}>
                          Table
                          <span className="tab-badge">{results.rows.length}</span>
                        </button>
                        <button className={`tab ${activeTab === 'chart' ? 'active' : ''}`} onClick={() => setActiveTab('chart')}>
                          Chart
                        </button>
                      </div>
                      <div className="tab-body">
                        {activeTab === 'table' && <ResultsTable columns={results.columns} rows={results.rows} />}
                        {activeTab === 'chart' && <ChartView columns={results.columns} rows={results.rows} />}
                      </div>
                    </div>
                  )}

                  {results?.rows?.length === 0 && (
                    <div className="no-rows">No rows returned.</div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}