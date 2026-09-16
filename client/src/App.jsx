import { useState, useEffect, useRef } from 'react';

import { useDatabase } from './hooks/useDatabase';

import { generateSQL, explainSQL, getInsights } from './utils/api';

import { exportCSV } from './utils/exportCSV';

import SchemaPanel from './components/SchemaPanel';

import HistoryPanel from './components/HistoryPanel';

import DatasetSummary from './components/DatasetSummary';

import QueryCard from './components/QueryCard';

import OutputCard from './components/OutputCard';

import AIDatasetCard from "./components/AIDatasetCard";


export default function App() {

  const {
    schema,
    loading,
    loadCSV,
    analyzeDataset,
    runQuery,
    datasetStats,
  } = useDatabase();


  const [dbLoaded, setDbLoaded] = useState(
    localStorage.getItem("dbLoaded") === "true"
  );

  const [question, setQuestion] = useState(
    localStorage.getItem("lastQuestion") || ""
  );

  const [sql, setSql] = useState('');

  const [results, setResults] = useState(null);

  const [explanation, setExplanation] = useState('');

  const [history, setHistory] = useState([]);

  const [thinking, setThinking] = useState(false);

  const [error, setError] = useState('');

  const [activeTab, setActiveTab] = useState('table');

  const [copied, setCopied] = useState(false);

  const [insights, setInsights] = useState([]);

  const [datasetUnderstanding, setDatasetUnderstanding] = useState(null);

  const [showAIProfile, setShowAIProfile] = useState(false);

  const [aiLoading, setAiLoading] = useState(false);

  const fileRef = useRef();


  // ============================================================
  // Load Query History
  // ============================================================

  useEffect(() => {

    const saved = localStorage.getItem('nl_sql_history');

    if (saved) {
      setHistory(JSON.parse(saved));
    }

  }, []);


  // ============================================================
  // Restore Last Session
  // ============================================================

  useEffect(() => {

    const savedSession = localStorage.getItem("nl_sql_session");

    if (savedSession) {

      const session = JSON.parse(savedSession);

      setQuestion(session.question || "");

      setSql(localStorage.getItem("lastSQL") || "");

      setExplanation(
        localStorage.getItem("lastExplanation") || ""
      );


      const savedResults =
        localStorage.getItem("lastResults");

      if (savedResults) {

        setResults(
          JSON.parse(savedResults)
        );

      }

    }

  }, []);


  // ============================================================
  // Save Session
  // ============================================================

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

  }, [
    question,
    sql,
    explanation,
    results
  ]);


  // ============================================================
  // Automatically Analyze Uploaded Dataset
  // ============================================================

  const analyzeUploadedDataset = async (
    csv,
    tableName
  ) => {

    try {

      setAiLoading(true);

      const response = await fetch(
        "http://127.0.0.1:8000/dataset/analyze-text",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            csv_text: csv,
            table_name: tableName,
          }),
        }
      );


      if (!response.ok) {

        throw new Error(
          "Dataset AI analysis failed"
        );

      }


      const data = await response.json();


      // Store AI understanding of NEW dataset
      setDatasetUnderstanding(data);


      // Save it for persistence
      localStorage.setItem(
        "datasetUnderstanding",
        JSON.stringify(data)
      );


      return data;

    } catch (err) {

      console.error(
        "AI dataset analysis failed:",
        err
      );

      setDatasetUnderstanding(null);

      return null;

    } finally {

      setAiLoading(false);

    }

  };


  // ============================================================
  // Upload CSV
  // ============================================================

  const handleUpload = (e) => {

    const file = e.target.files[0];

    if (!file) return;


    const reader = new FileReader();


    reader.onload = async (ev) => {

      try {

        const csvText = ev.target.result;


        const tableName = file.name
          .replace(/\.csv$/i, "")
          .replace(/\W+/g, "_");


        // Load new CSV into SQLite
        const result = loadCSV(
          csvText,
          tableName
        );


        if (result) {

          setDbLoaded(true);

          localStorage.setItem(
            "dbLoaded",
            "true"
          );


          // ==================================================
          // Reset previous dataset-dependent state
          // ==================================================

          setDatasetUnderstanding(null);

          setShowAIProfile(false);

          setQuestion("");

          setSql("");

          setResults(null);

          setExplanation("");

          setError("");

          setInsights([]);


          // Remove old persisted dataset/query data
          localStorage.removeItem(
            "datasetUnderstanding"
          );

          localStorage.removeItem(
            "lastQuestion"
          );

          localStorage.removeItem(
            "lastSQL"
          );

          localStorage.removeItem(
            "lastResults"
          );

          localStorage.removeItem(
            "lastExplanation"
          );


          // ==================================================
          // Analyze NEW dataset automatically
          // This generates dynamic query suggestions
          // ==================================================

          await analyzeUploadedDataset(
            csvText,
            tableName
          );

        }

      } catch (err) {

        console.error(err);

        setError(
          "Failed to load dataset"
        );

      }

    };


    reader.readAsText(file);


    // Allows selecting the same file again
    e.target.value = "";

  };


  // ============================================================
  // Manual AI Dataset Understanding
  // ============================================================

  const handleDatasetUnderstanding = async () => {

    const csv =
      localStorage.getItem("savedCSV");


    if (!csv) {

      alert(
        "Upload dataset first"
      );

      return;

    }


    setAiLoading(true);


    try {

      const response =
        await fetch(
          "http://127.0.0.1:8000/dataset/analyze-text",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              csv_text: csv,

              table_name:
                schema[0].table
            }),

          }
        );


      const data =
        await response.json();


      setDatasetUnderstanding(data);


      setShowAIProfile(true);


      localStorage.setItem(
        "datasetUnderstanding",
        JSON.stringify(data)
      );


    } finally {

      setAiLoading(false);

    }

  };


  // ============================================================
  // Clean SQL
  // ============================================================

  const cleanSQL = (q) =>
    q
      .replace(/```sql/gi, '')
      .replace(/```/g, '')
      .replace(/`/g, '')
      .trim();


  // ============================================================
  // Ask Question
  // ============================================================

  const handleAsk = async (q = question) => {

    setQuestion(q);

    localStorage.setItem(
      "lastQuestion",
      q
    );


    setThinking(true);

    setError('');

    setSql('');

    setResults(null);

    setExplanation('');


    try {

      const { sql: raw } =
        await generateSQL(
          q,
          schema
        );


      const finalSQL =
        cleanSQL(raw);


      setSql(finalSQL);


      localStorage.setItem(
        "lastSQL",
        finalSQL
      );


      let res;


      try {

        res =
          runQuery(finalSQL);


        setResults(res);


        localStorage.setItem(
          "lastResults",
          JSON.stringify(res)
        );


      } catch (e) {

        console.warn(
          "⚠️ SQL failed, trying auto-fix..."
        );


        try {

          const fixRes =
            await generateSQL(
              `Fix this SQL:\n${finalSQL}\nError: ${e.message}`,
              schema
            );


          const fixedSQL =
            cleanSQL(
              fixRes.sql
            );


          setSql(
            fixedSQL
          );


          const retryRes =
            runQuery(
              fixedSQL
            );


          setResults(
            retryRes
          );


          setError(
            "⚠️ Query auto-corrected"
          );


        } catch (fixErr) {

          setError(
            "SQL failed even after retry: " +
            fixErr.message
          );

        }


        return;

      }


      const {
        explanation: exp
      } =
        await explainSQL(
          finalSQL,
          q
        );


      setExplanation(
        exp
      );


      localStorage.setItem(
        "lastExplanation",
        exp
      );


      setHistory(prev =>
        [
          {
            question: q,
            sql: finalSQL,
            rows: res.rows.length,
            ts: Date.now()
          },

          ...prev

        ].slice(0, 8)
      );

    } catch (err) {

      setError(
        err.message ||
        'Something went wrong'
      );

    } finally {

      setThinking(false);

    }

  };


  // ============================================================
  // AI Insights
  // ============================================================

  const handleInsights = async () => {

    if (!schema?.length) return;


    try {

      setThinking(true);


      const res =
        await getInsights(
          schema
        );


      setInsights(
        res.insights || []
      );


    } catch (err) {

      setError(
        "Failed to fetch insights"
      );


    } finally {

      setThinking(false);

    }

  };


  // ============================================================
  // Copy SQL
  // ============================================================

  const copySQL = () => {

    navigator.clipboard.writeText(
      sql
    );


    setCopied(true);


    setTimeout(
      () => setCopied(false),
      1800
    );

  };


  // ============================================================
  // Loading Screen
  // ============================================================

  if (loading)

    return (

      <div className="splash">

        <div className="splash-ring" />

        <span>
          Initialising engine…
        </span>

      </div>

    );


  // ============================================================
  // MAIN UI
  // ============================================================

  return (

    <div className="shell">


      {/* ======================================================
          SIDEBAR
      ====================================================== */}

      <aside className="sidebar">


        <div className="sidebar-brand">

          <div className="brand-mark">

            <svg
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
            >

              <rect
                x="0"
                y="0"
                width="8"
                height="8"
                rx="2"
                fill="#6366f1"
              />

              <rect
                x="10"
                y="0"
                width="8"
                height="8"
                rx="2"
                fill="#6366f1"
                opacity=".4"
              />

              <rect
                x="0"
                y="10"
                width="8"
                height="8"
                rx="2"
                fill="#6366f1"
                opacity=".4"
              />

              <rect
                x="10"
                y="10"
                width="8"
                height="8"
                rx="2"
                fill="#6366f1"
                opacity=".15"
              />

            </svg>

          </div>


          <span className="brand-name">
            QueryAI
          </span>

        </div>


        <nav className="sidebar-nav">

          <button className="nav-item active">

            <svg
              width="15"
              height="15"
              viewBox="0 0 15 15"
              fill="none"
            >

              <rect
                x="1"
                y="1"
                width="5"
                height="5"
                rx="1"
                fill="currentColor"
              />

              <rect
                x="9"
                y="1"
                width="5"
                height="5"
                rx="1"
                fill="currentColor"
                opacity=".4"
              />

              <rect
                x="1"
                y="9"
                width="5"
                height="5"
                rx="1"
                fill="currentColor"
                opacity=".4"
              />

              <rect
                x="9"
                y="9"
                width="5"
                height="5"
                rx="1"
                fill="currentColor"
                opacity=".2"
              />

            </svg>

            Workspace

          </button>

        </nav>


        <div className="sidebar-divider" />


        <div className="sidebar-section">

          <p className="section-label">
            Dataset
          </p>


          <button
            className="upload-btn"
            onClick={() => {

              console.log(
                "fileRef =",
                fileRef.current
              );

              fileRef.current?.click();

            }}
          >

            <svg
              width="13"
              height="13"
              viewBox="0 0 13 13"
              fill="none"
            >

              <path
                d="M6.5 9V1M3 4l3.5-3.5L10 4M1 10.5h11v1H1z"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

            </svg>


            {dbLoaded
              ? 'Replace CSV'
              : 'Upload CSV'}

          </button>


          <input
            ref={fileRef}
            type="file"
            accept=".csv"
            hidden
            onChange={handleUpload}
          />

        </div>


        {schema.length > 0 && (

          <div className="sidebar-section">

            <p className="section-label">
              Schema
            </p>

            <SchemaPanel
              schema={schema}
            />

          </div>

        )}


        {history.length > 0 && (

          <div className="sidebar-section sidebar-section--scroll">

            <p className="section-label">
              Recent
            </p>


            <HistoryPanel

              history={history}

              onSelect={(q) => {

                setQuestion(q);

                handleAsk(q);

              }}

            />

          </div>

        )}

      </aside>


      {/* ======================================================
          MAIN
      ====================================================== */}

      <div className="main">


        {/* ====================================================
            TOPBAR
        ==================================================== */}

        <header className="topbar">

          <div className="topbar-left">

            <span className="topbar-title">
              Query workspace
            </span>


            {dbLoaded &&
              schema[0] && (

                <span className="topbar-pill">

                  {schema[0].table}

                </span>

              )}

          </div>


          {results && (

            <button
              className="icon-btn"
              onClick={() =>
                exportCSV(
                  results.columns,
                  results.rows
                )
              }
            >

              <svg
                width="13"
                height="13"
                viewBox="0 0 13 13"
                fill="none"
              >

                <path
                  d="M6.5 1v8M3 6l3.5 3.5L10 6M1 11h11"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

              </svg>

              Export

            </button>

          )}

        </header>


        {/* ====================================================
            BODY
        ==================================================== */}

        <div className="main-body">


          {!dbLoaded ? (

            <div className="empty-state">

              <div className="empty-icon">

                <svg
                  width="36"
                  height="36"
                  viewBox="0 0 36 36"
                  fill="none"
                >

                  <rect
                    x="3"
                    y="7"
                    width="30"
                    height="22"
                    rx="3"
                    stroke="#6366f1"
                    strokeWidth="1.5"
                  />

                  <path
                    d="M3 13h30"
                    stroke="#6366f1"
                    strokeWidth="1.5"
                  />

                  <path
                    d="M9 19h8M9 23h5"
                    stroke="#4b5563"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />

                </svg>

              </div>


              <h2>
                Upload a CSV to begin
              </h2>


              <p>
                Your data runs entirely in-browser
                via WebAssembly. Nothing leaves
                your machine.
              </p>


              <button
                className="btn-primary"
                onClick={() =>
                  fileRef.current.click()
                }
              >
                Choose file
              </button>

            </div>

          ) : (

            <>


              {/* ==================================================
                  DATASET SUMMARY
              ================================================== */}

              <DatasetSummary
                stats={datasetStats}
              />


              {/* ==================================================
                  AI DATASET PROFILE BUTTON
              ================================================== */}

              <div className="ai-profile-row">

                <button
                  className="btn-primary"

                  onClick={() => {

                    if (!datasetUnderstanding) {

                      handleDatasetUnderstanding();

                    } else {

                      setShowAIProfile(
                        !showAIProfile
                      );

                    }

                  }}

                  disabled={aiLoading}
                >

                  {aiLoading

                    ? (
                      <>
                        Analyzing dataset

                        <span className="dot-pulse">
                          <i /><i /><i />
                        </span>
                      </>
                    )

                    : !datasetUnderstanding

                      ? "Analyze Dataset"

                      : showAIProfile

                        ? "▲ Hide AI Profile"

                        : "▼ Show AI Profile"

                  }

                </button>

              </div>


              {/* ==================================================
                  AI DATASET CARD
              ================================================== */}

              {datasetUnderstanding &&
                showAIProfile && (

                  <AIDatasetCard
                    data={
                      datasetUnderstanding
                    }
                  />

                )}


              {/* ==================================================
                  QUERY CARD
                  DYNAMIC SUGGESTIONS
              ================================================== */}

              <QueryCard

                question={
                  question
                }

                setQuestion={
                  setQuestion
                }

                handleAsk={
                  handleAsk
                }

                handleInsights={
                  handleInsights
                }

                thinking={
                  thinking
                }


                /*
                 * Suggestions are now generated from
                 * the currently uploaded dataset.
                 *
                 * No hardcoded Sales questions.
                 */

                suggestions={
                  datasetUnderstanding
                    ?.suggested_questions || []
                }

              />


              {/* ==================================================
                  ERROR
              ================================================== */}

              {error && (

                <div className="alert error">

                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    fill="none"
                  >

                    <circle
                      cx="7"
                      cy="7"
                      r="6"
                      stroke="currentColor"
                      strokeWidth="1.2"
                    />

                    <path
                      d="M7 4v3.5M7 9.5v.5"
                      stroke="currentColor"
                      strokeWidth="1.4"
                      strokeLinecap="round"
                    />

                  </svg>

                  {error}

                </div>

              )}


              {/* ==================================================
                  AI INSIGHTS
              ================================================== */}

              {insights.length > 0 && (

                <div className="card insights-card">

                  <div className="insights-head">
                    AI Insights
                  </div>


                  <div className="insight-chips">

                    {insights.map(
                      (item, i) => (

                        <button

                          key={i}

                          type="button"

                          className="insight-chip"

                          onClick={() => {

                            setQuestion(
                              item.title
                            );

                            handleAsk(
                              item.title
                            );

                          }}

                        >

                          {item.title}

                        </button>

                      )
                    )}

                  </div>

                </div>

              )}


              {/* ==================================================
                  OUTPUT
              ================================================== */}

              <OutputCard

                sql={
                  sql
                }

                copied={
                  copied
                }

                copySQL={
                  copySQL
                }

                explanation={
                  explanation
                }

                results={
                  results
                }

                activeTab={
                  activeTab
                }

                setActiveTab={
                  setActiveTab
                }

              />

            </>

          )}

        </div>

      </div>

    </div>

  );

}