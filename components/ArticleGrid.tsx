"use client";

import { useState } from "react";
import { Article } from "@/lib/types";
import ArticleCard from "./ArticleCard";

const LOAD_MORE_COUNT = 4;

export default function ArticleGrid({
  initialArticles,
  total,
}: {
  initialArticles: Article[];
  total: number;
}) {
  const [articles, setArticles] = useState(initialArticles);
  const [loading, setLoading] = useState(false);

  const hasMore = articles.length < total - 1; // -1 for featured article

  async function loadMore() {
    setLoading(true);
    try {
      const skip = articles.length + 1; // +1 to account for featured
      const res = await fetch(
        `/api/articles?limit=${LOAD_MORE_COUNT}&skip=${skip}`
      );
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      const newArticles = Array.isArray(data) ? data : data.articles;
      setArticles((prev) => [...prev, ...newArticles]);
    } catch (err) {
      console.error("Failed to load more articles:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {articles.map((article, i) => (
          <ArticleCard key={article._id} article={article} index={i} />
        ))}
      </div>

      {hasMore && (
        <div className="mt-8 flex justify-center">
          <button
            onClick={loadMore}
            disabled={loading}
            style={{ borderRadius: "44px" }}
            className="px-6 py-3 bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Loading..." : "Load More"}
          </button>
        </div>
      )}
    </>
  );
}
