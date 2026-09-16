export function exportCSV(columns, rows) {
  if (!columns || !rows) return;

  // Create CSV content
  const csvContent = [
    columns.join(','), // header
    ...rows.map(row =>
      row
        .map(cell => {
          // Handle commas and quotes safely
          if (typeof cell === 'string' && cell.includes(',')) {
            return `"${cell}"`;
          }
          return cell;
        })
        .join(',')
    )
  ].join('\n');

  // Create file blob
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  // Create download link
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'query_results.csv');

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}


