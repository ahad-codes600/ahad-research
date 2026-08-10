import "./globals.css";

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Ahad Research — Global Financial & Macroeconomic Analysis",
    template: "%s | Ahad Research",
  },
  description:
    "Independent financial and macroeconomic research covering gold, precious metals, monetary policy, inflation, market positioning and geopolitical market intelligence.",
  applicationName: "Ahad Research",
  authors: [{ name: "Ahad Research" }],
  creator: "Ahad Research",
  publisher: "Ahad Research",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "Ahad Research",
    title: "Ahad Research — Global Financial & Macroeconomic Analysis",
    description: "Independent research on gold, macroeconomics, monetary policy, market positioning and global markets.",
    url: siteUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: "Ahad Research — Global Financial & Macroeconomic Analysis",
    description: "Independent financial and macroeconomic research.",
  },
  robots: { index: true, follow: true },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || undefined,
    other: process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION ? { "msvalidate.01": process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION } : undefined,
  },
};

export default function RootLayout({ children }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "Organization", name: "Ahad Research", url: siteUrl },
      { "@type": "WebSite", name: "Ahad Research", url: siteUrl, description: "Independent financial and macroeconomic research." },
    ],
  };
  return (
    <html lang="en">
      <body>
        {children}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </body>
    </html>
  );
}
