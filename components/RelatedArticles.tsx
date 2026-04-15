"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Article } from "@/lib/types";

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "");
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function RelatedArticles({
  articles,
}: {
  articles: Article[];
}) {
  if (articles.length === 0) return null;

  return (
    <section className="mt-12 pt-10 border-t border-gray-100">
      <h2 className="text-xl font-heading font-bold text-gray-900 mb-6">
        Related Articles
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.map((article, i) => (
          <motion.article
            key={article._id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.08 }}
          >
            <Link
              href={`/article/${article.slug}`}
              className="group block bg-gray-50 rounded-xl p-5 hover:bg-white hover:shadow-md transition-all duration-300"
            >
              <span className="text-xs font-semibold text-brand-600 uppercase tracking-wider">
                {article.category}
              </span>
              <h3 className="mt-2 text-sm font-semibold text-gray-900 group-hover:text-brand-600 transition-colors line-clamp-2 leading-snug">
                {article.title}
              </h3>
              <p className="mt-2 text-xs text-gray-500 line-clamp-2">
                {stripHtml(article.content || "").slice(0, 100)}...
              </p>
              <time
                dateTime={article.published_at}
                className="mt-3 text-xs text-gray-400 block"
              >
                {formatDate(article.published_at)}
              </time>
            </Link>
          </motion.article>
        ))}
      </div>
    </section>
  );
}
