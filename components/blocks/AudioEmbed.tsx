import { getStrapiMediaUrl } from "@/lib/api";
import type { AudioEmbedBlock } from "@/types/strapi";

interface Props {
  block: AudioEmbedBlock;
}

export default function AudioEmbed({ block }: Props) {
  const src = block.file?.url
    ? getStrapiMediaUrl(block.file.url)
    : block.url || null;
  if (!src) return null;

  return (
    <section aria-label={block.title || "Audio"} className="content-card rounded-xl p-5">
      {block.title && (
        <h2 className="site-section-title text-base md:text-lg font-bold mb-3 leading-snug">
          {block.title}
        </h2>
      )}
      <audio controls preload="none" className="w-full" src={src}>
        <track kind="captions" />
        Your browser does not support the audio element.
      </audio>
      {(block.caption || block.transcript_url) && (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-sm">
          {block.caption && <p className="site-muted leading-relaxed">{block.caption}</p>}
          {block.transcript_url && (
            <a
              href={block.transcript_url}
              className="site-section-link font-bold transition-colors"
              target={/^https?:/i.test(block.transcript_url) ? "_blank" : undefined}
              rel={/^https?:/i.test(block.transcript_url) ? "noopener noreferrer" : undefined}
            >
              عرض النص ←
            </a>
          )}
        </div>
      )}
    </section>
  );
}
