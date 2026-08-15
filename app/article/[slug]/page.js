import Link from "next/link";
import SiteHeader from "../../../components/SiteHeader";
import SiteFooter from "../../../components/SiteFooter";
import { getArticle, getPublishedArticles } from "../../../lib/articles";

const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
).replace(/\/$/, "");

export async function generateStaticParams() {
  const articles = await getPublishedArticles();
  return articles.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const article = await getArticle(slug);

  if (!article || article.status !== "published") {
    return {
      title: "Research Not Found",
      robots: { index: false, follow: false },
    };
  }

  const description =
    article.excerpt ||
    `Independent analysis of ${article.categoryLabel.toLowerCase()} from Ahad Research.`;

  return {
    title: article.title,
    description,
    alternates: {
      canonical: `/article/${article.slug}`,
    },
    openGraph: {
      type: "article",
      title: article.title,
      description,
      url: `/article/${article.slug}`,
      publishedTime: article.publishedAt,
      authors: ["Ahad Research"],
      section: article.categoryLabel,
    },
    twitter: {
      card: "summary",
      title: article.title,
      description,
    },
  };
}

function isPdfUrl(content) {
  if (!content || typeof content !== "string") return false;

  return (
    content.includes("/storage/v1/object/public/articles/") &&
    content.toLowerCase().includes(".pdf")
  );
}

function isDirectPdfUrl(content) {
  if (!content || typeof content !== "string") return false;

  return (
    content.trim().toLowerCase().startsWith("http") &&
    content.trim().toLowerCase().includes(".pdf")
  );
}

function articleContentToHtml(content) {
  if (!content) return "";

  if (content.includes("<")) {
    return content;
  }

  return content
    .split(/\n\n+/)
    .map(
      (paragraph) =>
        `<p>${paragraph.replace(/\n/g, "<br />")}</p>`
    )
    .join("");
}

export default async function ArticlePage({ params }) {
  const { slug } = await params;
  const article = await getArticle(slug);

  if (!article || article.status !== "published") {
    return (
      <>
        <SiteHeader />

        <main className="shell page">
          <p className="eyebrow">RESEARCH</p>
          <h1>Research not found.</h1>

          <Link className="text-link" href="/research">
            ← RETURN TO ARCHIVE
          </Link>
        </main>

        <SiteFooter />
      </>
    );
  }

  const articleUrl = `${siteUrl}/article/${article.slug}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.excerpt || undefined,
    datePublished: article.publishedAt,
    dateModified: article.publishedAt,
    author: {
      "@type": "Organization",
      name: "Ahad Research",
      url: siteUrl,
    },
    publisher: {
      "@type": "Organization",
      name: "Ahad Research",
      url: siteUrl,
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": articleUrl,
    },
    articleSection: article.categoryLabel,
  };

  const pdfArticle =
    isPdfUrl(article.content) ||
    isDirectPdfUrl(article.content);

  return (
    <>
      <SiteHeader />

      <main className="shell article-page">
        <p className="eyebrow">{article.categoryLabel}</p>

        <h1>{article.title}</h1>

        {article.excerpt && (
          <p className="article-excerpt">{article.excerpt}</p>
        )}

        <div className="byline">
          AHAD <span>•</span> {article.date}
        </div>

        {pdfArticle ? (
          <section
            className="article-pdf"
            aria-label="Research PDF"
          >
            <iframe
              src={article.content}
              title={article.title}
              style={{
                width: "100%",
                height: "85vh",
                minHeight: "700px",
                border: "1px solid #d9dde3",
                background: "#f5f5f5",
              }}
            />

            <div
              style={{
                marginTop: "14px",
                textAlign: "center",
              }}
            >
              <a
                href={article.content}
                target="_blank"
                rel="noopener noreferrer"
                className="text-link"
              >
                OPEN PDF IN NEW TAB ↗
              </a>
            </div>
          </section>
        ) : (
          <article
            className="article-body"
            dangerouslySetInnerHTML={{
              __html: articleContentToHtml(article.content),
            }}
          />
        )}
      </main>

      <SiteFooter />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd),
        }}
      />
    </>
  );
}