import { getArticles, getFeaturedArticles, getPopularArticles } from "@/lib/api";
import { SITE_NAME, SITE_URL } from "@/lib/constants";
import FeaturedArticle from "@/components/FeaturedArticle";
import ArticleGrid from "@/components/ArticleGrid";
import Sidebar from "@/components/Sidebar";
import AnimateIn from "@/components/AnimateIn";
import {
  FeaturedSkeleton,
  ArticleCardSkeleton,
} from "@/components/SkeletonLoader";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [{ articles, total }, featuredArticles, popularArticles] =
    await Promise.all([getArticles(11), getFeaturedArticles(), getPopularArticles()]);

  // Use the first featured-flagged article for the hero, or fall back to latest
  const featured = featuredArticles[0] || articles[0];
  const featuredId = featured?._id;
  const latest = articles.filter((a) => a._id !== featuredId).slice(0, 10);

  // JSON-LD structured data for the homepage
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    description:
      "Your daily source for the latest technology news, insights, and analysis.",
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_URL}/?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Featured Article - Hero */}
        <section aria-label="Featured article">
          {featured ? (
            <FeaturedArticle article={featured} />
          ) : (
            <FeaturedSkeleton />
          )}
        </section>

        {/* Main Content + Sidebar Layout */}
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Articles Grid */}
          <section className="lg:col-span-2" aria-label="Latest articles">
            <AnimateIn>
              <h2 className="text-2xl font-heading font-bold text-gray-900 mb-6">
                Latest News
              </h2>
            </AnimateIn>

            {latest.length > 0 ? (
              <ArticleGrid initialArticles={latest} total={total} />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <ArticleCardSkeleton key={i} />
                ))}
              </div>
            )}

          </section>

          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <Sidebar articles={articles} popularArticles={popularArticles} />
          </aside>
        </div>

      </div>
    </>
  );
}
