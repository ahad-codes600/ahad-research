export const CATEGORY_VISUALS = {
  "precious-metals": {
    eyebrow: "COMMODITIES",
    title: "PRECIOUS METALS & COMMODITIES",
    description: "Gold, silver, energy and commodity markets examined through macroeconomic and market-structure lenses.",
    image: "https://images.unsplash.com/photo-1610375461246-83df859d849d?auto=format&fit=crop&w=1800&q=85"
  },
  "macro": {
    eyebrow: "GLOBAL ECONOMY",
    title: "MACROECONOMIC ANALYSIS",
    description: "Growth, inflation, liquidity, employment and the forces shaping global capital markets.",
    image: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=1800&q=85"
  },
  "monetary-policy": {
    eyebrow: "CENTRAL BANKS",
    title: "MONETARY POLICY",
    description: "Interest rates, central-bank decisions, liquidity conditions and monetary transmission.",
    image: "https://images.unsplash.com/photo-1559526324-593bc073d938?auto=format&fit=crop&w=1800&q=85"
  },
  "positioning": {
    eyebrow: "MARKET POSITIONING",
    title: "POSITIONING & COT",
    description: "Institutional positioning, futures commitments and the flow of speculative capital.",
    image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1800&q=85"
  },
  "geopolitics": {
    eyebrow: "GLOBAL RISK",
    title: "GEOPOLITICAL MARKET INTELLIGENCE",
    description: "Geopolitical developments assessed through their implications for commodities, currencies and risk assets.",
    image: "https://images.unsplash.com/photo-1521292270410-a8c4d716d518?auto=format&fit=crop&w=1800&q=85"
  },
  "economic-indicators": {
    eyebrow: "ECONOMIC DATA",
    title: "ECONOMIC INDICATORS",
    description: "CPI, PCE, employment, GDP and other indicators used to map the global economic cycle.",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1800&q=85"
  },
  "market-data": {
    eyebrow: "MARKET INTELLIGENCE",
    title: "MARKET DATA & CHARTS",
    description: "Market prices, technical context, cross-asset relationships and quantitative visualisation.",
    image: "https://images.unsplash.com/photo-1642790106117-e829e14a795f?auto=format&fit=crop&w=1800&q=85"
  }
};

export function getCategoryVisual(slug) {
  return CATEGORY_VISUALS[slug] || CATEGORY_VISUALS["macro"];
}
