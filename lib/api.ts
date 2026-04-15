import { Article } from "./types";

/**
 * Cleans article content that may contain raw JSON wrappers
 * like {"article": "..."} or similar n8n artifacts.
 */
function cleanContent(content: string): string {
  if (!content) return "";
  let cleaned = content;
  try {
    const parsed = JSON.parse(cleaned);
    if (typeof parsed === "object" && parsed !== null) {
      if (parsed.article) cleaned = parsed.article;
      else if (parsed.content) cleaned = parsed.content;
    }
  } catch {
    // Not valid JSON — strip leading JSON artifacts if present
    cleaned = cleaned
      .replace(/^\s*\{\s*"article"\s*:\s*"?/i, "")
      .replace(/"\s*\}\s*$/, "");
  }
  return cleaned;
}

function cleanArticle(article: Article): Article {
  return {
    ...article,
    content: cleanContent(article.content),
    caption: cleanContent(article.caption),
  };
}

function getBaseUrl(): string {
  // Server-side: use absolute URL
  if (typeof window === "undefined") {
    if (process.env.SITE_URL) return process.env.SITE_URL;
    if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
    return "http://localhost:3000";
  }
  // Client-side: use relative URL
  return "";
}

export async function getArticles(
  limit?: number,
  skip?: number
): Promise<{ articles: Article[]; total: number }> {
  const params = new URLSearchParams();
  if (limit) params.set("limit", String(limit));
  if (skip) params.set("skip", String(skip));

  const res = await fetch(
    `${getBaseUrl()}/api/articles?${params.toString()}`,
    { next: { revalidate: 60 } }
  );
  if (!res.ok) throw new Error("Failed to fetch articles");
  const data = await res.json();

  // Handle both old (array) and new (paginated) response formats
  if (Array.isArray(data)) {
    return { articles: data.map(cleanArticle), total: data.length };
  }
  return {
    articles: data.articles.map(cleanArticle),
    total: data.total,
  };
}

export async function getArticle(slug: string): Promise<Article | null> {
  const res = await fetch(`${getBaseUrl()}/api/articles/${slug}`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) return null;
  const article: Article = await res.json();
  return cleanArticle(article);
}
