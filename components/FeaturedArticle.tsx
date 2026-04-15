"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Article } from "@/lib/types";

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "");
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default function FeaturedArticle({ article }: { article: Article }) {
  const excerpt = stripHtml(article.content || "").slice(0, 280);

  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative"
    >
      <Link
        href={`/article/${article.slug}`}
        className="group block bg-gradient-to-br from-brand-600 to-brand-800 rounded-2xl p-8 md:p-12 text-white hover:shadow-2xl transition-shadow duration-300 no-underline"
      >
        <div className="flex items-center justify-between gap-8">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-xs font-semibold bg-white/20 px-3 py-1 rounded-full uppercase tracking-wider">
                Featured
              </span>
              <span className="text-xs font-medium bg-white/10 px-3 py-1 rounded-full uppercase tracking-wider">
                {article.category}
              </span>
            </div>

            <h2 className="text-2xl md:text-4xl font-heading font-bold leading-tight mb-4">
              {article.title}
            </h2>

            <p className="text-white/80 text-base md:text-lg leading-relaxed mb-6">
              {excerpt}...
            </p>

            <div className="flex items-center gap-4">
              <time
                dateTime={article.published_at}
                className="text-sm text-white/60"
              >
                {formatDate(article.published_at)}
              </time>
              <span className="text-sm font-medium text-white/90 inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                Read full article
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
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              </span>
            </div>
          </div>

          <div className="hidden md:block flex-shrink-0">
            <Image
              src="/Hero_image.svg"
              alt="Alpha Tech Logo"
              width={400}
              height={400}
              className="opacity-80"
            />
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
