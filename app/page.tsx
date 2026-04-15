import { getArticles } from "@/lib/api";
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
  const { articles, total } = await getArticles(11);
  const featured = articles[0];
  const latest = articles.slice(1);

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
            <Sidebar articles={articles} />
          </aside>
        </div>

      </div>
    </>
  );
}
