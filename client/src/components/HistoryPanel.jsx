export default function HistoryPanel({ history, onSelect }) {
  if (!history?.length) return null;
  return (
    <div className="history-list">
      {history.map((h, i) => (
        <button key={i} className="history-item" onClick={() => onSelect(h.question)}>
          <span className="history-q">{h.question}</span>
          <span className="history-meta">{h.rows} rows · {new Date(h.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </button>
      ))}
    </div>
  );
}