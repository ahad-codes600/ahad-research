import fs from "fs";
import path from "path";
import crypto from "crypto";

const file = path.join(process.cwd(), "data", "articles.json");

const labels = {
  "precious-metals": "PRECIOUS METALS & COMMODITIES",
  macro: "MACROECONOMIC ANALYSIS",
  "monetary-policy": "MONETARY POLICY",
  positioning: "POSITIONING & COT",
  geopolitics: "GEOPOLITICAL MARKET INTELLIGENCE",
  "economic-indicators": "ECONOMIC INDICATORS",
  "market-data": "MARKET DATA & CHARTS",
};

const useSupabase = Boolean(
  process.env.SUPABASE_URL &&
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

let supabasePromise = null;

async function getSupabase() {
  if (!supabasePromise) {
    supabasePromise = import("@supabase/supabase-js").then(
      ({ createClient }) =>
        createClient(
          process.env.SUPABASE_URL,
          process.env.SUPABASE_SERVICE_ROLE_KEY,
          {
            auth: {
              persistSession: false,
            },
          }
        )
    );
  }

  return supabasePromise;
}

function readLocal() {
  if (!fs.existsSync(file)) return [];

  return JSON.parse(
    fs.readFileSync(file, "utf8")
  );
}

function writeLocal(data) {
  fs.mkdirSync(
    path.dirname(file),
    { recursive: true }
  );

  fs.writeFileSync(
    file,
    JSON.stringify(data, null, 2)
  );
}

function slugify(s) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function shape(row) {
  if (!row) return row;

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    category: row.category,
    categoryLabel:
      labels[row.category] || "RESEARCH",
    excerpt: row.excerpt || "",
    content: row.content || "",
    pdfUrl: row.pdf_url || row.pdfUrl || "",
    status: row.status,
    publishedAt:
      row.published_at || row.publishedAt,
    date: row.date,
  };
}

export async function getAllArticles() {
  if (useSupabase) {
    const supabase = await getSupabase();

    const {
      data,
      error,
    } = await supabase
      .from("articles")
      .select("*")
      .order("published_at", {
        ascending: false,
      });

    if (error) throw error;

    return data.map(shape);
  }

  return readLocal()
    .sort((a, b) =>
      (b.publishedAt || "").localeCompare(
        a.publishedAt || ""
      )
    )
    .map(shape);
}

export async function getPublishedArticles() {
  const all = await getAllArticles();

  return all.filter(
    (article) =>
      article.status === "published"
  );
}

export async function getArticle(slug) {
  if (useSupabase) {
    const supabase = await getSupabase();

    const {
      data,
      error,
    } = await supabase
      .from("articles")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();

    if (error) throw error;

    return shape(data);
  }

  return shape(
    readLocal().find(
      (article) =>
        article.slug === slug
    )
  );
}

export async function getArticlesByCategory(slug) {
  const published =
    await getPublishedArticles();

  return published.filter(
    (article) =>
      article.category === slug
  );
}

export function getCategoryLabel(slug) {
  return labels[slug] || "RESEARCH";
}

export async function createArticle(input) {
  const now = new Date();

  const article = {
    id: crypto.randomUUID(),

    slug:
      slugify(input.title) +
      "-" +
      Date.now()
        .toString()
        .slice(-5),

    title: input.title,
    category: input.category,
    excerpt: input.excerpt || "",

    // Kept for compatibility.
    content: input.content || "",

    pdfUrl: input.pdfUrl || "",

    status:
      input.status || "published",

    publishedAt:
      now.toISOString(),

    date:
      new Intl.DateTimeFormat(
        "en",
        {
          year: "numeric",
          month: "long",
          day: "numeric",
        }
      ).format(now),
  };

  if (useSupabase) {
    const supabase =
      await getSupabase();

    const {
      data,
      error,
    } = await supabase
      .from("articles")
      .insert({
        id: article.id,
        slug: article.slug,
        title: article.title,
        category: article.category,
        excerpt: article.excerpt,
        content: article.content,
        pdf_url: article.pdfUrl,
        status: article.status,
        published_at:
          article.publishedAt,
        date: article.date,
      })
      .select()
      .single();

    if (error) throw error;

    return shape(data);
  }

  const data = readLocal();

  data.push({
    ...article,
    categoryLabel:
      labels[article.category] ||
      "RESEARCH",
  });

  writeLocal(data);

  return article;
}

export async function updateArticle(input) {
  if (useSupabase) {
    const supabase =
      await getSupabase();

    const {
      data: current,
      error: findErr,
    } = await supabase
      .from("articles")
      .select("*")
      .eq("id", input.id)
      .maybeSingle();

    if (findErr) throw findErr;

    if (!current) return null;

    const patch = {
      title: input.title,
      category: input.category,
      excerpt: input.excerpt || "",
      content: input.content || "",
      status:
        input.status || "published",
    };

    // Only replace PDF URL when a new
    // PDF was actually supplied.
    if (
      input.pdfUrl !== undefined &&
      input.pdfUrl !== null
    ) {
      patch.pdf_url =
        input.pdfUrl;
    }

    if (
      current.status !== "published" &&
      patch.status === "published"
    ) {
      const now = new Date();

      patch.published_at =
        now.toISOString();

      patch.date =
        new Intl.DateTimeFormat(
          "en",
          {
            year: "numeric",
            month: "long",
            day: "numeric",
          }
        ).format(now);
    }

    const {
      data,
      error,
    } = await supabase
      .from("articles")
      .update(patch)
      .eq("id", input.id)
      .select()
      .single();

    if (error) throw error;

    return shape(data);
  }

  const data = readLocal();

  const index =
    data.findIndex(
      (article) =>
        article.id === input.id
    );

  if (index === -1) return null;

  const current = data[index];

  const updated = {
    ...current,

    title: input.title,
    category: input.category,

    categoryLabel:
      labels[input.category] ||
      "RESEARCH",

    excerpt:
      input.excerpt || "",

    content:
      input.content || "",

    status:
      input.status || "published",
  };

  if (
    input.pdfUrl !== undefined &&
    input.pdfUrl !== null
  ) {
    updated.pdfUrl =
      input.pdfUrl;
  }

  if (
    current.status !== "published" &&
    updated.status === "published"
  ) {
    const now = new Date();

    updated.publishedAt =
      now.toISOString();

    updated.date =
      new Intl.DateTimeFormat(
        "en",
        {
          year: "numeric",
          month: "long",
          day: "numeric",
        }
      ).format(now);
  }

  data[index] = updated;

  writeLocal(data);

  return shape(updated);
}

export async function deleteArticle(id) {
  if (useSupabase) {
    const supabase =
      await getSupabase();

    const {
      error,
      count,
    } = await supabase
      .from("articles")
      .delete({
        count: "exact",
      })
      .eq("id", id);

    if (error) throw error;

    return (count || 0) > 0;
  }

  const data = readLocal();

  const index =
    data.findIndex(
      (article) =>
        article.id === id
    );

  if (index === -1) return false;

  data.splice(index, 1);

  writeLocal(data);

  return true;
}