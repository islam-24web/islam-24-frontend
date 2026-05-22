import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getApprovedHomepageCategories, getArticles, getCategories, getHomepage, getStrapiMediaUrl } from "@/lib/api";
import HeroSwiper from "@/components/home/HeroSwiper";
import HomeBlockRenderer from "@/components/blocks/HomeBlockRenderer";
import { isAutoCategoryStrips, isCmsHomepage } from "@/lib/feature-flags";
import type { Article, CategoryStripBlock, DailyTilesBlock, HomeBlock } from "@/types/strapi";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "إسلام 24 — قرآن، سنة، أدعية، أذكار، أسماء الله الحسنى",
  description: "موقع إسلامي شامل: القرآن الكريم، الحديث النبوي، الفقه، السيرة، أسماء الله الحسنى، الأدعية والأذكار",
  openGraph: { title: "إسلام 24", description: "بوابتك الإسلامية الشاملة" },
};

// NAV: matches ACTUAL Strapi category slugs
const navCategories = [
  { name: "القرآن", slug: "quran-tafsir" },
  { name: "الحديث", slug: "hadith" },
  { name: "الفقه", slug: "fiqh" },
  { name: "السيرة", slug: "seerah" },
  { name: "أسماء الله", slug: "names-of-allah" },
  { name: "الأدعية", slug: "duas" },
  { name: "الأذكار", slug: "category" },
  { name: "رمضان", slug: "ramadan" },
  { name: "الحج", slug: "hajj-umrah" },
  { name: "الصلاة", slug: "prayer" },
  // اضافات جديدة
  { name: "الإدمان", slug: "addiction", children: [
    { name: "إدمان الإباحية", slug: "porn-addiction" },
    { name: "إدمان العادة السرية", slug: "masturbation-addiction" },
    { name: "إدمان المخدرات", slug: "drug-addiction" },
    { name: "إدمان الجوال", slug: "phone-addiction" },
  ]},
  { name: "الصحة النفسية", slug: "mental-health" },
  { name: "الزواج", slug: "marriage-family" },
];

// Main display sections (categories that exist in Strapi and have content)
const displaySections = [
  { name: "القرآن وتفسيره", slug: "quran-tafsir" },
  { name: "الحديث الشريف", slug: "hadith" },
  { name: "الفقه والأحكام", slug: "fiqh" },
  { name: "السيرة النبوية", slug: "seerah" },
  { name: "أسماء الله الحسنى", slug: "names-of-allah" },
  { name: "الأدعية", slug: "duas" },
  { name: "الأذكار", slug: "category" },
  { name: "رمضان والصيام", slug: "ramadan" },
  { name: "الحج والعمرة", slug: "hajj-umrah" },
  { name: "الصلاة وأحكامها", slug: "prayer" },
  { name: "الصحة النفسية", slug: "mental-health" },
  { name: "علاج الإدمان", slug: "addiction-treatment" },
];

const FEATURED_APPS = [
  { slug: "sibaq", title: "سباق الفردوس الأعلى", description: "تتبع عباداتك اليومية وأعمال القلوب والأذكار ومدارج السالكين", icon: "🕌" },
];

// Tiny safe fallback when the CMS path is enabled but no daily-tiles block
// has been published yet. Keeps the row populated and on-brand during rollout.
const FALLBACK_DAILY_TILES: DailyTilesBlock = {
  id: 0,
  __component: "blocks.daily-tiles",
  headline_ar: null,
  headline_en: null,
  items: [
    { id: 1, icon: "📖", label: "آية اليوم", text: "وَمَن يَتَّقِ اللَّهَ يَجْعَل لَّهُ مَخْرَجًا وَيَرْزُقْهُ مِنْ حَيْثُ لَا يَحْتَسِبُ", reference: "سورة الطلاق: ٢-٣", tone: "emerald", href: null },
    { id: 2, icon: "☪", label: "حديث اليوم", text: "إنما الأعمال بالنيات، وإنما لكل امرئ ما نوى", reference: "متفق عليه", tone: "amber", href: null },
    { id: 3, icon: "💡", label: "حكمة اليوم", text: "من عرف الله أحبه، ومن أحبه أطاعه، ومن أطاعه سعد", reference: "— ابن القيم", tone: "emerald", href: null },
    { id: 4, icon: "🤲", label: "دعاء اليوم", text: "اللهم إني أسألك الهدى والتقى والعفاف والغنى", reference: "رواه مسلم", tone: "amber", href: null },
  ],
};

function formatDate(dateString?: string) {
  if (!dateString) return "";
  try { return new Date(dateString).toLocaleDateString("ar-EG", { year: "numeric", month: "long", day: "numeric" }); }
  catch { return dateString; }
}

function SectionHeader({ name, slug }: { name: string; slug: string }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-3">
        <div className="site-section-kicker w-1.5 h-7 rounded-full" />
        <h2 className="site-section-title text-lg font-bold">{name}</h2>
      </div>
      <Link href={`/category/${slug}`} className="site-section-link text-sm font-bold flex items-center gap-1 transition-colors">
        المزيد
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </Link>
    </div>
  );
}

function FeaturedCard({ article }: { article: Article }) {
  const img = getStrapiMediaUrl(article.featured_image?.url);
  const hasImg = img && img !== "/placeholder.jpg";
  return (
    <Link href={`/article/${article.slug}`} className="content-card group rounded-xl overflow-hidden block">
      {/* Image on top */}
      <div className="relative w-full overflow-hidden" style={{ height: 180 }}>
        {hasImg ? (
          <Image
            src={img}
            alt={article.title}
            fill
            sizes="(min-width: 1024px) 66vw, 100vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="hero-fallback w-full h-full" />
        )}
      </div>
      {/* Content below image */}
      <div className="p-4">
        {article.category && (
          <span className="hero-category-pill text-xs px-2 py-0.5 rounded-full font-bold mb-2 inline-block">{article.category.name}</span>
        )}
        <h3 className="content-card-title font-bold text-base line-clamp-2 leading-relaxed mt-1">{article.title}</h3>
        <p className="site-muted text-xs mt-1.5">{formatDate(article.published_date || article.publishedAt)}</p>
      </div>
    </Link>
  );
}

function SmallCard({ article }: { article: Article }) {
  const img = getStrapiMediaUrl(article.featured_image?.url);
  const hasImg = img && img !== "/placeholder.jpg";
  return (
    <Link href={`/article/${article.slug}`} className="content-card group flex flex-col rounded-xl overflow-hidden transition-all">
      <div className="relative w-full overflow-hidden" style={{ height: 101 }}>
        {hasImg ? (
          <img src={img} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
        ) : (
          <div className="content-thumb-fallback w-full h-full flex items-center justify-center text-2xl">📖</div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        {article.category && (
          <span className="content-badge absolute bottom-1 right-1 text-[10px] px-1.5 py-0.5 rounded-full font-bold">{article.category.name}</span>
        )}
      </div>
      <div className="p-2">
        <h4 className="content-card-title text-xs font-semibold line-clamp-2 transition-colors leading-relaxed">{article.title}</h4>
      </div>
    </Link>
  );
}

export default async function HomePage() {
  const useCms = isCmsHomepage();
  const useAutoStrips = useCms && isAutoCategoryStrips();

  const [categories, featuredRes, mostReadRes, homepage, approvedCategories, ...sectionResults] = await Promise.all([
    getCategories(),
    getArticles({ featured: true, pageSize: 5 }),
    getArticles({ pageSize: 20 }),
    useCms ? getHomepage() : Promise.resolve(null),
    useAutoStrips ? getApprovedHomepageCategories() : Promise.resolve([]),
    ...displaySections.map((sec) => getArticles({ categorySlug: sec.slug, pageSize: 7, includeChildCategories: true })),
  ]);
  void categories;

  // Manual blocks come from the homepage singleton. When CMS is on but the
  // editor hasn't published yet, render a safe hardcoded daily-tiles block.
  const manualBlocks: HomeBlock[] = useCms
    ? (homepage?.sections?.length ? homepage.sections : [FALLBACK_DAILY_TILES])
    : [];

  // Singleton override: a manual category strip (source: category) claims its
  // category slug. The auto path skips any category slug already claimed so
  // editors can override layout/limit/headline by adding a manual strip.
  const claimedSlugs = new Set(
    manualBlocks
      .filter((b): b is CategoryStripBlock => b.__component === "blocks.category-strip")
      .filter((b) => (b.source ?? "category") === "category" && b.category)
      .map((b) => b.category!.slug)
  );

  // Synthesize a category-strip block for each approved category not already
  // covered by a manual strip. Negative ids stay unique among themselves and
  // can't collide with Strapi's positive auto-increment ids.
  const autoBlocks: CategoryStripBlock[] = approvedCategories
    .filter((c) => !claimedSlugs.has(c.slug))
    .map((c) => ({
      id: -c.id,
      __component: "blocks.category-strip",
      source: "category",
      category: { id: c.id, name: c.name, slug: c.slug },
      headline_ar: null,
      headline_en: null,
      layout: c.homepage_layout ?? "hero-grid",
      limit: c.homepage_limit ?? 7,
      see_more_label: null,
    }));

  const cmsBlocks: HomeBlock[] = [...manualBlocks, ...autoBlocks];
  const cmsHasCategoryStrips = cmsBlocks.some((b) => b.__component === "blocks.category-strip");
  const cmsHasHomeHero = cmsBlocks.some((b) => b.__component === "blocks.home-hero");
  const cmsHasDivineNames = cmsBlocks.some((b) => b.__component === "blocks.divine-names-feature");
  const cmsHasApps = cmsBlocks.some((b) => b.__component === "blocks.apps-feature");

  const featured = featuredRes.data || [];
  const mostRead = mostReadRes.data || [];
  // Fallback: if we don't have ≥3 featured, reuse the top of mostRead (same sort order, no extra fetch)
  const heroArticles = featured.length >= 3 ? featured : mostRead.slice(0, 5);

  const sections = displaySections
    .map((sec, i) => ({ ...sec, articles: sectionResults[i].data || [] }))
    .filter((s) => s.articles.length > 0);

  return (
    <div dir="rtl" className="site-page min-h-screen">
      <main className="site-main max-w-7xl mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-8 xl:gap-10">
          {/* Content */}
          <div className="site-stack flex-1 min-w-0">
            {/* Hero — inline swiper runs unless CMS has supplied a home-hero block */}
            {!cmsHasHomeHero && <HeroSwiper articles={heroArticles} />}

            {/* Daily Content Cards */}
            {useCms ? (
              <HomeBlockRenderer blocks={cmsBlocks} />
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { icon: "📖", title: "آية اليوم", text: "وَمَن يَتَّقِ اللَّهَ يَجْعَل لَّهُ مَخْرَجًا وَيَرْزُقْهُ مِنْ حَيْثُ لَا يَحْتَسِبُ", ref: "سورة الطلاق: ٢-٣", color: "blue" },
                  { icon: "☪", title: "حديث اليوم", text: "إنما الأعمال بالنيات، وإنما لكل امرئ ما نوى", ref: "متفق عليه", color: "amber" },
                  { icon: "💡", title: "حكمة اليوم", text: "من عرف الله أحبه، ومن أحبه أطاعه، ومن أطاعه سعد", ref: "— ابن القيم", color: "blue" },
                  { icon: "🤲", title: "دعاء اليوم", text: "اللهم إني أسألك الهدى والتقى والعفاف والغنى", ref: "رواه مسلم", color: "amber" },
                ].map((card, i) => (
                  <div key={i} className={`daily-card rounded-xl p-4 transition-shadow hover:shadow-md ${
                    card.color === "blue" ? "daily-card-blue" : "daily-card-gold"
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-2xl">{card.icon}</span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${card.color === "blue" ? "daily-pill-blue" : "daily-pill-gold"}`}>{card.title}</span>
                    </div>
                    <p className="daily-text text-sm font-semibold leading-relaxed line-clamp-3">{card.text}</p>
                    <p className="daily-ref text-xs mt-2">{card.ref}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Apps Section — hardcoded only when CMS hasn't supplied an apps-feature block */}
            {!cmsHasApps && (
              <section>
                <SectionHeader name="تطبيقاتنا الإسلامية" slug="apps" />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {FEATURED_APPS.map(app => (
                    <Link key={app.slug} href={`/apps/${app.slug}`} target="_blank" rel="noopener noreferrer"
                      className="content-card group flex items-center gap-4 rounded-xl p-5 transition-all">
                      <span className="text-5xl shrink-0">{app.icon}</span>
                      <div>
                        <h3 className="content-card-title text-base font-bold transition-colors">{app.title}</h3>
                        <p className="site-muted text-xs mt-1 leading-relaxed">{app.description}</p>
                        <span className="inline-block mt-2 text-xs font-bold text-[color:var(--site-accent)]">افتح التطبيق ←</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Category Sections — hardcoded loop runs unless CMS has supplied category-strip blocks */}
            {!cmsHasCategoryStrips && sections.map(({ name, slug, articles }) => {
              const main = articles[0];
              const subs = articles.slice(1, 7);
              if (!main) return null;
              return (
                <section key={slug}>
                  <SectionHeader name={name} slug={slug} />
                  <div className="space-y-4">
                    <FeaturedCard article={main} />
                    {subs.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {subs.map((a) => <SmallCard key={a.slug || a.id} article={a} />)}
                      </div>
                    )}
                  </div>
                </section>
              );
            })}
          </div>

          {/* Sidebar */}
          <aside className="w-full lg:w-72 flex-shrink-0">
            <div className="lg:sticky lg:top-28 space-y-6">
              {/* Most Read */}
              <div className="content-card rounded-xl overflow-hidden">
                <div className="bg-[color:var(--site-heading)] px-4 py-3">
                  <h3 className="text-white font-bold text-base">📊 الأكثر قراءة</h3>
                </div>
                <div className="divide-y divide-[color:var(--site-border)]">
                  {mostRead.slice(0, 10).map((article, i) => (
                    <Link key={article.slug || article.id} href={`/article/${article.slug}`}
                      className="group flex items-center gap-2 px-4 py-2.5 transition-colors hover:bg-[color:var(--site-surface-soft)]">
                      <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${i < 3 ? "bg-[color:var(--site-gold)] text-slate-950" : "bg-[color:var(--site-surface-soft)] text-[color:var(--site-muted)]"}`}>{i + 1}</span>
                      <span className="text-sm text-[color:var(--site-text)] group-hover:text-[color:var(--site-accent)] transition-colors line-clamp-2 leading-relaxed">{article.title}</span>
                    </Link>
                  ))}
                </div>
              </div>
              {/* Asma Allah sidebar — hidden when CMS supplied a divine-names-feature block */}
              {!cmsHasDivineNames && (
                <div className="rounded-xl bg-[linear-gradient(135deg,#101b33_0%,#31200c_100%)] text-white p-5 shadow-sm">
                  <h3 className="font-bold text-lg mb-2">🌟 أسماء الله الحسنى</h3>
                  <p className="text-white/80 text-sm mb-4 leading-relaxed">تعرف على أسماء الله الحسنى الـ ٩٩ ومعانيها وآثارها الإيمانية</p>
                  <Link href="/asma-allah" className="block text-center bg-white text-slate-950 py-2.5 rounded-xl font-bold text-sm hover:bg-[color:var(--site-gold)] transition-colors">تصفح الأسماء ←</Link>
                </div>
              )}
            </div>
          </aside>
        </div>
      </main>

    </div>
  );
}
