import Link from "next/link";
import Icon from "./Icons";

export const categories = [
  ["precious-metals", "PRECIOUS METALS & COMMODITIES", "bricks"],
  ["macro", "MACROECONOMIC ANALYSIS", "globe"],
  ["monetary-policy", "MONETARY POLICY", "bank"],
  ["positioning", "POSITIONING & COT", "positioning"],
  ["geopolitics", "GEOPOLITICAL MARKET INTELLIGENCE", "globe"],
  ["economic-indicators", "ECONOMIC INDICATORS", "indicators"],
  ["market-data", "MARKET DATA & CHARTS", "candles"],
];

export default function SiteHeader(){
  return <header className="site-header">
    <div className="topbar">
      <Link href="/" className="brand">
        <span className="brand-mark">AR</span>
        <span><strong>AHAD RESEARCH</strong><small>GLOBAL FINANCIAL & MACROECONOMIC ANALYSIS</small></span>
      </Link>
      <nav className="main-nav" aria-label="Primary navigation">
        <Link href="/"><Icon name="chart" />Latest Research</Link>
        <Link href="/research"><Icon name="file" />Research Archive</Link>
        <Link href="/dashboard"><Icon name="grid" />Market Dashboard</Link>
        <Link href="/charts"><Icon name="candles" />Charts</Link>
        <Link href="/positioning"><Icon name="positioning" />COT</Link>
        <Link href="/about"><Icon name="user" />About</Link>
        <Link href="/admin"><Icon name="lock" />Admin</Link>
      </nav>
    </div>
    <nav className="category-nav" aria-label="Research categories">
      {categories.map(([slug,label,icon])=><Link key={slug} href={`/category/${slug}`}><Icon name={icon} />{label}</Link>)}
    </nav>
  </header>
}
