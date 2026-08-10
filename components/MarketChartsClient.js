"use client";
import { useEffect, useMemo, useState } from "react";

const options = [
  ["gold", "Gold / XAUUSD", "USD / oz"],
  ["dxy", "Dollar Index", "Index"],
  ["spx", "S&P 500", "Index"],
  ["us10y", "US 10Y Yield", "%"],
  ["cpi", "CPI", "% / index"],
  ["pce", "PCE", "% / index"],
  ["real10y", "10Y Real Rate", "%"],
];

function fmt(v) { return Number(v).toLocaleString("en-US", { maximumFractionDigits: 2 }); }
function points(values, width = 900, height = 330, pad = 30) {
  if (!values.length) return "";
  const min = Math.min(...values.map((x) => x.value));
  const max = Math.max(...values.map((x) => x.value));
  const span = max - min || 1;
  return values.map((x, i) => {
    const px = pad + (i / Math.max(values.length - 1, 1)) * (width - pad * 2);
    const py = height - pad - ((x.value - min) / span) * (height - pad * 2);
    return `${px.toFixed(1)},${py.toFixed(1)}`;
  }).join(" ");
}

export default function MarketChartsClient() {
  const [data, setData] = useState(null);
  const [selected, setSelected] = useState("gold");
  const [range, setRange] = useState("6m");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/market/history?series=" + options.map((x) => x[0]).join(","), { cache: "no-store" })
      .then((r) => r.json()).then(setData).catch(() => setData({ series: {} })).finally(() => setLoading(false));
  }, []);

  const series = data?.series?.[selected]?.values || [];
  const filtered = useMemo(() => {
    const days = range === "1m" ? 31 : range === "3m" ? 92 : range === "6m" ? 184 : 365;
    return series.slice(-days);
  }, [series, range]);
  const meta = options.find((x) => x[0] === selected) || options[0];
  const latest = filtered.at(-1)?.value;
  const first = filtered[0]?.value;
  const change = latest != null && first ? ((latest - first) / first) * 100 : null;

  return <main className="analytics-page">
    <section className="analytics-hero"><div className="analytics-hero-grid"/><div className="analytics-hero-inner"><span className="section-kicker light">MARKET INTELLIGENCE / STEP 5</span><h1>Market Charts</h1><p>Interactive historical context for prices, rates and macroeconomic series. Use the chart to compare regimes, trends and turning points before writing the analysis.</p></div></section>
    <section className="analytics-body">
      <div className="series-tabs">{options.map(([key, label]) => <button key={key} className={selected === key ? "active" : ""} onClick={() => setSelected(key)}>{label}</button>)}</div>
      <div className="chart-panel">
        <div className="chart-panel-head"><div><span className="section-kicker">SELECTED SERIES</span><h2>{meta[1]}</h2><p>{meta[2]} · Latest available observation</p></div><div className="chart-stat"><strong>{loading ? "…" : latest != null ? fmt(latest) : "Unavailable"}</strong>{change != null && <span className={change >= 0 ? "positive" : "negative"}>{change >= 0 ? "+" : ""}{change.toFixed(2)}% over view</span>}</div></div>
        <div className="range-row">{[["1m","1 MONTH"],["3m","3 MONTHS"],["6m","6 MONTHS"],["1y","1 YEAR"]].map(([key,label]) => <button key={key} className={range === key ? "active" : ""} onClick={() => setRange(key)}>{label}</button>)}</div>
        <div className="chart-wrap">{filtered.length ? <svg viewBox="0 0 900 330" role="img" aria-label={`${meta[1]} historical chart`}><line x1="30" y1="30" x2="30" y2="300" className="chart-axis"/><line x1="30" y1="300" x2="870" y2="300" className="chart-axis"/><polyline points={points(filtered)} fill="none" className="chart-line"/><polyline points={points(filtered.map((x, i) => ({ ...x, value: x.value })))} fill="none" className="chart-line-soft"/></svg> : <div className="chart-empty">{loading ? "Loading market history…" : "Historical data is temporarily unavailable."}</div>}</div>
        <div className="chart-footer"><span>Source: {YAHOO_SOURCE(selected)}</span><span>Updated: {data?.updatedAt ? new Date(data.updatedAt).toLocaleString() : "—"}</span></div>
      </div>
      <div className="chart-context-grid"><article><span className="section-kicker">READING THE CHART</span><h3>Price is the observation. Regime is the context.</h3><p>Use historical moves alongside rates, inflation, the dollar and positioning. A chart should help you form a question, not become the conclusion by itself.</p></article><article><span className="section-kicker">RESEARCH WORKFLOW</span><h3>Start with the move. Then investigate the driver.</h3><p>Identify the inflection, check the macro backdrop, review positioning and only then build the written thesis.</p></article></div>
    </section>
  </main>;
}
function YAHOO_SOURCE(key) { return ["gold","dxy","spx","us10y"].includes(key) ? "Yahoo Finance market feed" : "Federal Reserve Economic Data (FRED)"; }
