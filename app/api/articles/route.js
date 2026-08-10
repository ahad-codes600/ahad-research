export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE, verifySession } from "../../../lib/auth";
import { getAllArticles, createArticle, updateArticle, deleteArticle } from "../../../lib/articles";

async function authed() {
  const c = await cookies();
  return verifySession(c.get(COOKIE)?.value);
}

export async function GET() {
  if (!(await authed())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    return NextResponse.json({ articles: await getAllArticles() }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "Could not load articles." }, { status: 500 });
  }
}

export async function POST(req) {
  if (!(await authed())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await req.json();
    if (!body.title || !body.category || !body.content) return NextResponse.json({ error: "Title, category and article body are required." }, { status: 400 });
    return NextResponse.json({ article: await createArticle(body) }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Could not create article." }, { status: 400 });
  }
}

export async function PUT(req) {
  if (!(await authed())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const a = await updateArticle(await req.json());
    return a ? NextResponse.json({ article: a }) : NextResponse.json({ error: "Article not found." }, { status: 404 });
  } catch {
    return NextResponse.json({ error: "Could not update article." }, { status: 400 });
  }
}

export async function DELETE(req) {
  if (!(await authed())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const id = new URL(req.url).searchParams.get("id");
  try {
    const ok = await deleteArticle(id);
    return ok ? NextResponse.json({ ok: true }) : NextResponse.json({ error: "Article not found." }, { status: 404 });
  } catch {
    return NextResponse.json({ error: "Could not delete article." }, { status: 500 });
  }
}
