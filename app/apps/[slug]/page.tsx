import { notFound } from 'next/navigation'

const APPS: Record<
  string,
  { title: string; description: string; sourceSlug?: string; assetPath?: string }
> = {
  sibaq: {
    title: 'سباق الفردوس الأعلى',
    description: 'تطبيق إسلامي لتتبع العبادات اليومية وأعمال القلوب والأذكار',
  },
  'sibaq-al-firdaws': {
    title: 'سباق الفردوس الأعلى',
    description: 'تطبيق إسلامي لتتبع العبادات اليومية وأعمال القلوب والأذكار',
    sourceSlug: 'sibaq',
  },
  'saghir-scientist': {
    title: 'العالِم الصغير - تطبيق تعليمي تفاعلي للأطفال',
    description:
      'تطبيق ويب عربي تفاعلي للأطفال يجمع الرياضيات واللغة العربية والإنجليزية والعلوم في أنشطة قصيرة ممتعة.',
  },
  sabab: {
    title: 'فَأَتْبَعَ سَبَبًا || Follow The Way',
    description: 'تطبيق عربي عملي لتنظيم المهام والأفكار وتقليل التشتت عبر مسار واحد قابل للتنفيذ.',
  },
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string }
}) {
  const app = APPS[params.slug]
  if (!app) return {}
  return { title: app.title, description: app.description }
}

export default function AppPage({
  params,
}: {
  params: { slug: string }
}) {
  const app = APPS[params.slug]
  if (!app) notFound()

  const appSrc = app.assetPath ?? `/apps/${app.sourceSlug ?? params.slug}/index.html`

  return (
    <iframe
      src={appSrc}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        border: 'none',
      }}
      title={app.title}
    />
  )
}
// ادناه عشان لو حبيب اضيف تطبيق تاني 
//  const APPS: Record<string, { title: string; description: string }> = {
//   sibaq: {
//     title: 'سباق الفردوس الأعلى',
//     description: 'تطبيق إسلامي لتتبع العبادات اليومية وأعمال القلوب والأذكار',
//   },
//   adhkar: {                           // ← السطر الجديد
//     title: 'تطبيق الأذكار',           // ← اسمه
//     description: 'أذكار الصباح والمساء', // ← وصفه
//   },
// }
