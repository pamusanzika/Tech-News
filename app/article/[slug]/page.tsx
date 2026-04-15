import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getArticle, getArticles } from "@/lib/api";
import { SITE_NAME, SITE_URL } from "@/lib/constants";
import ShareButtons from "@/components/ShareButtons";
import RelatedArticles from "@/components/RelatedArticles";
import AnimateIn from "@/components/AnimateIn";

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);

  if (!article) {
    return { title: "Article Not Found" };
  }

  const description =
    article.caption ||
    article.content?.replace(/<[^>]*>/g, "").slice(0, 160) ||
    "";

  return {
    title: article.title,
    description,
    keywords: [article.category, "tech news", "technology"],
    openGraph: {
      type: "article",
      title: article.title,
      description,
      url: `${SITE_URL}/article/${article.slug}`,
      siteName: SITE_NAME,
      publishedTime: article.published_at,
      section: article.category,
      images: [
        {
          url: "/Og_image.png",
          width: 1200,
          height: 630,
          alt: SITE_NAME,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description,
      images: ["/Og_image.png"],
    },
    alternates: {
      canonical: `${SITE_URL}/article/${article.slug}`,
    },
  };
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function estimateReadTime(html: string): number {
  const text = html.replace(/<[^>]*>/g, "");
  const words = text.split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const [article, { articles: allArticles }] = await Promise.all([
    getArticle(slug),
    getArticles(),
  ]);

  if (!article) notFound();

  const readTime = estimateReadTime(article.content || "");

  // Related articles: same category, excluding current
  const related = allArticles
    .filter((a) => a.slug !== article.slug)
    .slice(0, 3);

  // JSON-LD structured data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.title,
    description:
      article.caption ||
      article.content?.replace(/<[^>]*>/g, "").slice(0, 160),
    datePublished: article.published_at,
    dateModified: article.published_at,
    author: {
      "@type": "Organization",
      name: SITE_NAME,
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${SITE_URL}/article/${article.slug}`,
    },
    articleSection: article.category,
    url: `${SITE_URL}/article/${article.slug}`,
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: SITE_URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: article.category,
        item: `${SITE_URL}/#${article.category.toLowerCase()}`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: article.title,
        item: `${SITE_URL}/article/${article.slug}`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Article Content */}
          <article className="lg:col-span-2">
            <AnimateIn>
              {/* Breadcrumb */}
              <nav aria-label="Breadcrumb" className="mb-6">
                <ol className="flex items-center gap-2 text-sm text-gray-400">
                  <li>
                    <a
                      href="/"
                      className="hover:text-brand-600 transition-colors"
                    >
                      Home
                    </a>
                  </li>
                  <li>
                    <span className="mx-1">/</span>
                  </li>
                  <li>
                    <span className="text-gray-500">{article.category}</span>
                  </li>
                </ol>
              </nav>

              {/* Category Badge */}
              <span className="inline-block text-xs font-semibold text-brand-600 bg-brand-50 px-3 py-1 rounded-full uppercase tracking-wider">
                {article.category}
              </span>

              {/* Title */}
              <h1 className="mt-4 text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-gray-900 leading-tight">
                {article.title}
              </h1>

              {/* Meta Info */}
              <div className="mt-5 flex flex-wrap items-center gap-4 text-sm text-gray-500">
                <time dateTime={article.published_at}>
                  {formatDate(article.published_at)}
                </time>
                <span className="text-gray-300">|</span>
                <span>{readTime} min read</span>
              </div>

              {/* Share Buttons */}
              <div className="mt-6 flex items-center gap-3">
                <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Share
                </span>
                <ShareButtons title={article.title} slug={article.slug} />
              </div>
            </AnimateIn>

            {/* Article Body */}
            <AnimateIn delay={0.15}>
              <div
                className="mt-10 article-content text-lg leading-relaxed"
                dangerouslySetInnerHTML={{ __html: article.content || "" }}
              />
            </AnimateIn>

            {/* Bottom Share */}
            <div className="mt-10 pt-8 border-t border-gray-100">
              <ShareButtons title={article.title} slug={article.slug} />
            </div>

            {/* Related Articles */}
            <RelatedArticles articles={related} />
          </article>

          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <div className="sticky top-20 space-y-8">
              {/* Back to Home */}
              <div className="bg-gray-50 rounded-xl p-6 text-center">
                <p className="text-sm text-gray-500 mb-3">
                  Explore more articles
                </p>
                <a
                  href="/"
                  className="inline-flex items-center gap-2 text-sm font-medium text-brand-600 hover:text-brand-700 transition-colors"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 19l-7-7m0 0l7-7m-7 7h18"
                    />
                  </svg>
                  Back to all articles
                </a>
              </div>
            </div>
          </aside>
        </div>

      </div>
    </>
  );
}
