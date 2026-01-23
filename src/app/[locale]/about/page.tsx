import { getTranslations } from 'next-intl/server';
import TopNavbar from '@/components/TopNavbar';
import ScrollArea from '@/components/ScrollArea';
import Footer from '@/components/Footer';

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations('aboutPage');

  const systemItems = [
    {
      title: t('system.items.i1.title'),
      description: t('system.items.i1.body'),
    },
    {
      title: t('system.items.i2.title'),
      description: t('system.items.i2.body'),
    },
    {
      title: t('system.items.i3.title'),
      description: t('system.items.i3.body'),
    },
    {
      title: t('system.items.i4.title'),
      description: t('system.items.i4.body'),
    },
  ];

  return (
    <ScrollArea className="min-h-screen bg-gradient-to-br from-white via-zinc-50 to-zinc-100 dark:from-black dark:via-zinc-950 dark:to-zinc-900">
      <TopNavbar locale={locale as 'en' | 'ar'} />
      <div className="container mx-auto px-4 py-16">
        <section className="text-center text-zinc-900 dark:text-white mb-12">
          <p className="text-sm uppercase tracking-wide text-zinc-500 dark:text-zinc-400 mb-3">
            {t('hero.kicker')}
          </p>
          <h1 className="text-4xl md:text-5xl font-semibold mb-4">{t('hero.title')}</h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-300 max-w-3xl mx-auto">
            {t('hero.subtitle')}
          </p>
        </section>

        <section className="max-w-5xl mx-auto mb-12">
          <h2 className="text-2xl md:text-3xl font-semibold text-zinc-900 dark:text-white mb-4">
            {t('origin.title')}
          </h2>
          <p className="text-sm md:text-base text-zinc-600 dark:text-zinc-300">
            {t('origin.body')}
          </p>
        </section>

        <section className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto mb-12">
          <div className="rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/80 dark:bg-white/10 p-6 text-zinc-900 dark:text-white ltr:text-left rtl:text-right">
            <h2 className="text-xl font-semibold mb-2">{t('mission.title')}</h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-300">{t('mission.body')}</p>
          </div>
          <div className="rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/80 dark:bg-white/10 p-6 text-zinc-900 dark:text-white ltr:text-left rtl:text-right">
            <h2 className="text-xl font-semibold mb-2">{t('approach.title')}</h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-300">{t('approach.body')}</p>
          </div>
        </section>

        <section className="max-w-5xl mx-auto mb-12">
          <h2 className="text-2xl md:text-3xl font-semibold text-zinc-900 dark:text-white mb-4">
            {t('system.title')}
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {systemItems.map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/80 dark:bg-white/10 p-6 text-zinc-900 dark:text-white ltr:text-left rtl:text-right"
              >
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-300">{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="max-w-5xl mx-auto mb-12">
          <h2 className="text-2xl md:text-3xl font-semibold text-zinc-900 dark:text-white mb-4">
            {t('team.title')}
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {[t('team.members.m1'), t('team.members.m2')].map((member) => (
              <div
                key={member}
                className="rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/80 dark:bg-white/10 p-5 text-zinc-900 dark:text-white"
              >
                <p className="text-sm font-semibold">{member}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
      <Footer locale={locale as 'en' | 'ar'} />
    </ScrollArea>
  );
}
