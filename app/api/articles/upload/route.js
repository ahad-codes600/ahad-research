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
    // Only logged-in admin can upload PDFs.
    if (!(await authed())) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || typeof file === "string") {
      return NextResponse.json(
        { error: "No PDF file was provided." },
        { status: 400 }
      );
    }

    // Only PDF files are accepted.
    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "Only PDF files are allowed." },
        { status: 400 }
      );
    }

    // 25 MB maximum.
    if (file.size > 25 * 1024 * 1024) {
      return NextResponse.json(
        { error: "PDF must be smaller than 25 MB." },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(
      await file.arrayBuffer()
    );

    const extension = "pdf";

    const safeName = file.name
      .replace(/\.pdf$/i, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 80);

    const fileName =
      `${Date.now()}-${safeName || "article"}.${extension}`;

    const supabaseUrl =
      process.env.SUPABASE_URL;

    const serviceRoleKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        {
          error:
            "Supabase server environment variables are missing.",
        },
        { status: 500 }
      );
    }

    // Use Supabase REST Storage API directly.
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
          "x-upsert": "false",
        },
        body: buffer,
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
            "Could not upload PDF to Supabase.",
        },
        { status: 500 }
      );
    }

    // Public URL for the uploaded PDF.
    const publicUrl =
      `${supabaseUrl}/storage/v1/object/public/articles/${encodeURIComponent(fileName)}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      fileName,
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
          "Could not upload PDF.",
      },
      { status: 500 }
    );
  }
}