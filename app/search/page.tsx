import { getArticles } from "@/lib/api";
import ArticleCard from "@/components/ArticleCard";
import { Article } from "@/lib/types";

export const dynamic = "force-dynamic";

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "");
}

function matches(article: Article, q: string): boolean {
  const needle = q.toLowerCase();
  return (
    article.title?.toLowerCase().includes(needle) ||
    article.category?.toLowerCase().includes(needle) ||
    stripHtml(article.caption || "").toLowerCase().includes(needle) ||
    stripHtml(article.content || "").toLowerCase().includes(needle)
  );
}

export const metadata = {
  title: "Search",
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const query = q.trim();

  let results: Article[] = [];
  if (query) {
    const { articles } = await getArticles(200);
    results = articles.filter((a) => matches(a, query));
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-heading font-bold text-gray-900">
        {query ? (
          <>
            Search results for{" "}
            <span className="text-brand-600">&ldquo;{query}&rdquo;</span>
          </>
        ) : (
          "Search"
        )}
      </h1>

      {query && (
        <p className="mt-2 text-sm text-gray-500">
          {results.length} {results.length === 1 ? "article" : "articles"} found
        </p>
      )}

      <div className="mt-8">
        {!query ? (
          <p className="text-gray-500">
            Enter a search term in the navigation bar to find articles.
          </p>
        ) : results.length === 0 ? (
          <p className="text-gray-500">
            No articles matched your search. Try different keywords.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.map((article, i) => (
              <ArticleCard key={article._id} article={article} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
