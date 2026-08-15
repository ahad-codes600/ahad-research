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

async function uploadPDF(file) {
  if (!file || file.size === 0) {
    throw new Error("PDF file is required.");
  }

  if (file.type !== "application/pdf") {
    throw new Error("Only PDF files are allowed.");
  }

  // 50 MB maximum
  if (file.size > 50 * 1024 * 1024) {
    throw new Error("PDF must be smaller than 50 MB.");
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "Supabase server environment variables are missing."
    );
  }

  const { createClient } = await import(
    "@supabase/supabase-js"
  );

  const supabase = createClient(
    supabaseUrl,
    serviceRoleKey,
    {
      auth: {
        persistSession: false,
      },
    }
  );

  const safeName = file.name
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .replace(/-+/g, "-");

  const filePath = `research/${crypto.randomUUID()}-${safeName}`;

  const buffer = Buffer.from(
    await file.arrayBuffer()
  );

  const { error } = await supabase.storage
    .from("articles")
    .upload(filePath, buffer, {
      contentType: "application/pdf",
      upsert: false,
    });

  if (error) {
    throw error;
  }

  const {
    data: { publicUrl },
  } = supabase.storage
    .from("articles")
    .getPublicUrl(filePath);

  if (!publicUrl) {
    throw new Error(
      "Could not generate PDF public URL."
    );
  }

  return publicUrl;
}

export async function GET() {
  if (!(await authed())) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    return NextResponse.json(
      {
        articles: await getAllArticles(),
      },
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
    const formData = await req.formData();

    const title = formData.get("title");
    const category = formData.get("category");
    const excerpt = formData.get("excerpt") || "";
    const status =
      formData.get("status") || "published";
    const pdf = formData.get("pdf");

    if (!title || !category) {
      return NextResponse.json(
        {
          error:
            "Title and category are required.",
        },
        { status: 400 }
      );
    }

    if (!pdf || typeof pdf === "string") {
      return NextResponse.json(
        {
          error:
            "Please select a PDF before publishing.",
        },
        { status: 400 }
      );
    }

    const pdfUrl = await uploadPDF(pdf);

    const article = await createArticle({
      title,
      category,
      excerpt,
      content: "",
      status,
      pdf_url: pdfUrl,
    });

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
    const formData = await req.formData();

    const id = formData.get("id");
    const title = formData.get("title");
    const category = formData.get("category");
    const excerpt = formData.get("excerpt") || "";
    const status =
      formData.get("status") || "published";
    const pdf = formData.get("pdf");

    if (!id || !title || !category) {
      return NextResponse.json(
        {
          error:
            "Article ID, title and category are required.",
        },
        { status: 400 }
      );
    }

    let pdfUrl;

    if (pdf && typeof pdf !== "string") {
      pdfUrl = await uploadPDF(pdf);
    }

    const article = await updateArticle({
      id,
      title,
      category,
      excerpt,
      content: "",
      status,
      ...(pdfUrl ? { pdf_url: pdfUrl } : {}),
    });

    return article
      ? NextResponse.json({ article })
      : NextResponse.json(
          { error: "Article not found." },
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

  const id = new URL(req.url).searchParams.get(
    "id"
  );

  try {
    const ok = await deleteArticle(id);

    return ok
      ? NextResponse.json({ ok: true })
      : NextResponse.json(
          { error: "Article not found." },
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