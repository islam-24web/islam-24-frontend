"use client";

/**
 * SidebarTabs — الأكثر قراءة  |  مواضيع شائعة
 *
 * Two-tab sidebar widget.
 * - "الأكثر قراءة"   → mostRead articles (latest, sorted by date)
 * - "مواضيع شائعة"  → popular articles (sorted by homepage_priority)
 */

import { useState } from "react";
import Link from "next/link";
import type { Article } from "@/types/strapi";

interface Props {
  mostRead: Article[];
  popular: Article[];
}

type Tab = "most-read" | "popular";

export default function SidebarTabs({ mostRead, popular }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("most-read");
  const articles = activeTab === "most-read" ? mostRead : popular;

  return (
    <div className="content-card rounded-xl overflow-hidden">
      {/* ── Tab bar ── */}
      <div className="flex">
        <button
          onClick={() => setActiveTab("most-read")}
          className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-3 text-sm font-bold transition-colors ${
            activeTab === "most-read"
              ? "bg-[color:var(--site-heading)] text-white"
              : "bg-[color:var(--site-surface-soft)] text-[color:var(--site-muted)] hover:text-[color:var(--site-text)]"
          }`}
        >
          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          الأكثر قراءة
        </button>

        <button
          onClick={() => setActiveTab("popular")}
          className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-3 text-sm font-bold transition-colors ${
            activeTab === "popular"
              ? "bg-[color:var(--site-coral)] text-white"
              : "bg-[color:var(--site-surface-soft)] text-[color:var(--site-muted)] hover:text-[color:var(--site-text)]"
          }`}
        >
          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
          </svg>
          مواضيع شائعة
        </button>
      </div>

      {/* ── Article list ── */}
      <div className="divide-y divide-[color:var(--site-border)]">
        {articles.slice(0, 10).map((article, i) => (
          <Link
            key={article.slug || article.id}
            href={`/article/${article.slug}`}
            className="group flex items-center gap-2 px-4 py-2.5 transition-colors hover:bg-[color:var(--site-surface-soft)]"
          >
            <span
              className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                i < 3
                  ? "bg-[color:var(--site-gold)] text-[color:var(--site-pill-text)]"
                  : "bg-[color:var(--site-surface-soft)] text-[color:var(--site-muted)]"
              }`}
            >
              {i + 1}
            </span>
            <span className="text-sm text-[color:var(--site-text)] group-hover:text-[color:var(--site-accent)] transition-colors line-clamp-2 leading-relaxed">
              {article.title}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
