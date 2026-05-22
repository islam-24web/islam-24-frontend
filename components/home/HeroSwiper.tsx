"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { getStrapiMediaUrl } from "@/lib/api";
import type { Article } from "@/types/strapi";

interface HeroSwiperProps {
  articles: Article[];
}

function formatDate(dateString: string) {
  try {
    return new Date(dateString).toLocaleDateString("ar-EG", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return dateString;
  }
}

export default function HeroSwiper({ articles }: HeroSwiperProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const slides = articles.slice(0, 5);

  const goNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const goPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    if (slides.length <= 1) return;
    intervalRef.current = setInterval(goNext, 5000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [goNext, slides.length]);

  const handleDotClick = (index: number) => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setCurrentIndex(index);
    intervalRef.current = setInterval(goNext, 5000);
  };

  const handlePrev = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    goPrev();
    intervalRef.current = setInterval(goNext, 5000);
  };

  const handleNext = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    goNext();
    intervalRef.current = setInterval(goNext, 5000);
  };

  if (!slides || slides.length === 0) {
    return (
      <div className="hero-panel hero-fallback w-full h-[400px] flex items-center justify-center rounded-2xl">
        <p className="text-white/70 text-lg">لا توجد مقالات مميزة</p>
      </div>
    );
  }

  const current = slides[currentIndex];
  const imgUrl = getStrapiMediaUrl(current.featured_image?.url);

  return (
    <>
      <style>{`
        @keyframes heroFadeIn {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
        @keyframes heroProgress {
          from { width: 0%;    }
          to   { width: 100%;  }
        }
        .hero-text-anim   { animation: heroFadeIn 0.5s ease-out both; }
        .hero-progress-bar { animation: heroProgress 5s linear forwards; }
      `}</style>

      {/* ── Card shell: image on top, text content below ── */}
      <div
        className="content-card w-full overflow-hidden rounded-2xl"
        dir="rtl"
      >
        {/* ── Image section ── */}
        <div className="relative w-full overflow-hidden" style={{ height: 230 }}>
          {imgUrl && imgUrl !== "/placeholder.jpg" ? (
            <Image
              key={current.slug}
              src={imgUrl}
              alt={current.title}
              fill
              priority={currentIndex === 0}
              sizes="(min-width: 1024px) 66vw, 100vw"
              className="object-cover transition-opacity duration-700"
            />
          ) : (
            <div className="hero-fallback w-full h-full" />
          )}

          {/* Subtle bottom fade for edge softening only */}
          <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-black/30 to-transparent pointer-events-none" />

          {/* Progress bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-white/20">
            <div key={currentIndex} className="hero-progress-fill h-full hero-progress-bar" />
          </div>

          {/* Arrows */}
          <button
            onClick={handlePrev}
            aria-label="السابق"
            className="hero-icon-button absolute top-1/2 right-3 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center transition-all z-10"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <button
            onClick={handleNext}
            aria-label="التالي"
            className="hero-icon-button absolute top-1/2 left-3 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center transition-all z-10"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5l-7 7 7 7" />
            </svg>
          </button>

          {/* Slide counter */}
          <div className="absolute top-3 left-3 bg-black/50 text-white text-xs px-2.5 py-1 rounded-full backdrop-blur-sm tabular-nums">
            {currentIndex + 1} / {slides.length}
          </div>
        </div>

        {/* ── Content section — clean, below the image ── */}
        <div className="p-5 md:p-6">
          <div key={current.slug} className="hero-text-anim">
            {/* Meta row */}
            <div className="flex items-center gap-3 mb-3">
              {current.category && (
                <Link
                  href={`/category/${current.category.slug}`}
                  className="hero-category-pill text-xs font-bold px-3 py-1 rounded-full transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  {current.category.name}
                </Link>
              )}
              <span className="site-muted text-xs flex items-center gap-1">
                <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {formatDate(current.published_date || current.publishedAt)}
              </span>
            </div>

            {/* Title */}
            <Link href={`/article/${current.slug}`}>
              <h2 className="site-title font-bold text-xl md:text-2xl line-clamp-2 leading-relaxed mb-2 hover:text-[color:var(--site-accent)] transition-colors">
                {current.title}
              </h2>
            </Link>

            {/* Excerpt */}
            {current.excerpt && (
              <p className="site-muted text-sm line-clamp-2 mb-4 leading-relaxed">
                {current.excerpt}
              </p>
            )}

            {/* CTA + dots */}
            <div className="flex items-center justify-between">
              <Link
                href={`/article/${current.slug}`}
                className="hero-cta inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all"
              >
                اقرأ المزيد
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>

              {/* Dots */}
              <div className="flex items-center gap-1.5">
                {slides.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => handleDotClick(i)}
                    aria-label={`الشريحة ${i + 1}`}
                    className={`transition-all duration-300 rounded-full ${
                      i === currentIndex
                        ? "hero-dot-active w-6 h-2"
                        : "bg-[color:var(--site-border)] hover:bg-[color:var(--site-muted)] w-2 h-2"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
