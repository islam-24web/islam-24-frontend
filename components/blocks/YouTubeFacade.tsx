"use client";

import { useState } from "react";

interface Props {
  videoId: string;
  title: string;
}

export default function YouTubeFacade({ videoId, title }: Props) {
  const [activated, setActivated] = useState(false);

  if (activated) {
    return (
      <iframe
        src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`}
        title={title}
        loading="lazy"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        className="w-full h-full border-0"
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => setActivated(true)}
      className="group relative w-full h-full block cursor-pointer"
      aria-label={`Play: ${title}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`}
        alt=""
        loading="lazy"
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" aria-hidden="true" />
      <span
        aria-hidden="true"
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-full bg-red-600 group-hover:bg-red-500 transition-colors shadow-2xl"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7 md:w-9 md:h-9 text-white translate-x-0.5">
          <path d="M8 5v14l11-7z" />
        </svg>
      </span>
    </button>
  );
}
