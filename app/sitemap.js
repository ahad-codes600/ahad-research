import { getPublishedArticles } from "../lib/articles";

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");

export default async function sitemap() {
  const now = new Date();
  const articles = await getPublishedArticles();
  const staticPages = [
    ["/", "weekly", 1],
    ["/research", "weekly", 0.9],
    ["/about", "monthly", 0.6],
    ["/dashboard", "daily", 0.8],
    ["/charts", "daily", 0.8],
    ["/positioning", "weekly", 0.8],
  ];
  const categories = ["precious-metals","macro","monetary-policy","positioning","geopolitics","economic-indicators","market-data"];
  return [
    ...staticPages.map(([path, changeFrequency, priority]) => ({ url: `${siteUrl}${path}`, lastModified: now, changeFrequency, priority })),
    ...categories.map(slug => ({ url: `${siteUrl}/category/${slug}`, lastModified: now, changeFrequency: "weekly", priority: 0.7 })),
    ...articles.map(article => ({ url: `${siteUrl}/article/${article.slug}`, lastModified: new Date(article.publishedAt), changeFrequency: "monthly", priority: 0.8 })),
  ];
}
