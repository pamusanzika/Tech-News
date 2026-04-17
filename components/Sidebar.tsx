"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Article } from "@/lib/types";

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export default function Sidebar({
  articles,
  popularArticles = [],
}: {
  articles: Article[];
  popularArticles?: Article[];
}) {
  // Use admin-selected popular articles if available, otherwise fall back to first 5
  const popular =
    popularArticles.length > 0 ? popularArticles.slice(0, 5) : articles.slice(0, 5);

  return (
    <aside className="space-y-8">
      <div className="sticky top-20">
        {/* Popular Posts */}
        <div className="bg-gray-50 rounded-xl p-6">
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
            Popular Posts
          </h3>
          <div className="space-y-4">
            {popular.map((article, i) => (
              <motion.div
                key={article._id}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
              >
                <Link
                  href={`/article/${article.slug}`}
                  className="group flex gap-3 items-start"
                >
                  <span className="text-2xl font-heading font-bold text-gray-200 group-hover:text-brand-200 transition-colors leading-none mt-0.5">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-800 group-hover:text-brand-600 transition-colors line-clamp-2 leading-snug">
                      {article.title}
                    </h4>
                    <time
                      dateTime={article.published_at}
                      className="text-xs text-gray-400 mt-1 block"
                    >
                      {formatDate(article.published_at)}
                    </time>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}
