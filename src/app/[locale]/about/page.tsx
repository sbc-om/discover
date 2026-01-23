import { getTranslations } from 'next-intl/server';
import TopNavbar from '@/components/TopNavbar';
import ScrollArea from '@/components/ScrollArea';

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations('aboutPage');

  const cards = [
    {
      title: t('cards.mission.title'),
      description: t('cards.mission.body'),
    },
    {
      title: t('cards.approach.title'),
      description: t('cards.approach.body'),
    },
    {
      title: t('cards.promise.title'),
      description: t('cards.promise.body'),
    },
  ];

  return (
    <ScrollArea className="min-h-screen bg-gradient-to-br from-white via-zinc-50 to-zinc-100 dark:from-black dark:via-zinc-950 dark:to-zinc-900">
      <TopNavbar locale={locale as 'en' | 'ar'} />
      <div className="container mx-auto px-4 py-16">
        <section className="text-center text-zinc-900 dark:text-white mb-12">
          <h1 className="text-4xl md:text-5xl font-semibold mb-4">{t('hero.title')}</h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-300 max-w-2xl mx-auto">
            {t('hero.subtitle')}
          </p>
        </section>

        <section className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {cards.map((card) => (
            <div
              key={card.title}
              className="rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/80 dark:bg-white/10 p-6 text-zinc-900 dark:text-white ltr:text-left rtl:text-right"
            >
              <h2 className="text-lg font-semibold mb-2">{card.title}</h2>
              <p className="text-sm text-zinc-600 dark:text-zinc-300">{card.description}</p>
            </div>
          ))}
        </section>

        <section className="mt-14 text-center">
          <div className="max-w-3xl mx-auto rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/80 dark:bg-white/10 p-8">
            <h2 className="text-2xl font-semibold text-zinc-900 dark:text-white mb-3">
              {t('values.title')}
            </h2>
            <p className="text-sm md:text-base text-zinc-600 dark:text-zinc-300">
              {t('values.body')}
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              {[t('values.items.i1'), t('values.items.i2'), t('values.items.i3')].map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-zinc-200/80 dark:border-zinc-800/80 bg-white/90 dark:bg-white/5 px-4 py-2 text-xs font-semibold text-zinc-700 dark:text-zinc-200"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        </section>
      </div>
    </ScrollArea>
  );
}
