import Link from "next/link";
import SiteHeader from "../../../components/SiteHeader";
import SiteFooter from "../../../components/SiteFooter";
import { getArticle, getPublishedArticles } from "../../../lib/articles";

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");

export async function generateStaticParams() {
  const articles = await getPublishedArticles();
  return articles.map(article => ({ slug: article.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article || article.status !== "published") return { title: "Research Not Found", robots: { index: false, follow: false } };
  const description = article.excerpt || `Independent analysis of ${article.categoryLabel.toLowerCase()} from Ahad Research.`;
  return {
    title: article.title,
    description,
    alternates: { canonical: `/article/${article.slug}` },
    openGraph: { type: "article", title: article.title, description, url: `/article/${article.slug}`, publishedTime: article.publishedAt, authors: ["Ahad Research"], section: article.categoryLabel },
    twitter: { card: "summary", title: article.title, description },
  };
}

export default async function ArticlePage({ params }) {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article || article.status !== "published") {
    return <><SiteHeader/><main className="shell page"><p className="eyebrow">RESEARCH</p><h1>Research not found.</h1><Link className="text-link" href="/research">← RETURN TO ARCHIVE</Link></main><SiteFooter/></>;
  }
  const articleUrl = `${siteUrl}/article/${article.slug}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.excerpt || undefined,
    datePublished: article.publishedAt,
    dateModified: article.publishedAt,
    author: { "@type": "Organization", name: "Ahad Research", url: siteUrl },
    publisher: { "@type": "Organization", name: "Ahad Research", url: siteUrl },
    mainEntityOfPage: { "@type": "WebPage", "@id": articleUrl },
    articleSection: article.categoryLabel,
  };
  return <>
    <SiteHeader/>
    <main className="shell article-page">
      <p className="eyebrow">{article.categoryLabel}</p>
      <h1>{article.title}</h1>
      <p className="article-excerpt">{article.excerpt}</p>
      <div className="byline">AHAD <span>•</span> {article.date}</div>
      <article className="article-body" dangerouslySetInnerHTML={{__html: article.content.includes("<") ? article.content : article.content.split(/\n\n+/).map(p=>`<p>${p.replace(/\n/g,"<br />")}</p>`).join("")}} />
    </main>
    <SiteFooter/>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
  </>;
}
