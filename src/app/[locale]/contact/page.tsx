import { getTranslations } from 'next-intl/server';
import TopNavbar from '@/components/TopNavbar';
import ScrollArea from '@/components/ScrollArea';
import Footer from '@/components/Footer';

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations('contactPage');

  const cards = [
    {
      title: t('cards.email.title'),
      value: t('cards.email.value'),
    },
    {
      title: t('cards.phone.title'),
      value: t('cards.phone.value'),
    },
    {
      title: t('cards.location.title'),
      value: t('cards.location.value'),
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
              <p className="text-sm text-zinc-600 dark:text-zinc-300">{card.value}</p>
            </div>
          ))}
        </section>

        <section className="mt-14 text-center">
          <div className="max-w-2xl mx-auto rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/80 dark:bg-white/10 p-8">
            <h2 className="text-2xl font-semibold text-zinc-900 dark:text-white mb-3">
              {t('cta.title')}
            </h2>
            <p className="text-sm md:text-base text-zinc-600 dark:text-zinc-300 mb-6">
              {t('cta.subtitle')}
            </p>
            <a
              href="mailto:info@discovernaturalability.com"
              className="inline-flex items-center justify-center px-6 py-3 bg-black text-white dark:bg-white dark:text-black rounded-lg font-semibold text-sm md:text-base hover:bg-zinc-900 dark:hover:bg-zinc-100 transition-colors"
            >
              {t('cta.button')}
            </a>
          </div>
        </section>
      </div>
      <Footer locale={locale as 'en' | 'ar'} />
    </ScrollArea>
  );
}
