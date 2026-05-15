import type { YouTubeEmbedBlock } from "@/types/strapi";
import YouTubeFacade from "./YouTubeFacade";

interface Props {
  block: YouTubeEmbedBlock;
}

const ASPECT_PADDING: Record<YouTubeEmbedBlock["aspect_ratio"], string> = {
  "16:9": "56.25%",
  "9:16": "177.78%",
  "1:1": "100%",
  "4:3": "75%",
};

function extractVideoId(url: string): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([A-Za-z0-9_-]{11})/,
    /^([A-Za-z0-9_-]{11})$/,
  ];
  for (const re of patterns) {
    const m = trimmed.match(re);
    if (m) return m[1];
  }
  return null;
}

export default function YouTubeEmbed({ block }: Props) {
  const videoId = extractVideoId(block.url);
  if (!videoId) return null;
  const padding = ASPECT_PADDING[block.aspect_ratio] || ASPECT_PADDING["16:9"];

  return (
    <section aria-label={block.title || "Video"}>
      {block.title && (
        <h2 className="text-lg font-bold text-gray-800 mb-3">{block.title}</h2>
      )}
      <div
        className="relative w-full rounded-xl overflow-hidden bg-black"
        style={{ paddingBottom: padding }}
      >
        <div className="absolute inset-0">
          <YouTubeFacade videoId={videoId} title={block.title || "YouTube video"} />
        </div>
      </div>
      {block.caption && (
        <p className="text-sm text-gray-500 mt-2 leading-relaxed">{block.caption}</p>
      )}
    </section>
  );
}
