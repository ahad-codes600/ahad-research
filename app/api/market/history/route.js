import { NextResponse } from "next/server";

const YAHOO = {
  gold: "GC=F",
  dxy: "DX-Y.NYB",
  spx: "^GSPC",
  us10y: "^TNX",
};
const FRED = {
  cpi: "CPIAUCSL",
  pce: "PCEPI",
  corepce: "PCEPILFE",
  real10y: "DFII10",
  fedfunds: "FEDFUNDS",
  unemployment: "UNRATE",
};

async function yahoo(symbol) {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=1y&interval=1d&events=history`;
  const r = await fetch(url, { next: { revalidate: 900 } });
  if (!r.ok) throw new Error("Yahoo unavailable");
  const result = (await r.json()).chart?.result?.[0];
  const timestamps = result?.timestamp || [];
  const closes = result?.indicators?.quote?.[0]?.close || [];
  return timestamps.map((ts, i) => ({ date: new Date(ts * 1000).toISOString().slice(0, 10), value: Number(closes[i]) }))
    .filter((x) => Number.isFinite(x.value));
}

async function fred(id) {
  const r = await fetch(`https://fred.stlouisfed.org/graph/fredgraph.csv?id=${id}`, { next: { revalidate: 1800 } });
  if (!r.ok) throw new Error("FRED unavailable");
  return (await r.text()).trim().split(/\r?\n/).slice(1).map((row) => {
    const i = row.indexOf(",");
    return { date: row.slice(0, i), value: Number(row.slice(i + 1)) };
  }).filter((x) => Number.isFinite(x.value)).slice(-260);
}

export async function GET(req) {
  const u = new URL(req.url);
  const requested = (u.searchParams.get("series") || "gold,dxy,spx,us10y,cpi,pce,real10y")
    .split(",").map((x) => x.trim()).filter(Boolean);
  const allowed = requested.filter((x) => YAHOO[x] || FRED[x]);

  const entries = await Promise.all(allowed.map(async (key) => {
    try {
      const values = YAHOO[key] ? await yahoo(YAHOO[key]) : await fred(FRED[key]);
      return [key, { key, values }];
    } catch {
      return [key, { key, values: [], error: true }];
    }
  }));

  return NextResponse.json({ updatedAt: new Date().toISOString(), series: Object.fromEntries(entries) });
}
