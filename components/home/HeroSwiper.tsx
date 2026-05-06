"use client";

import { useState, useEffect, useRef, useCallback } from "react";
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
      <div className="w-full h-[400px] bg-gradient-to-br from-emerald-800 to-emerald-900 flex items-center justify-center rounded-2xl">
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
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes heroProgress {
          from { width: 0%; }
          to { width: 100%; }
        }
        .hero-text-anim { animation: heroFadeIn 0.6s ease-out both; }
        .hero-progress-bar { animation: heroProgress 5s linear infinite; }
      `}</style>
      <div
        className="relative w-full overflow-hidden rounded-2xl bg-gray-900"
        style={{ height: 400 }}
        dir="rtl"
      >
        {/* Background image */}
        <div className="absolute inset-0">
          {imgUrl && imgUrl !== "/placeholder.jpg" ? (
            <img
              key={current.slug}
              src={imgUrl}
              alt={current.title}
              className="w-full h-full object-cover transition-opacity duration-700"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-emerald-800 to-emerald-950" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/10" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent" />
        </div>

        {/* Content */}
        <div className="absolute bottom-0 right-0 left-0 p-6 md:p-10">
          <div key={current.slug} className="hero-text-anim">
            <div className="flex items-center gap-3 mb-3">
              {current.category && (
                <Link
                  href={`/category/${current.category.slug}`}
                  className="bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold px-3 py-1.5 rounded-full transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  {current.category.name}
                </Link>
              )}
              <span className="text-gray-300 text-xs flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {formatDate(current.published_date || current.publishedAt)}
              </span>
            </div>
            <Link href={`/article/${current.slug}`}>
              <h2 className="text-white font-bold text-xl md:text-3xl line-clamp-2 leading-relaxed mb-3 hover:text-amber-300 transition-colors">
                {current.title}
              </h2>
            </Link>
            {current.excerpt && (
              <p className="text-gray-300 text-sm line-clamp-2 mb-4 max-w-2xl leading-relaxed">
                {current.excerpt}
              </p>
            )}
            <Link
              href={`/article/${current.slug}`}
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-all"
            >
              اقرأ المزيد
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Progress bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-white/20">
          <div key={currentIndex} className="h-full bg-amber-500 hero-progress-bar" />
        </div>

        {/* Arrows */}
        <button
          onClick={handlePrev}
          className="absolute top-1/2 right-3 -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-emerald-700 text-white rounded-full flex items-center justify-center transition-all z-10"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
        <button
          onClick={handleNext}
          className="absolute top-1/2 left-3 -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-emerald-700 text-white rounded-full flex items-center justify-center transition-all z-10"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5l-7 7 7 7" />
          </svg>
        </button>

        {/* Dots */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => handleDotClick(i)}
              className={`transition-all duration-300 rounded-full ${
                i === currentIndex
                  ? "bg-amber-500 w-8 h-2.5"
                  : "bg-white/50 hover:bg-white/80 w-2.5 h-2.5"
              }`}
            />
          ))}
        </div>

        {/* Slide counter */}
        <div className="absolute top-3 left-3 bg-black/50 text-white text-xs px-3 py-1 rounded-full backdrop-blur-sm">
          {currentIndex + 1} / {slides.length}
        </div>
      </div>
    </>
  );
}
