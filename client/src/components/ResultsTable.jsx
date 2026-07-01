export default function ResultsTable({ columns, rows }) {
  if (!columns?.length) return null;
  return (
    <div className="results-wrap">
      <div className="results-meta">{rows.length} row{rows.length !== 1 ? 's' : ''}</div>
      <table className="results-table">
        <thead>
          <tr>{columns.map(c => <th key={c}>{c}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td key={j}>
                  {cell === null ? <span className="null-val">null</span> : String(cell)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}