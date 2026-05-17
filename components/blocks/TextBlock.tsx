import type { TextBlockData } from "@/types/strapi";

interface Props {
  block: TextBlockData;
}

export default function TextBlock({ block }: Props) {
  return (
    <section className="site-page py-16 sm:py-20">
      <div className="mx-auto max-w-3xl px-6">
        {block.heading && (
          <h2 className="site-title mb-8 text-3xl font-extrabold sm:text-4xl">
            {block.heading}
          </h2>
        )}

        <div
          className="prose-article"
          dangerouslySetInnerHTML={{ __html: block.content }}
        />
      </div>
    </section>
  );
}
