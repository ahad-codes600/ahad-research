export const metadata = {
  title: "Financial & Macroeconomic Research",
  description: "Weekly independent research on gold, macroeconomics, monetary policy, market positioning and geopolitical market intelligence.",
  alternates: { canonical: "/" },
};

import Link from "next/link";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";
import Icon from "../components/Icons";
import { getPublishedArticles } from "../lib/articles";
import { getIndicators } from "../lib/market";

function fmt(value, decimals = 2) {
  if (value == null || Number.isNaN(value)) return "—";
  return value.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

async function TickerStrip() {
  let indicators = [];
  try {
    ({ indicators } = await getIndicators());
  } catch {
    indicators = [];
  }
  const pick = (key) => indicators.find((i) => i.key === key);
  const stats = [
    { key: "gold", label: "GOLD (XAUUSD)", initial: "AU" },
    { key: "dxy", label: "DXY INDEX", initial: "$" },
    { key: "spx", label: "S&P 500", initial: "500" },
    { key: "us10y", label: "US 10Y YIELD", initial: "%" },
  ];
  return (
    <div className="ticker-strip">
      <div className="ticker-inner shell">
        {stats.map((s) => {
          const d = pick(s.key);
          const up = d?.change != null ? d.change >= 0 : null;
          return (
            <div className="ticker-stat" key={s.key}>
              <span className="ticker-icon" style={{ background: "var(--navy-700)", color: "var(--gold)" }}>{s.initial}</span>
              <div>
                <div className="ticker-label">{s.label}</div>
                <div>
                  <span className="ticker-value">{d?.value != null ? fmt(d.value, s.key === "us10y" ? 2 : 2) : "—"}</span>
                  {up != null && (
                    <span className={`ticker-change ${up ? "up" : "down"}`}>
                      {up ? "+" : ""}
                      {fmt(d.change, 2)} ({up ? "+" : ""}
                      {fmt(d.pct, 2)}%)
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        <Link href="/dashboard" className="ticker-dashboard-link">
          <Icon name="grid" size={16} />
          <span>VIEW DASHBOARD<small>Real-time Macro Overview</small></span>
        </Link>
      </div>
    </div>
  );
}

export default async function Home() {
  const articles = await getPublishedArticles();
  const featured = articles[0];
  const rest = articles.slice(1);

  return (
    <div className="home-theme">
      <SiteHeader />

      <main>
        <section className="hero shell hero-upgraded">
          <div className="hero-copy">
            <span className="hero-orbit orbit-one"/><span className="hero-orbit orbit-two"/>
            <p className="eyebrow">INDEPENDENT FINANCIAL RESEARCH</p>
            <h1>Understanding the forces behind global markets.</h1>
            <p className="hero-lede">
              Independent research examining precious metals, macroeconomic
              developments, monetary policy, market positioning and geopolitical
              events through their impact on financial markets.
            </p>
            <div className="hero-meta">WEEKLY RESEARCH <span>•</span> GOLD & MACRO FOCUS</div>
            <div className="hero-actions"><Link href="/dashboard" className="hero-button">OPEN MARKET DASHBOARD →</Link><Link href="/search" className="hero-secondary">SEARCH RESEARCH</Link></div>
          </div>
          <aside className="focus-panel">
            <p className="eyebrow light">RESEARCH FOCUS</p>
            <div><span>Gold / XAUUSD</span><b className="primary">PRIMARY</b></div>
            <div><span>Macroeconomic Policy</span><b className="core">CORE</b></div>
            <div><span>Global Events</span><b className="core">CORE</b></div>
            <div><span>Market Positioning</span><b className="core">CORE</b></div>
          </aside>
        </section>

        <TickerStrip />

        <section className="shell section" id="latest">
          <div className="section-head">
            <div>
              <p className="eyebrow">RESEARCH ARCHIVE</p>
              <h2>Latest Analysis</h2>
            </div>
            <Link href="/research" className="text-link">VIEW ARCHIVE →</Link>
          </div>

          {featured ? (
            <div className="lead-layout">
              <Link href={`/article/${featured.slug}`} className="featured-story">
                <div>
                  <span className="tag">{featured.categoryLabel}</span>
                  <h3>{featured.title}</h3>
                  <p>{featured.excerpt}</p>
                </div>
                <div className="byline">AHAD <span>•</span> {featured.date}</div>
              </Link>
              <div className="side-stories">
                {rest.slice(0, 2).map((article) => (
                  <Link key={article.slug} href={`/article/${article.slug}`} className="side-story">
                    <span className="tag">{article.categoryLabel}</span>
                    <h3>{article.title}</h3>
                    <div className="byline">AHAD <span>•</span> {article.date}</div>
                  </Link>
                ))}
              </div>
            </div>
          ) : (
            <div className="empty">No published research yet.</div>
          )}

          <div className="article-grid">
            {rest.slice(2).map((article) => (
              <Link key={article.slug} href={`/article/${article.slug}`} className="article-card">
                <span className="tag">{article.categoryLabel}</span>
                <h3>{article.title}</h3>
                <p>{article.excerpt}</p>
                <span className="read-link">READ ANALYSIS →</span>
              </Link>
            ))}
          </div>
        </section>

        <section className="dark-section">
          <div className="shell section">
            <div className="section-head dark">
              <div>
                <p className="eyebrow light">MARKET INTELLIGENCE</p>
                <h2>Data & Analytical Tools</h2>
              </div>
            </div>
            <div className="tool-grid">
              <Link href="/dashboard" className="tool-card-link"><div><Icon name="grid" size={22} /><h3>Live Macro Dashboard</h3><p>Gold, DXY, yields, inflation, policy and labour indicators.</p></div></Link>
              <Link href="/charts" className="tool-card-link"><div><Icon name="candles" size={22} /><h3>Market Charts</h3><p>Interactive price, yield, dollar and macroeconomic history.</p><span className="tool-action">OPEN CHARTS →</span></div></Link>
              <Link href="/positioning" className="tool-card-link"><div><Icon name="positioning" size={22} /><h3>Positioning & COT</h3><p>Weekly gold futures positioning, net exposure and report history.</p><span className="tool-action">OPEN POSITIONING →</span></div></Link>
              <Link href="/research" className="tool-card-link"><div><Icon name="file" size={22} /><h3>Research Archive</h3><p>Published analysis organized as a searchable research record.</p><span className="tool-action">OPEN ARCHIVE →</span></div></Link>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
