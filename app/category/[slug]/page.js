import Link from "next/link";
import SiteHeader from "../../../components/SiteHeader";
import SiteFooter from "../../../components/SiteFooter";
import { getArticlesByCategory, getCategoryLabel } from "../../../lib/articles";
import { getCategoryVisual } from "../../../lib/categoryVisuals";

export async function generateMetadata({params}){
  const {slug}=await params;
  const visual=getCategoryVisual(slug);
  const label=getCategoryLabel(slug);
  return {
    title: `${label} Research`,
    description: visual.description,
    alternates: { canonical: `/category/${slug}` },
  };
}

export default async function CategoryPage({params}){
  const {slug}=await params;
  const visual=getCategoryVisual(slug);
  const articles=await getArticlesByCategory(slug);
  return <div className="category-page"><SiteHeader/>
    <section className="category-hero">
      <div className="category-hero-media" style={{backgroundImage:`url(${visual.image})`}}/>
      <div className="category-hero-overlay"/>
      <div className="category-hero-content"><span className="category-eyebrow">{visual.eyebrow}</span><h1>{visual.title}</h1><p>{visual.description}</p></div>
    </section>
    <section className="category-content">
      <div className="category-toolbar"><div><span className="section-kicker">RESEARCH ARCHIVE</span><h2>Latest work in {visual.title}</h2></div><span className="result-count">{articles.length} {articles.length===1?"ARTICLE":"ARTICLES"}</span></div>
      {articles.length ? <div className="search-results-grid">{articles.map(a=><Link key={a.slug} href={`/article/${a.slug}`} className="search-result-card"><div className="search-result-meta"><span>{a.categoryLabel}</span><span>{a.date}</span></div><h3>{a.title}</h3><p>{a.excerpt}</p><span className="read-link">READ ANALYSIS →</span></Link>)}</div> : <div className="search-empty"><span>NO PUBLISHED RESEARCH YET</span><p>New analysis in this category will appear here.</p></div>}
    </section><SiteFooter/></div>
}
