import { NextResponse } from "next/server";

const GOLD_CODE = "088691";
const API = "https://publicreporting.cftc.gov/resource/6dca-aqww.json";

export async function GET() {
  try {
    const params = new URLSearchParams({
      "$where": `cftc_commodity_code='${GOLD_CODE}'`,
      "$order": "report_date_as_yyyy_mm_dd DESC",
      "$limit": "26",
    });
    const r = await fetch(`${API}?${params.toString()}`, { next: { revalidate: 21600 } });
    if (!r.ok) throw new Error("CFTC unavailable");
    const rows = await r.json();
    const data = rows.map((x) => {
      const long = Number(x.noncomm_positions_long_all || 0);
      const short = Number(x.noncomm_positions_short_all || 0);
      const commLong = Number(x.comm_positions_long_all || 0);
      const commShort = Number(x.comm_positions_short_all || 0);
      return { date: String(x.report_date_as_yyyy_mm_dd || "").slice(0,10), market: x.market_and_exchange_names, openInterest: Number(x.open_interest_all || 0), nonCommercialLong: long, nonCommercialShort: short, nonCommercialNet: long - short, commercialNet: commLong - commShort };
    }).reverse();
    return NextResponse.json({ updatedAt: new Date().toISOString(), source: "CFTC Legacy Futures Only", data });
  } catch {
    return NextResponse.json({ updatedAt: new Date().toISOString(), source: "CFTC Legacy Futures Only", data: [], error: "CFTC positioning feed temporarily unavailable." }, { status: 200 });
  }
}
