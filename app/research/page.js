export const metadata = {
  title: "Research Archive",
  description: "Browse weekly financial and macroeconomic research across gold, monetary policy, positioning, geopolitics and market data.",
  alternates: { canonical: "/research" },
};

import Link from "next/link";
import { getPublishedArticles } from "../../lib/articles";
import SiteHeader from "../../components/SiteHeader";
import SiteFooter from "../../components/SiteFooter";

const filters = [
  ["all", "ALL RESEARCH"], ["precious-metals", "PRECIOUS METALS"], ["macro", "MACRO"],
  ["monetary-policy", "MONETARY POLICY"], ["positioning", "POSITIONING"], ["geopolitics", "GEOPOLITICS"],
];

export default async function ResearchArchive({ searchParams }) {
  const articles = await getPublishedArticles();
  const params = await searchParams;
  const selected = params?.category || "all";
  const visible = selected === "all" ? articles : articles.filter((a) => a.category === selected);
  return <>
    <SiteHeader />
    <main className="archive-page">
      <section className="archive-hero"><div className="archive-hero-grid"/><div className="archive-hero-inner"><span className="section-kicker light">RESEARCH ARCHIVE</span><h1>A searchable record of financial analysis.</h1><p>Weekly research across precious metals, macroeconomic policy, market positioning and global events—with the underlying evidence kept organized for future reference.</p></div></section>
      <section className="archive-body">
        <div className="archive-stats"><div><strong>{articles.length}</strong><span>PUBLISHED STUDIES</span></div><div><strong>{new Set(articles.map(a=>a.category)).size}</strong><span>RESEARCH DOMAINS</span></div><div><strong>WEEKLY</strong><span>PUBLICATION CADENCE</span></div><Link href="/search">SEARCH FULL ARCHIVE →</Link></div>
        <div className="archive-filters">{filters.map(([key,label])=><Link key={key} href={key === "all" ? "/research" : `/research?category=${key}`} className={selected===key?"active":""}>{label}</Link>)}</div>
        <div className="archive-list">
          {visible.length ? visible.map((a) => <Link href={`/article/${a.slug}`} className="archive-item" key={a.slug}><div><span className="tag">{a.categoryLabel}</span><h2>{a.title}</h2><p>{a.excerpt}</p><span className="read-link">READ ANALYSIS →</span></div><span className="byline">{a.date}</span></Link>) : <div className="archive-empty"><strong>NO RESEARCH IN THIS CATEGORY YET.</strong><p>Publish the first study from the admin panel.</p></div>}
        </div>
      </section>
    </main>
    <SiteFooter />
  </>;
}
