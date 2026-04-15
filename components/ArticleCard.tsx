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

export default function ArticleCard({
  article,
  index = 0,
}: {
  article: Article;
  index?: number;
}) {
  const excerpt = stripHtml(article.content || "").slice(0, 150);

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
    >
      <Link
        href={`/article/${article.slug}`}
        className="group block h-full bg-white border border-gray-100 rounded-xl p-6 hover:shadow-lg hover:border-gray-200 transition-all duration-300"
      >
        <div className="flex flex-col h-full">
          <span className="inline-block self-start text-xs font-semibold text-brand-600 bg-brand-50 px-2.5 py-1 rounded-full uppercase tracking-wider">
            {article.category}
          </span>

          <h3 className="mt-3 text-lg font-heading font-semibold text-gray-900 leading-snug line-clamp-2 group-hover:text-brand-600 transition-colors">
            {article.title}
          </h3>

          <p className="mt-2 text-sm text-gray-500 leading-relaxed line-clamp-3 flex-grow">
            {excerpt}...
          </p>

          <div className="mt-4 flex items-center justify-between">
            <time
              dateTime={article.published_at}
              className="text-xs text-gray-400"
            >
              {formatDate(article.published_at)}
            </time>
            <span className="text-xs font-medium text-brand-600 group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-1">
              Read more
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </span>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
