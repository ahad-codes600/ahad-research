export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import {
  COOKIE,
  verifySession,
} from "../../../lib/auth";

import {
  getAllArticles,
  createArticle,
  updateArticle,
  deleteArticle,
} from "../../../lib/articles";

async function authed() {
  const c = await cookies();
  return verifySession(c.get(COOKIE)?.value);
}

export async function GET() {
  if (!(await authed())) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const articles = await getAllArticles();

    return NextResponse.json(
      { articles },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error(
      "GET ARTICLES ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          error?.message ||
          "Could not load articles.",
      },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  if (!(await authed())) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    // /api/articles receives JSON.
    // PDF uploading happens separately at:
    // /api/articles/upload
    const body = await req.json();

    if (
      !body.title ||
      !body.category ||
      (!body.content && !body.pdfUrl)
    ) {
      return NextResponse.json(
        {
          error:
            "Title, category and article content or PDF are required.",
        },
        { status: 400 }
      );
    }

    const article =
      await createArticle(body);

    return NextResponse.json(
      { article },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "CREATE ARTICLE ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          error?.message ||
          "Could not create article.",
      },
      { status: 400 }
    );
  }
}

export async function PUT(req) {
  if (!(await authed())) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();

    const article =
      await updateArticle(body);

    return article
      ? NextResponse.json({ article })
      : NextResponse.json(
          {
            error:
              "Article not found.",
          },
          { status: 404 }
        );
  } catch (error) {
    console.error(
      "UPDATE ARTICLE ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          error?.message ||
          "Could not update article.",
      },
      { status: 400 }
    );
  }
}

export async function DELETE(req) {
  if (!(await authed())) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const id =
    new URL(req.url)
      .searchParams
      .get("id");

  if (!id) {
    return NextResponse.json(
      {
        error:
          "Article ID is required.",
      },
      { status: 400 }
    );
  }

  try {
    const ok =
      await deleteArticle(id);

    return ok
      ? NextResponse.json({
          ok: true,
        })
      : NextResponse.json(
          {
            error:
              "Article not found.",
          },
          { status: 404 }
        );
  } catch (error) {
    console.error(
      "DELETE ARTICLE ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          error?.message ||
          "Could not delete article.",
      },
      { status: 500 }
    );
  }
}