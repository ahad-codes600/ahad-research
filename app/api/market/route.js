import { NextResponse } from "next/server";
import { getIndicators } from "../../../lib/market";

export async function GET() {
  const data = await getIndicators();
  return NextResponse.json(data);
}
