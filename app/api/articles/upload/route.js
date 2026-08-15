import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE, verifySession } from "../../../../lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function authed() {
  const c = await cookies();
  return verifySession(c.get(COOKIE)?.value);
}

export async function POST(req) {
  try {
    // Admin authentication
    if (!(await authed())) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // We are receiving the PDF directly.
    // NO multipart/form-data is used.
    const contentType =
      req.headers.get("content-type") || "";

    if (!contentType.toLowerCase().startsWith("application/pdf")) {
      return NextResponse.json(
        {
          error:
            "Please upload a PDF file."
        },
        { status: 400 }
      );
    }

    const contentLength =
      Number(req.headers.get("content-length") || "0");

    if (
      contentLength &&
      contentLength > 25 * 1024 * 1024
    ) {
      return NextResponse.json(
        {
          error:
            "PDF must be smaller than 25 MB."
        },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(
      await req.arrayBuffer()
    );

    if (!buffer.length) {
      return NextResponse.json(
        {
          error: "The PDF file is empty."
        },
        { status: 400 }
      );
    }

    if (buffer.length > 25 * 1024 * 1024) {
      return NextResponse.json(
        {
          error:
            "PDF must be smaller than 25 MB."
        },
        { status: 400 }
      );
    }

    const originalName =
      req.headers.get("x-file-name") ||
      "article.pdf";

    const safeName = decodeURIComponent(
      originalName
    )
      .replace(/\.pdf$/i, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 80);

    const fileName =
      `${Date.now()}-${safeName || "article"}.pdf`;

    const supabaseUrl =
      process.env.SUPABASE_URL;

    const serviceRoleKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        {
          error:
            "Supabase server environment variables are missing."
        },
        { status: 500 }
      );
    }

    const uploadUrl =
      `${supabaseUrl}/storage/v1/object/articles/${fileName}`;

    const response = await fetch(
      uploadUrl,
      {
        method: "POST",
        headers: {
          Authorization:
            `Bearer ${serviceRoleKey}`,
          apikey: serviceRoleKey,
          "Content-Type":
            "application/pdf",
          "x-upsert":
            "false"
        },
        body: buffer
      }
    );

    if (!response.ok) {
      const errorText =
        await response.text();

      console.error(
        "SUPABASE PDF UPLOAD ERROR:",
        errorText
      );

      return NextResponse.json(
        {
          error:
            "Could not upload PDF to Supabase."
        },
        { status: 500 }
      );
    }

    const publicUrl =
      `${supabaseUrl}/storage/v1/object/public/articles/${encodeURIComponent(fileName)}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      fileName
    });

  } catch (error) {
    console.error(
      "PDF UPLOAD ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          error?.message ||
          "Could not upload PDF."
      },
      { status: 500 }
    );
  }
}