"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { NavItem, NavLink, Navigation } from "@/types/strapi";
import HeaderSearchForm from "@/components/search/HeaderSearchForm";
import ThemeToggle from "@/components/theme/ThemeToggle";
import BrandLogo from "@/components/layout/BrandLogo";

interface Props {
  navigation: Navigation | null;
}

const FALLBACK_ITEMS: NavItem[] = [
  { id: 0, label: "القرآن", href: "/category/quran-tafsir", is_external: false, highlight: false, sub_items: [] },
  { id: 0, label: "الحديث", href: "/category/hadith", is_external: false, highlight: false, sub_items: [] },
  { id: 0, label: "الفقه", href: "/category/fiqh", is_external: false, highlight: false, sub_items: [] },
  { id: 0, label: "السيرة", href: "/category/seerah", is_external: false, highlight: false, sub_items: [] },
  { id: 0, label: "أسماء الله", href: "/asma-allah", is_external: false, highlight: false, sub_items: [] },
  { id: 0, label: "الأدعية", href: "/category/duas", is_external: false, highlight: false, sub_items: [] },
  { id: 0, label: "الأذكار", href: "/category/category", is_external: false, highlight: false, sub_items: [] },
  { id: 0, label: "رمضان", href: "/category/ramadan", is_external: false, highlight: false, sub_items: [] },
  { id: 0, label: "الحج", href: "/category/hajj-umrah", is_external: false, highlight: false, sub_items: [] },
  { id: 0, label: "الصلاة", href: "/category/prayer", is_external: false, highlight: false, sub_items: [] },
  {
    id: 0,
    label: "الإدمان",
    href: "/category/addiction",
    is_external: false,
    highlight: false,
    sub_items: [
      { id: 0, name: "إدمان الإباحية", url: "/category/porn-addiction", is_external: false },
      { id: 0, name: "إدمان العادة السرية", url: "/category/masturbation-addiction", is_external: false },
      { id: 0, name: "إدمان المخدرات", url: "/category/drug-addiction", is_external: false },
      { id: 0, name: "إدمان الجوال", url: "/category/phone-addiction", is_external: false },
    ],
  },
  { id: 0, label: "الصحة النفسية", href: "/category/mental-health", is_external: false, highlight: false, sub_items: [] },
  { id: 0, label: "الزواج", href: "/category/marriage-family", is_external: false, highlight: false, sub_items: [] },
];

function linksToItems(links: NavLink[]): NavItem[] {
  return links.map((l) => ({
    id: l.id,
    label: l.name,
    href: l.url,
    is_external: l.is_external,
    highlight: false,
    sub_items: [],
  }));
}

function NavItemLink({ item }: { item: NavItem }) {
  const baseClasses =
    "site-nav-link";
  const colorClasses = item.highlight ? "site-nav-link-active" : "";

  if (item.sub_items && item.sub_items.length > 0) {
    return (
      <div className="relative group flex-shrink-0">
        <span className={`${baseClasses} ${colorClasses} cursor-pointer flex items-center gap-1`}>
          {item.label}
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </span>
        <div className="site-dropdown absolute top-full right-0 mt-0 rounded-b-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible focus-within:opacity-100 focus-within:visible transition-all duration-200 z-50 min-w-[200px]">
          {item.sub_items.map((sub) => (
            <Link
              key={sub.id}
              href={sub.url}
              target={sub.is_external ? "_blank" : undefined}
              rel={sub.is_external ? "noopener noreferrer" : undefined}
              className="site-dropdown-link block px-4 py-2.5 text-sm transition-colors whitespace-nowrap border-b border-[color:var(--site-border)] last:border-0"
            >
              {sub.name}
            </Link>
          ))}
        </div>
      </div>
    );
  }

  const href = item.href || "#";
  return (
    <Link
      href={href}
      target={item.is_external ? "_blank" : undefined}
      rel={item.is_external ? "noopener noreferrer" : undefined}
      className={`${baseClasses} ${colorClasses}`}
    >
      {item.label}
    </Link>
  );
}

export default function SiteHeader({ navigation }: Props) {
  const taglineAr = navigation?.tagline_ar ?? "بوابتك الإسلامية الشاملة";
  const showDate = navigation?.show_date_strip ?? true;

  // ── scroll-aware: hide top-bar on scroll-down, reveal on scroll-up ──
  // Uses an anchor-point approach: state only changes after scrolling
  // COLLAPSE_PX downward or EXPAND_PX upward from the last state-change
  // position. This prevents oscillation caused by bounce/momentum scrolling.
  const [topBarVisible, setTopBarVisible] = useState(true);

  useEffect(() => {
    const COLLAPSE_PX = 120; // must scroll this far down to hide
    const EXPAND_PX   = 60;  // must scroll this far up to show
    const TOP_SNAP    = 80;  // always show when within this many px of top

    // Local vars avoid stale closures on React state
    let shown   = true;
    let anchorY = 0;
    let raf: ReturnType<typeof requestAnimationFrame> | null = null;

    const update = () => {
      raf = null;
      const y = window.scrollY;

      if (y < TOP_SNAP) {
        if (!shown) { shown = true; setTopBarVisible(true); }
        anchorY = 0;
        return;
      }

      if (shown) {
        if (y > anchorY + COLLAPSE_PX) {
          // Scrolled far enough down — collapse
          shown = false; setTopBarVisible(false); anchorY = y;
        } else if (y < anchorY) {
          // Direction reversed while visible — reset anchor so collapse
          // distance is measured from the new high-point
          anchorY = y;
        }
      } else {
        if (anchorY - y > EXPAND_PX) {
          // Scrolled far enough up — expand
          shown = true; setTopBarVisible(true); anchorY = y;
        } else if (y > anchorY) {
          // Direction reversed while hidden — reset anchor
          anchorY = y;
        }
      }
    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    anchorY = window.scrollY;
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  const items: NavItem[] =
    navigation?.nav_items && navigation.nav_items.length > 0
      ? navigation.nav_items
      : navigation?.links && navigation.links.length > 0
      ? linksToItems(navigation.links)
      : FALLBACK_ITEMS;

  const flatItems: { id: number; label: string; href: string; is_external: boolean }[] = items.flatMap((item) => {
    if (item.sub_items && item.sub_items.length > 0) {
      return [
        ...(item.href ? [{ id: item.id, label: item.label, href: item.href, is_external: item.is_external }] : []),
        ...item.sub_items.map((s) => ({ id: s.id, label: s.name, href: s.url, is_external: s.is_external })),
      ];
    }
    return [{ id: item.id, label: item.label, href: item.href || "#", is_external: item.is_external }];
  });

  return (
    <header className="site-header sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">

        {/* ── Top bar (logo + search) — collapses on scroll-down ── */}
        <div
          className="overflow-hidden transition-all duration-300 ease-in-out"
          style={{
            maxHeight: topBarVisible ? "200px" : "0px",
            opacity: topBarVisible ? 1 : 0,
            pointerEvents: topBarVisible ? "auto" : "none",
          }}
        >
          {/* Mobile: logo on its own full row, centered */}
          <div className="flex md:hidden items-center justify-center py-5">
            <BrandLogo tagline={taglineAr} />
          </div>

          {/* Desktop: logo + controls in one row */}
          <div className="site-header-row hidden md:flex items-center justify-between py-3">
            <BrandLogo tagline={taglineAr} />
            <div className="flex items-center gap-2">
              {showDate && (
                <div className="hidden text-xs font-semibold text-[color:var(--site-header-muted)] lg:block">
                  {new Date().toLocaleDateString("ar-EG", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </div>
              )}
              <HeaderSearchForm id="site-search-desktop" className="hidden w-56 md:flex lg:w-64" />
              <ThemeToggle />
            </div>
          </div>

          {/* Mobile: search + theme toggle row */}
          <div className="flex md:hidden items-center justify-between gap-2 pb-3 px-1">
            <HeaderSearchForm id="site-search-mobile" className="flex-1" />
            <ThemeToggle />
          </div>
        </div>

        {/* ── Nav bar — always visible (sticky) ── */}
        <nav aria-label="Primary" className="hidden md:flex items-center overflow-x-auto no-scrollbar -mx-1">
          <Link href="/" className="site-nav-link-active">
            الرئيسية
          </Link>
          {items.map((item, idx) => (
            <NavItemLink key={`${item.id}-${idx}`} item={item} />
          ))}
        </nav>

        <nav
          aria-label="Primary mobile"
          className="md:hidden flex items-center overflow-x-auto no-scrollbar -mx-1 pb-1"
        >
          <Link href="/" className="site-nav-link-active px-2 py-2 text-xs">
            الرئيسية
          </Link>
          {flatItems.map((item, idx) => (
            <Link
              key={`${item.id}-${idx}`}
              href={item.href}
              target={item.is_external ? "_blank" : undefined}
              rel={item.is_external ? "noopener noreferrer" : undefined}
              className="site-nav-link px-2 py-2 text-xs"
            >
              {item.label}
            </Link>
          ))}
        </nav>

      </div>
    </header>
  );
}
