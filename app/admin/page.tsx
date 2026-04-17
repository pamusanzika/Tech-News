"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Article } from "@/lib/types";
import { CATEGORIES } from "@/lib/constants";

type Tab = "all" | "featured" | "popular";

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "");
}

export default function AdminDashboard() {
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [articles, setArticles] = useState<Article[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [page, setPage] = useState(0);
  const pageSize = 20;

  const showNotification = (message: string, type: "success" | "error") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const fetchArticles = useCallback(async () => {
    setLoading(true);
    try {
      if (activeTab === "featured") {
        const res = await fetch("/api/articles/filter/featured");
        const data = await res.json();
        setArticles(data);
        setTotal(data.length);
      } else if (activeTab === "popular") {
        const res = await fetch("/api/articles/filter/popular");
        const data = await res.json();
        setArticles(data);
        setTotal(data.length);
      } else {
        const res = await fetch(
          `/api/articles?limit=${pageSize}&skip=${page * pageSize}`
        );
        const data = await res.json();
        if (Array.isArray(data)) {
          setArticles(data);
          setTotal(data.length);
        } else {
          setArticles(data.articles);
          setTotal(data.total);
        }
      }
    } catch {
      showNotification("Failed to fetch articles", "error");
    } finally {
      setLoading(false);
    }
  }, [activeTab, page]);

  // Auth check on mount
  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      router.push("/admin/login");
      return;
    }
    fetch("/api/admin/session", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Unauthorized");
        return res.json();
      })
      .then(() => {
        setAuthenticated(true);
        setCheckingAuth(false);
      })
      .catch(() => {
        localStorage.removeItem("admin_token");
        router.push("/admin/login");
      });
  }, [router]);

  useEffect(() => {
    if (!authenticated) return;
    fetchArticles();
  }, [fetchArticles, authenticated]);

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/articles/${id}`, { method: "DELETE" });
      if (res.ok) {
        showNotification("Article deleted successfully", "success");
        setDeleteConfirm(null);
        fetchArticles();
      } else {
        showNotification("Failed to delete article", "error");
      }
    } catch {
      showNotification("Failed to delete article", "error");
    }
  };

  const handleToggleFeatured = async (id: string) => {
    try {
      const res = await fetch(`/api/articles/${id}/featured`, {
        method: "PATCH",
      });
      if (res.ok) {
        const updated = await res.json();
        setArticles((prev) =>
          prev.map((a) =>
            a._id === id ? { ...a, featured: updated.featured } : a
          )
        );
        showNotification(
          updated.featured ? "Article marked as featured" : "Article unfeatured",
          "success"
        );
      }
    } catch {
      showNotification("Failed to update article", "error");
    }
  };

  const handleTogglePopular = async (id: string) => {
    try {
      const res = await fetch(`/api/articles/${id}/popular`, {
        method: "PATCH",
      });
      if (res.ok) {
        const updated = await res.json();
        setArticles((prev) =>
          prev.map((a) =>
            a._id === id ? { ...a, popular: updated.popular } : a
          )
        );
        showNotification(
          updated.popular
            ? "Article marked as popular"
            : "Article removed from popular",
          "success"
        );
      }
    } catch {
      showNotification("Failed to update article", "error");
    }
  };

  const handleEditSave = async () => {
    if (!editingArticle) return;
    try {
      const res = await fetch(`/api/articles/${editingArticle._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editingArticle.title,
          caption: editingArticle.caption,
          category: editingArticle.category,
          source_url: editingArticle.source_url,
        }),
      });
      if (res.ok) {
        showNotification("Article updated successfully", "success");
        setEditingArticle(null);
        fetchArticles();
      } else {
        showNotification("Failed to update article", "error");
      }
    } catch {
      showNotification("Failed to update article", "error");
    }
  };

  const filteredArticles = searchQuery
    ? articles.filter(
        (a) =>
          a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          a.category?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : articles;

  const featuredCount = articles.filter((a) => a.featured).length;
  const popularCount = articles.filter((a) => a.popular).length;

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    router.push("/admin/login");
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-gray-200 border-t-brand-600 rounded-full animate-spin" />
          <p className="mt-3 text-sm text-gray-500">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Notification Toast */}
      {notification && (
        <div
          className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg text-white text-sm font-medium transition-all ${
            notification.type === "success" ? "bg-green-600" : "bg-red-600"
          }`}
        >
          {notification.message}
        </div>
      )}

      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-heading font-bold text-gray-900">
                Admin Dashboard
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Manage articles, featured picks, and popular selections
              </p>
            </div>
            <div className="flex items-center gap-4">
              <a
                href="/"
                className="text-sm text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Site
              </a>
              <button
                onClick={handleLogout}
                className="text-sm text-gray-500 hover:text-red-600 font-medium flex items-center gap-1 px-3 py-1.5 rounded-md hover:bg-red-50 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
            <div className="text-sm font-medium text-gray-500">Total Articles</div>
            <div className="text-3xl font-bold text-gray-900 mt-1">{total}</div>
          </div>
          <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
            <div className="text-sm font-medium text-gray-500">Featured</div>
            <div className="text-3xl font-bold text-brand-600 mt-1">
              {activeTab === "all" ? featuredCount : activeTab === "featured" ? total : "—"}
            </div>
          </div>
          <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
            <div className="text-sm font-medium text-gray-500">Popular</div>
            <div className="text-3xl font-bold text-amber-600 mt-1">
              {activeTab === "all" ? popularCount : activeTab === "popular" ? total : "—"}
            </div>
          </div>
        </div>

        {/* Tabs + Search */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex gap-1 bg-white rounded-lg border border-gray-200 p-1">
            {(["all", "featured", "popular"] as Tab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  setPage(0);
                }}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === tab
                    ? "bg-brand-600 text-white"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                {tab === "all"
                  ? "All Articles"
                  : tab === "featured"
                  ? "Featured"
                  : "Popular"}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-72">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Articles Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-gray-500">
              <div className="inline-block w-8 h-8 border-4 border-gray-200 border-t-brand-600 rounded-full animate-spin" />
              <p className="mt-3 text-sm">Loading articles...</p>
            </div>
          ) : filteredArticles.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <p className="text-sm">No articles found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">
                      Article
                    </th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">
                      Category
                    </th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">
                      Date
                    </th>
                    <th className="text-center text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">
                      Featured
                    </th>
                    <th className="text-center text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">
                      Popular
                    </th>
                    <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredArticles.map((article) => (
                    <tr
                      key={article._id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="max-w-md">
                          <a
                            href={`/article/${article.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-medium text-gray-900 hover:text-brand-600 line-clamp-2"
                          >
                            {article.title}
                          </a>
                          {article.caption && (
                            <p className="text-xs text-gray-400 mt-1 line-clamp-1">
                              {stripHtml(article.caption)}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="inline-block text-xs font-medium bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full">
                          {article.category}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-500 whitespace-nowrap">
                        {formatDate(article.published_at)}
                      </td>
                      <td className="px-4 py-4 text-center">
                        <button
                          onClick={() => handleToggleFeatured(article._id)}
                          className={`inline-flex items-center justify-center w-8 h-8 rounded-full transition-colors ${
                            article.featured
                              ? "bg-brand-100 text-brand-600"
                              : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                          }`}
                          title={article.featured ? "Remove from featured" : "Mark as featured"}
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                          </svg>
                        </button>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <button
                          onClick={() => handleTogglePopular(article._id)}
                          className={`inline-flex items-center justify-center w-8 h-8 rounded-full transition-colors ${
                            article.popular
                              ? "bg-amber-100 text-amber-600"
                              : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                          }`}
                          title={article.popular ? "Remove from popular" : "Mark as popular"}
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12.1 18.55l-.1.1-.11-.1C7.14 14.24 4 11.39 4 8.5 4 6.5 5.5 5 7.5 5c1.54 0 3.04.99 3.57 2.36h1.86C13.46 5.99 14.96 5 16.5 5 18.5 5 20 6.5 20 8.5c0 2.89-3.14 5.74-7.9 10.05z" />
                          </svg>
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setEditingArticle({ ...article })}
                            className="text-sm text-gray-500 hover:text-brand-600 font-medium px-3 py-1.5 rounded-md hover:bg-brand-50 transition-colors"
                          >
                            Edit
                          </button>
                          {deleteConfirm === article._id ? (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleDelete(article._id)}
                                className="text-xs text-white bg-red-600 hover:bg-red-700 font-medium px-3 py-1.5 rounded-md transition-colors"
                              >
                                Confirm
                              </button>
                              <button
                                onClick={() => setDeleteConfirm(null)}
                                className="text-xs text-gray-500 hover:text-gray-700 font-medium px-2 py-1.5 rounded-md transition-colors"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setDeleteConfirm(article._id)}
                              className="text-sm text-gray-500 hover:text-red-600 font-medium px-3 py-1.5 rounded-md hover:bg-red-50 transition-colors"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {activeTab === "all" && total > pageSize && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
              <p className="text-sm text-gray-500">
                Showing {page * pageSize + 1}–
                {Math.min((page + 1) * pageSize, total)} of {total}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="px-3 py-1.5 text-sm font-medium rounded-md border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={(page + 1) * pageSize >= total}
                  className="px-3 py-1.5 text-sm font-medium rounded-md border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Edit Modal */}
      {editingArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-heading font-bold text-gray-900">
                Edit Article
              </h2>
              <button
                onClick={() => setEditingArticle(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={editingArticle.title}
                  onChange={(e) =>
                    setEditingArticle({ ...editingArticle, title: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Caption
                </label>
                <textarea
                  value={editingArticle.caption || ""}
                  onChange={(e) =>
                    setEditingArticle({
                      ...editingArticle,
                      caption: e.target.value,
                    })
                  }
                  rows={3}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={editingArticle.category}
                  onChange={(e) =>
                    setEditingArticle({
                      ...editingArticle,
                      category: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Source URL
                </label>
                <input
                  type="url"
                  value={editingArticle.source_url || ""}
                  onChange={(e) =>
                    setEditingArticle({
                      ...editingArticle,
                      source_url: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200">
              <button
                onClick={() => setEditingArticle(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleEditSave}
                className="px-4 py-2 text-sm font-medium text-white bg-brand-600 rounded-lg hover:bg-brand-700 transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
