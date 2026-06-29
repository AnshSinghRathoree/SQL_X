import { useEffect, useRef, useState } from 'react';

export default function ChartView({ columns, rows }) {
  const canvasRef = useRef();
  const chartRef = useRef();

  const [selectedChart, setSelectedChart] = useState(null);

  // ✅ Detect chart type
  const detectChartType = () => {
    if (!columns?.length || !rows?.length) return null;

    const labelSample = rows[0][0];
    const isDate = !isNaN(Date.parse(labelSample));

    if (isDate) return "line";
    if (rows.length <= 6) return "pie";
    return "bar";
  };

  const detectedType = detectChartType();
  const chartType = selectedChart || detectedType;

  // ✅ Better numeric column detection
  const valueCol = columns.findIndex((_, i) =>
    i > 0 && rows.every(r => !isNaN(Number(r[i])))
  );

  if (!columns || columns.length < 2 || !rows?.length || valueCol === -1) {
    return (
      <p style={{ color: "#777", padding: 16 }}>
        Not enough data to display chart
      </p>
    );
  }

  // ✅ Limit rows for performance
  const limitedRows = rows.slice(0, 10);

  const labels = limitedRows.map(r => String(r[0]));
  const data = limitedRows.map(r => Number(r[valueCol]) || 0);
  const maxVal = Math.max(...data);

  useEffect(() => {
    const buildChart = () => {
      if (!window.Chart) return setTimeout(buildChart, 80);
      if (chartRef.current) chartRef.current.destroy();

      const ctx = canvasRef.current.getContext('2d');

      const colors = data.map((v, i) => {
        const palette = [
          "#6366f1", "#22c55e", "#f59e0b",
          "#ef4444", "#3b82f6", "#a855f7"
        ];

        if (chartType === "pie") {
          return palette[i % palette.length];
        }

        const ratio = maxVal ? v / maxVal : 0;
        const alpha = 0.4 + ratio * 0.5;
        return `rgba(99,102,241,${alpha.toFixed(2)})`;
      });

      chartRef.current = new window.Chart(ctx, {
        type: chartType || "bar",
        data: {
          labels,
          datasets: [{
            label: columns[valueCol],
            data,
            backgroundColor: colors,
            borderColor: chartType === "line" ? "#6366f1" : colors,
            borderWidth: 2,
            borderRadius: chartType === "bar" ? 6 : 0,
            tension: 0.4,
            fill: chartType === "line" ? false : true,
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          animation: { duration: 400 },
          plugins: {
            legend: {
              display: chartType === "pie"
            },
            title: {
              display: true,
              text: `${columns[valueCol]} vs ${columns[0]}`,
              color: "#aaa",
              font: { size: 14 }
            },
            tooltip: {
              backgroundColor: '#18181b',
              borderColor: 'rgba(255,255,255,0.08)',
              borderWidth: 1,
              titleColor: '#a1a1aa',
              bodyColor: '#fafafa',
              padding: 10,
              cornerRadius: 8,
              displayColors: false,
              callbacks: {
                label: item =>
                  `${columns[valueCol]}: ${Number(item.raw).toLocaleString()}`
              }
            }
          },
          scales: chartType !== "pie" ? {
            x: {
              grid: { display: false },
              ticks: { color: '#52525b' }
            },
            y: {
              grid: { color: 'rgba(255,255,255,0.04)' },
              ticks: {
                color: '#52525b',
                callback: v => Number(v).toLocaleString()
              }
            }
          } : {}
        }
      });
    };

    if (!window.Chart) {
      const s = document.createElement('script');
      s.src = 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.min.js';
      s.onload = buildChart;
      document.head.appendChild(s);
    } else {
      buildChart();
    }

    return () => {
      if (chartRef.current) chartRef.current.destroy();
    };
  }, [columns, rows, chartType]);

  return (
    <div style={{ padding: '16px' }}>

      {/* ✅ Controls */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
        {["bar", "line", "pie"].map(type => (
          <button
            key={type}
            onClick={() => setSelectedChart(type)}
            style={{
              padding: "6px 12px",
              borderRadius: 8,
              border: chartType === type ? "none" : "1px solid #333",
              background: chartType === type ? "#6366f1" : "#111",
              color: chartType === type ? "#fff" : "#aaa",
              cursor: "pointer"
            }}
          >
            {type.toUpperCase()}
          </button>
        ))}

        <button
          onClick={() => setSelectedChart(null)}
          style={{
            padding: "6px 12px",
            borderRadius: 8,
            border: "1px dashed #444",
            background: "transparent",
            color: "#aaa",
            cursor: "pointer"
          }}
        >
          AUTO
        </button>
      </div>

      {/* ❗ No chart case */}
      {!chartType && (
        <p style={{ color: "#888", marginBottom: 10 }}>
          No suitable chart for this data
        </p>
      )}

      {/* ✅ Chart */}
      <div style={{ height: '320px' }}>
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
}