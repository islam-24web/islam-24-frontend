import type { Metadata } from "next";
import Link from "next/link";
import { getArticles, getCategories, getStrapiMediaUrl } from "@/lib/api";
import HeroSwiper from "@/components/home/HeroSwiper";
import type { Article, Category } from "@/types/strapi";

export const dynamic = "force-dynamic";

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
];

const FEATURED_APPS = [
  { slug: "sibaq", title: "سباق الفردوس الأعلى", description: "تتبع عباداتك اليومية وأعمال القلوب والأذكار ومدارج السالكين", icon: "🕌" },
];

function formatDate(dateString?: string) {
  if (!dateString) return "";
  try { return new Date(dateString).toLocaleDateString("ar-EG", { year: "numeric", month: "long", day: "numeric" }); }
  catch { return dateString; }
}

function SectionHeader({ name, slug }: { name: string; slug: string }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-3">
        <div className="w-1.5 h-7 bg-emerald-600 rounded-full" />
        <h2 className="text-lg font-bold text-gray-800">{name}</h2>
      </div>
      <Link href={`/category/${slug}`} className="text-emerald-600 text-sm font-medium hover:text-emerald-700 flex items-center gap-1">
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
    <Link href={`/article/${article.slug}`} className="group relative rounded-xl overflow-hidden block" style={{ height: 200 }}>
      {hasImg ? (
        <img src={img} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-emerald-700 to-emerald-900" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
      <div className="absolute bottom-0 right-0 left-0 p-4">
        {article.category && (
          <span className="bg-amber-500 text-white text-xs px-2 py-0.5 rounded-full font-medium mb-2 inline-block">{article.category.name}</span>
        )}
        <h3 className="text-white font-bold text-base line-clamp-2 leading-relaxed">{article.title}</h3>
        <p className="text-gray-300 text-xs mt-1">{formatDate(article.published_date || article.publishedAt)}</p>
      </div>
    </Link>
  );
}

function SmallCard({ article }: { article: Article }) {
  const img = getStrapiMediaUrl(article.featured_image?.url);
  const hasImg = img && img !== "/placeholder.jpg";
  return (
    <Link href={`/article/${article.slug}`} className="group flex flex-col rounded-xl overflow-hidden border border-gray-100 hover:shadow-md transition-all bg-white">
      <div className="relative w-full overflow-hidden" style={{ height: 101 }}>
        {hasImg ? (
          <img src={img} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
        ) : (
          <div className="w-full h-full bg-emerald-50 flex items-center justify-center text-2xl">📖</div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        {article.category && (
          <span className="absolute bottom-1 right-1 bg-emerald-600 text-white text-[10px] px-1.5 py-0.5 rounded-full">{article.category.name}</span>
        )}
      </div>
      <div className="p-2">
        <h4 className="text-xs font-semibold text-gray-800 line-clamp-2 group-hover:text-emerald-700 transition-colors leading-relaxed">{article.title}</h4>
      </div>
    </Link>
  );
}

// Dropdown for parent categories like الإدمان
function DropdownNavItem({ name, items }: { name: string; items: { name: string; slug: string }[] }) {
  return (
    <div className="relative group flex-shrink-0">
      <span className="text-emerald-100 group-hover:text-amber-400 text-sm font-medium px-3 py-2.5 transition-colors cursor-pointer flex items-center gap-1 whitespace-nowrap">
        {name}
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
      </span>
      <div className="absolute top-full right-0 mt-0 bg-white rounded-b-xl shadow-xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 min-w-[180px]">
        {items.map(c => (
          <Link key={c.slug} href={`/category/${c.slug}`}
            className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors whitespace-nowrap border-b border-gray-50 last:border-0">
            {c.name}
          </Link>
        ))}
      </div>
    </div>
  );
}

export default async function HomePage() {
  const categories = await getCategories();

  const featuredRes = await getArticles({ featured: true, pageSize: 5 });
  const featured = featuredRes.data || [];

  const heroArticles = featured.length >= 3 ? featured : (await getArticles({ pageSize: 5 })).data || [];

  const mostReadRes = await getArticles({ pageSize: 20 });
  const mostRead = mostReadRes.data || [];

  // Fetch articles per display section
  const sectionPromises = displaySections.map(async (sec) => {
    const res = await getArticles({ categorySlug: sec.slug, pageSize: 7 });
    return { ...sec, articles: res.data || [] };
  });
  const sections = (await Promise.all(sectionPromises)).filter(s => s.articles.length > 0);

  return (
    <div dir="rtl" className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <header className="sticky top-0 z-50 bg-emerald-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between py-2 border-b border-emerald-700">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-9 h-9 bg-amber-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-base">﷽</span>
              </div>
              <div>
                <span className="text-white font-bold text-lg">إسلام 24</span>
                <p className="text-emerald-300 text-[10px] hidden sm:block">بوابتك الإسلامية الشاملة</p>
              </div>
            </Link>
            <div className="text-emerald-300 text-xs hidden md:block">
              {new Date().toLocaleDateString("ar-EG", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </div>
            {/* Mobile menu icon */}
            <button className="md:hidden text-white p-1" aria-label="Menu">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
          </div>
          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center overflow-x-auto no-scrollbar -mx-1">
            <Link href="/" className="flex-shrink-0 text-amber-400 text-sm font-bold px-3 py-2.5 border-b-2 border-amber-400">الرئيسية</Link>
            {navCategories.map((cat) => 
              cat.children ? (
                <DropdownNavItem key={cat.slug} name={cat.name} items={cat.children} />
              ) : (
                <Link key={cat.slug} href={`/category/${cat.slug}`}
                  className="flex-shrink-0 text-emerald-100 hover:text-amber-400 text-sm font-medium px-3 py-2.5 transition-colors hover:bg-emerald-700/50 border-b-2 border-transparent hover:border-amber-400 whitespace-nowrap">
                  {cat.name}
                </Link>
              )
            )}
          </nav>
          {/* Mobile Nav (horizontal scroll, no scrollbar) */}
          <nav className="md:hidden flex items-center overflow-x-auto no-scrollbar -mx-1 pb-1">
            <Link href="/" className="flex-shrink-0 text-amber-400 text-xs font-bold px-2 py-2 border-b-2 border-amber-400">الرئيسية</Link>
            {navCategories.map((cat) => (
              <Link key={cat.slug} href={`/category/${cat.slug}`}
                className="flex-shrink-0 text-emerald-100 text-xs font-medium px-2 py-2 whitespace-nowrap">
                {cat.name}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Content */}
          <div className="flex-1 min-w-0 space-y-8">
            {/* Hero Swiper */}
            <HeroSwiper articles={heroArticles} />

            {/* Daily Content Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { icon: "📖", title: "آية اليوم", text: "وَمَن يَتَّقِ اللَّهَ يَجْعَل لَّهُ مَخْرَجًا وَيَرْزُقْهُ مِنْ حَيْثُ لَا يَحْتَسِبُ", ref: "سورة الطلاق: ٢-٣", color: "emerald" },
                { icon: "☪", title: "حديث اليوم", text: "إنما الأعمال بالنيات، وإنما لكل امرئ ما نوى", ref: "متفق عليه", color: "amber" },
                { icon: "💡", title: "حكمة اليوم", text: "من عرف الله أحبه، ومن أحبه أطاعه، ومن أطاعه سعد", ref: "— ابن القيم", color: "emerald" },
                { icon: "🤲", title: "دعاء اليوم", text: "اللهم إني أسألك الهدى والتقى والعفاف والغنى", ref: "رواه مسلم", color: "amber" },
              ].map((card, i) => (
                <div key={i} className={`rounded-xl p-4 border hover:shadow-md transition-shadow ${
                  card.color === "emerald" ? "bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200" : "bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200"
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl">{card.icon}</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${card.color === "emerald" ? "bg-emerald-600 text-white" : "bg-amber-500 text-white"}`}>{card.title}</span>
                  </div>
                  <p className={`text-sm font-semibold leading-relaxed line-clamp-3 ${card.color === "emerald" ? "text-emerald-900" : "text-amber-900"}`}>{card.text}</p>
                  <p className={`text-xs mt-2 ${card.color === "emerald" ? "text-emerald-600" : "text-amber-600"}`}>{card.ref}</p>
                </div>
              ))}
            </div>

            {/* Apps Section */}
            <section>
              <SectionHeader name="تطبيقاتنا الإسلامية" slug="apps" />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {FEATURED_APPS.map(app => (
                  <Link key={app.slug} href={`/apps/${app.slug}`} target="_blank" rel="noopener noreferrer"
                    className="group flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all">
                    <span className="text-5xl shrink-0">{app.icon}</span>
                    <div>
                      <h3 className="text-base font-bold text-gray-900 group-hover:text-emerald-700 transition-colors">{app.title}</h3>
                      <p className="text-xs text-gray-500 mt-1 leading-relaxed">{app.description}</p>
                      <span className="inline-block mt-2 text-xs font-medium text-emerald-600">افتح التطبيق ←</span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>

            {/* Category Sections */}
            {sections.map(({ name, slug, articles }) => {
              const main = articles[0];
              const subs = articles.slice(1, 7);
              if (!main) return null;
              return (
                <section key={slug}>
                  <SectionHeader name={name} slug={slug} />
                  <div className="space-y-3">
                    <FeaturedCard article={main} />
                    {subs.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
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
            <div className="lg:sticky lg:top-24 space-y-5">
              {/* Most Read */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-emerald-700 px-4 py-3">
                  <h3 className="text-white font-bold text-base">📊 الأكثر قراءة</h3>
                </div>
                <div className="divide-y divide-gray-50">
                  {mostRead.slice(0, 10).map((article, i) => (
                    <Link key={article.slug || article.id} href={`/article/${article.slug}`}
                      className="flex items-center gap-2 px-4 py-2.5 hover:bg-gray-50 transition-colors group">
                      <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${i < 3 ? "bg-amber-500 text-white" : "bg-gray-100 text-gray-500"}`}>{i + 1}</span>
                      <span className="text-sm text-gray-700 group-hover:text-emerald-700 transition-colors line-clamp-2 leading-relaxed">{article.title}</span>
                    </Link>
                  ))}
                </div>
              </div>
              {/* Asma Allah */}
              <div className="bg-gradient-to-br from-amber-500 to-amber-600 text-white rounded-xl p-5 shadow-sm">
                <h3 className="font-bold text-lg mb-2">🌟 أسماء الله الحسنى</h3>
                <p className="text-white/80 text-sm mb-4 leading-relaxed">تعرف على أسماء الله الحسنى الـ ٩٩ ومعانيها وآثارها الإيمانية</p>
                <Link href="/category/names-of-allah" className="block text-center bg-white text-amber-700 py-2.5 rounded-xl font-bold text-sm hover:bg-amber-50 transition-colors">تصفح الأسماء ←</Link>
              </div>
            </div>
          </aside>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-emerald-900 text-white mt-12">
        <div className="max-w-7xl mx-auto px-4 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-9 h-9 bg-amber-500 rounded-full flex items-center justify-center"><span className="text-white font-bold">﷽</span></div>
                <span className="font-bold text-lg">إسلام 24</span>
              </div>
              <p className="text-emerald-300 text-xs leading-relaxed">بوابتك الإسلامية الشاملة — محتوى موثوق في القرآن والحديث والفقه والسيرة</p>
            </div>
            <div>
              <h4 className="font-bold text-amber-400 mb-3 text-sm">أقسام رئيسية</h4>
              <ul className="space-y-1.5">
                {navCategories.filter(c => !c.children).slice(0, 7).map(c => (
                  <li key={c.slug}><Link href={`/category/${c.slug}`} className="text-emerald-300 hover:text-amber-400 text-xs transition-colors">{c.name}</Link></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-amber-400 mb-3 text-sm">المزيد</h4>
              <ul className="space-y-1.5">
                {navCategories.filter(c => !c.children).slice(7).map(c => (
                  <li key={c.slug}><Link href={`/category/${c.slug}`} className="text-emerald-300 hover:text-amber-400 text-xs transition-colors">{c.name}</Link></li>
                ))}
                <li><Link href="/apps/sibaq" className="text-emerald-300 hover:text-amber-400 text-xs transition-colors">سباق الفردوس الأعلى</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-amber-400 mb-3 text-sm">روابط</h4>
              <ul className="space-y-1.5">
                {["من نحن", "سياسة الخصوصية", "اتصل بنا"].map(l => (
                  <li key={l}><Link href="#" className="text-emerald-300 hover:text-amber-400 text-xs transition-colors">{l}</Link></li>
                ))}
              </ul>
            </div>
          </div>
          <div className="border-t border-emerald-800 mt-8 pt-6 text-center">
            <p className="text-emerald-400 text-xs">© {new Date().getFullYear()} إسلام 24 — جميع الحقوق محفوظة</p>
            <p className="text-emerald-500 text-xs mt-1">﴿ وَمَا تَوْفِيقِي إِلَّا بِاللَّهِ ۚ عَلَيْهِ تَوَكَّلْتُ وَإِلَيْهِ أُنِيبُ ﴾</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
