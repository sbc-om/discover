import TopNavbar from '@/components/TopNavbar';
import ScrollArea from '@/components/ScrollArea';
import Footer from '@/components/Footer';

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isAr = locale === 'ar';

  const cards = [
    {
      title: isAr ? 'البريد الإلكتروني' : 'Email',
      value: 'info@discovernaturalability.com',
    },
    {
      title: isAr ? 'الهاتف' : 'Phone',
      value: '+968 7772 2112',
    },
    {
      title: isAr ? 'الموقع' : 'Location',
      value: isAr ? 'مسقط، عُمان' : 'Muscat, Oman',
    },
  ];

  return (
    <ScrollArea className="min-h-screen bg-gradient-to-br from-white via-zinc-50 to-zinc-100 dark:from-black dark:via-zinc-950 dark:to-zinc-900">
      <TopNavbar locale={locale as 'en' | 'ar'} />
      <div className="container mx-auto px-4 py-16">
        <section className="text-center text-zinc-900 dark:text-white mb-12">
          <h1 className="text-4xl md:text-5xl font-semibold mb-4">
            {isAr ? 'تواصل معنا' : 'Contact Us'}
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-300 max-w-2xl mx-auto">
            {isAr
              ? 'نحب نسمع منك. تواصل معنا لمعرفة المزيد عن Discover أو لبدء شراكة.'
              : "We'd love to hear from you. Reach out to learn more about Discover or to start a partnership."}
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
              {isAr ? 'مستعد للبداية؟' : 'Ready to get started?'}
            </h2>
            <p className="text-sm md:text-base text-zinc-600 dark:text-zinc-300 mb-6">
              {isAr
                ? 'أرسل لنا بريدًا إلكترونيًا وسيتواصل معك فريقنا خلال ٢٤ ساعة.'
                : "Send us an email and our team will get back to you within 24 hours."}
            </p>
            <a
              href="mailto:info@discovernaturalability.com"
              className="inline-flex items-center justify-center px-6 py-3 bg-black text-white dark:bg-white dark:text-black rounded-lg font-semibold text-sm md:text-base hover:bg-zinc-900 dark:hover:bg-zinc-100 transition-colors"
            >
              {isAr ? 'أرسل بريدًا إلكترونيًا' : 'Send an Email'}
            </a>
          </div>
        </section>
      </div>
      <Footer locale={locale as 'en' | 'ar'} />
    </ScrollArea>
  );
}
