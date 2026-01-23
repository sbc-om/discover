import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import TopNavbar from '@/components/TopNavbar';
import ScrollArea from '@/components/ScrollArea';

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations('home');

  const highlights = [
    {
      title: t('highlights.h1.title'),
      description: t('highlights.h1.desc'),
      icon: (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 17l6-6 4 4 8-8" />
        </svg>
      ),
    },
    {
      title: t('highlights.h2.title'),
      description: t('highlights.h2.desc'),
      icon: (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 16v-2m8-6h-2M6 12H4" />
        </svg>
      ),
    },
    {
      title: t('highlights.h3.title'),
      description: t('highlights.h3.desc'),
      icon: (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-7 4h8m-6-8h4M4 6h16v12H4z" />
        </svg>
      ),
    },
  ];

  const steps = [
    {
      title: t('steps.s1.title'),
      description: t('steps.s1.desc'),
    },
    {
      title: t('steps.s2.title'),
      description: t('steps.s2.desc'),
    },
    {
      title: t('steps.s3.title'),
      description: t('steps.s3.desc'),
    },
  ];

  return (
    <ScrollArea className="min-h-screen bg-gradient-to-br from-white via-zinc-50 to-zinc-100 dark:from-black dark:via-zinc-950 dark:to-zinc-900">
      <TopNavbar locale={locale as 'en' | 'ar'} />
      <div className="container mx-auto px-4 py-16">
        <section className="text-center text-zinc-900 dark:text-white mb-16">
          <div className="flex justify-center mb-8">
            <div className="w-full max-w-xl md:max-w-2xl">
              <img
                src="/logo/dna-logo-b.svg"
                alt="Discover DNA"
                className="w-full h-auto dark:hidden"
              />
              <img
                src="/logo/dna-logo-w.svg"
                alt="Discover DNA"
                className="w-full h-auto hidden dark:block"
              />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-semibold mb-4">
            {t('hero.title')}
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-300 mb-6 max-w-2xl mx-auto">
            {t('hero.subtitle')}
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              href={`/${locale}/login`}
              className="px-6 py-3 bg-black text-white dark:bg-white dark:text-black rounded-lg font-semibold text-sm md:text-base hover:bg-zinc-900 dark:hover:bg-zinc-100 transition-colors"
            >
              {t('hero.primaryCta')}
            </Link>
            <Link
              href={`/${locale}/about`}
              className="px-6 py-3 bg-black/5 text-zinc-900 dark:bg-white/10 dark:text-white rounded-lg font-semibold text-sm md:text-base hover:bg-black/10 dark:hover:bg-white/20 transition-colors"
            >
              {t('hero.secondaryCta')}
            </Link>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-4">
            {t('hero.note')}
          </p>
        </section>

        <section className="mb-16">
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {highlights.map((item) => (
              <div
                key={item.title}
                className="bg-white/80 dark:bg-white/10 backdrop-blur-md rounded-2xl p-6 text-zinc-900 dark:text-white border border-zinc-200/80 dark:border-zinc-800/80 ltr:text-left rtl:text-right"
              >
                <div className="w-10 h-10 bg-zinc-900 text-white dark:bg-zinc-800 rounded-xl flex items-center justify-center mb-4">
                  {item.icon}
                </div>
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-300">{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-semibold text-zinc-900 dark:text-white mb-3">
              {t('steps.title')}
            </h2>
            <p className="text-sm md:text-base text-zinc-600 dark:text-zinc-300 max-w-xl mx-auto">
              {t('steps.subtitle')}
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-4 max-w-5xl mx-auto">
            {steps.map((step) => (
              <div
                key={step.title}
                className="rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/70 dark:bg-white/5 p-5 text-zinc-900 dark:text-white ltr:text-left rtl:text-right"
              >
                <h3 className="text-base font-semibold mb-2">{step.title}</h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-300">{step.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="text-center">
          <div className="max-w-2xl mx-auto bg-white/80 dark:bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-zinc-200/80 dark:border-zinc-800/80">
            <h2 className="text-2xl md:text-3xl font-semibold text-zinc-900 dark:text-white mb-3">
              {t('cta.title')}
            </h2>
            <p className="text-sm md:text-base text-zinc-600 dark:text-zinc-300 mb-6">
              {t('cta.subtitle')}
            </p>
            <Link
              href={`/${locale}/login`}
              className="inline-flex items-center justify-center px-6 py-3 bg-black text-white dark:bg-white dark:text-black rounded-lg font-semibold text-sm md:text-base hover:bg-zinc-900 dark:hover:bg-zinc-100 transition-colors"
            >
              {t('cta.button')}
            </Link>
          </div>
        </section>
      </div>
    </ScrollArea>
  );
}
