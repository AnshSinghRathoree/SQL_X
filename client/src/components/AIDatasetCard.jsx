export default function AIDatasetCard({ data }) {
  if (!data) return null;

  return (
    <div className="card" style={{ marginBottom: "16px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "18px",
        }}
      >
        <div>
          <h2 style={{ margin: 0 }}> AI Dataset Profile</h2>
          <p style={{ color: "#9ca3af", marginTop: "6px" }}>
            AI-generated overview of your uploaded dataset.
          </p>
        </div>

 
      </div>

      <div style={{ marginBottom: "18px" }}>
        <h3>{data.title}</h3>

        <p style={{ color: "#cbd5e1" }}>
          {data.summary}
        </p>
      </div>

      <div style={{ marginBottom: "18px" }}>
        <strong>Business Domain</strong>

        <p style={{ marginTop: "6px" }}>
          {data.business_domain}
        </p>
      </div>

      <div style={{ marginBottom: "18px" }}>
        <strong>Analysis Capabilities</strong>

        <div
          style={{
            display: "flex",
            gap: "10px",
            flexWrap: "wrap",
            marginTop: "10px",
          }}
        >
          {data.analysis_capabilities.map((item, index) => (
            <span
              key={index}
              style={{
                padding: "8px 14px",
                background: "#1f2937",
                borderRadius: "20px",
                border: "1px solid #374151",
              }}
            >
              {item}
            </span>
          ))}
        </div>
      </div>

      <div>
        <strong>Suggested Questions</strong>

        <ul style={{ marginTop: "12px" }}>
          {data.suggested_questions.map((q, index) => (
            <li key={index} style={{ marginBottom: "8px" }}>
              {q}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}