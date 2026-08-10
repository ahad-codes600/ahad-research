// Shared market/macro data fetchers used by /api/market and the homepage
// ticker, so both stay in sync and we only write this fetch logic once.

const SERIES = {
  CPI: "CPIAUCSL",
  PCE: "PCEPI",
  CORE_PCE: "PCEPILFE",
  FED_FUNDS: "FEDFUNDS",
  REAL_RATE_10Y: "DFII10",
  UNEMPLOYMENT: "UNRATE",
};

async function fred(id) {
  const r = await fetch(`https://fred.stlouisfed.org/graph/fredgraph.csv?id=${id}`, { next: { revalidate: 900 } });
  if (!r.ok) throw new Error("FRED");
  const rows = (await r.text())
    .trim()
    .split(/\r?\n/)
    .slice(1)
    .map((x) => {
      const i = x.indexOf(",");
      return { date: x.slice(0, i), value: Number(x.slice(i + 1)) };
    })
    .filter((x) => Number.isFinite(x.value));
  return rows.at(-1) || null;
}

async function yahoo(symbol) {
  const r = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=5d&interval=1d`, { next: { revalidate: 300 } });
  if (!r.ok) throw new Error("Yahoo");
  const q = (await r.json()).chart?.result?.[0]?.indicators?.quote?.[0]?.close || [];
  const p = q.filter(Number.isFinite);
  const value = p.at(-1);
  const prev = p.at(-2);
  return value == null ? null : { value, change: prev == null ? null : value - prev, pct: prev ? ((value - prev) / prev) * 100 : null };
}

async function yoy(id, current) {
  if (!current) return null;
  try {
    const r = await fetch(`https://fred.stlouisfed.org/graph/fredgraph.csv?id=${id}`, { next: { revalidate: 900 } });
    const rows = (await r.text())
      .trim()
      .split(/\r?\n/)
      .slice(1)
      .map((x) => {
        const i = x.indexOf(",");
        return { date: x.slice(0, i), value: Number(x.slice(i + 1)) };
      })
      .filter((x) => Number.isFinite(x.value));
    const old = rows.length > 12 ? rows.at(-13) : null;
    return old ? (current.value / old.value - 1) * 100 : null;
  } catch {
    return null;
  }
}

export async function getIndicators() {
  const jobs = await Promise.allSettled([
    fred(SERIES.CPI),
    fred(SERIES.PCE),
    fred(SERIES.CORE_PCE),
    fred(SERIES.FED_FUNDS),
    fred(SERIES.REAL_RATE_10Y),
    fred(SERIES.UNEMPLOYMENT),
    yahoo("GC=F"),
    yahoo("DX-Y.NYB"),
    yahoo("^GSPC"),
    yahoo("^TNX"),
  ]);
  const v = (x) => (x.status === "fulfilled" ? x.value : null);
  const [CPI, PCE, CORE, FED, REAL, UNEMP, GOLD, DXY, SPX, Y10] = jobs.map(v);
  const [cpiYoY, pceYoY] = await Promise.all([yoy(SERIES.CPI, CPI), yoy(SERIES.PCE, PCE)]);
  const item = (key, label, value, unit, date, source, extra = {}) => ({ key, label, value, unit, date, source, ...extra });
  return {
    updatedAt: new Date().toISOString(),
    indicators: [
      item("gold", "GOLD / XAUUSD", GOLD?.value, "USD/oz", null, "Yahoo Finance", GOLD || {}),
      item("dxy", "DXY", DXY?.value, "index", null, "Yahoo Finance", DXY || {}),
      item("spx", "S&P 500", SPX?.value, "index", null, "Yahoo Finance", SPX || {}),
      item("us10y", "US 10Y YIELD", Y10?.value, "%", null, "Yahoo Finance", Y10 || {}),
      item("cpi", "CPI INFLATION", cpiYoY, "% YoY", CPI?.date, "FRED"),
      item("pce", "PCE INFLATION", pceYoY, "% YoY", PCE?.date, "FRED"),
      item("corepce", "CORE PCE", CORE?.value, "index", CORE?.date, "FRED"),
      item("fedfunds", "FED FUNDS RATE", FED?.value, "%", FED?.date, "FRED"),
      item("real10y", "10Y REAL RATE", REAL?.value, "%", REAL?.date, "FRED"),
      item("unemployment", "UNEMPLOYMENT", UNEMP?.value, "%", UNEMP?.date, "FRED"),
    ],
  };
}
