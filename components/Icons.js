// Minimal inline stroke-icon set — avoids pulling in an icon package for a
// handful of nav glyphs. Each icon is 16x16, currentColor stroke.
const paths = {
  chart: "M2 13.5V9M6 13.5V6M10 13.5V3M14 13.5V7.5",
  file: "M3 1.5h6l4 4v9a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1v-12a1 1 0 0 1 1-1ZM9 1.5V5.5h4",
  grid: "M2 2h5v5H2zM9 2h5v5H9zM2 9h5v5H2zM9 9h5v5H9z",
  lock: "M4 7V4.5a4 4 0 0 1 8 0V7M3 7h10v7H3z",
  user: "M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM2.5 14a5.5 5.5 0 0 1 11 0",
  bricks: "M1.5 4h5v3h-5zM7.5 4h7v3h-7zM1.5 8.5h4v3h-4zM6.5 8.5h5v3h-5zM12.5 8.5h2v3h-2zM1.5 13h13",
  bank: "M8 1.5 14.5 5H1.5L8 1.5ZM2.5 6.5v6M6 6.5v6M10 6.5v6M13.5 6.5v6M1.5 14.5h13",
  positioning: "M4 12.5V6M4 6l-2 2M4 6l2 2M12 3.5V10M12 10l-2-2M12 10l2-2",
  globe: "M8 14A6 6 0 1 0 8 2a6 6 0 0 0 0 12ZM2 8h12M8 2c1.7 1.7 2.6 3.8 2.6 6S9.7 12.3 8 14M8 2C6.3 3.7 5.4 5.8 5.4 8s.9 4.3 2.6 6",
  indicators: "M2 8.5 5.5 5l3 3L14 2.5",
  candles: "M4 3v10M4 5.5h0M2.5 6.5h3v4h-3zM10 1.5v13M10 4h0M8.5 5h3v6h-3z",
};

export default function Icon({ name, size = 14 }) {
  const d = paths[name];
  if (!d) return null;
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={d} />
    </svg>
  );
}
