export const SITE_NAME = "AlphaTech Wire";
export const SITE_DESCRIPTION =
  "Your daily source for the latest technology news, insights, and analysis. Stay ahead with AlphaTech Wire.";
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.SITE_URL ||
  "https://tech-news-sepia.vercel.app";

export const CATEGORIES = [
  "Technology",
  "AI",
  "Startups",
  "Cybersecurity",
  "Gadgets",
  "Software",
] as const;

export const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Technology", href: "/#technology" },
  { label: "AI", href: "/#ai" },
  { label: "Startups", href: "/#startups" },
] as const;
