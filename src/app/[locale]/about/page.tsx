import TopNavbar from '@/components/TopNavbar';
import ScrollArea from '@/components/ScrollArea';
import Footer from '@/components/Footer';

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isAr = locale === 'ar';

  const systemItems = [
    {
      title: isAr ? 'تقييم ميداني' : 'Field-Based Evaluation',
      description: isAr
        ? 'يتم تقييم كل طالب فعليًا من قِبل مدربه على المهارات الحقيقية — لا الأعمار — باستخدام مؤشرات موحدة.'
        : 'Every student is evaluated in-person by their coach on real skills — not age — using standardized criteria.',
    },
    {
      title: isAr ? 'مراحل تطور واضحة' : 'Clear Progression Stages',
      description: isAr
        ? 'تتدرج المراحل من White إلى Black، بحيث يمكن لأي طالب أو ولي أمر أو مدرب معرفة الموقف الحالي بدقة.'
        : 'Stages progress from White to Black, giving students, parents, and coaches an instant snapshot of progress.',
    },
    {
      title: isAr ? 'نظام تحفيز ذكي' : 'Smart Motivation System',
      description: isAr
        ? 'عند اجتياز كل مرحلة، يحصل الطالب على إنجاز رقمي وميدالية رسمية، تعزز الفخر والانتماء.'
        : 'When a stage is passed, the student receives a digital badge and an official medal — reinforcing pride and belonging.',
    },
    {
      title: isAr ? 'اندماج كامل' : 'Full Integration',
      description: isAr
        ? 'لا يُغيّر النظام المناهج أو أساليب التدريب، بل يُضيف طبقة تتبع بصرية فوق البرنامج القائم.'
        : "The system doesn't change curricula. It adds a visual tracking layer over your existing program.",
    },
  ];

  const teamMembers = [
    isAr ? 'مهند السليماني – مؤسس' : 'Mohannad Sulimani – Founder',
    isAr ? 'طلال ناجي – شريك مؤسس ومدير تنفيذي' : 'Talal Naji – Co-Founder & CEO',
  ];

  return (
    <ScrollArea className="min-h-screen bg-gradient-to-br from-white via-zinc-50 to-zinc-100 dark:from-black dark:via-zinc-950 dark:to-zinc-900">
      <TopNavbar locale={locale as 'en' | 'ar'} />
      <div className="container mx-auto px-4 py-16">
        <section className="text-center text-zinc-900 dark:text-white mb-12">
          <p className="text-sm uppercase tracking-wide text-zinc-500 dark:text-zinc-400 mb-3">
            {isAr ? 'قصتنا' : 'Our Story'}
          </p>
          <h1 className="text-4xl md:text-5xl font-semibold mb-4">
            {isAr ? 'عن Discover' : 'About Discover'}
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-300 max-w-3xl mx-auto">
            {isAr
              ? 'نظام قياس وتحفيز يناسب أي رياضة، أي برنامج، أي عمر.'
              : 'A measurement and motivation system that fits any sport, any program, any age.'}
          </p>
        </section>

        <section className="max-w-5xl mx-auto mb-12">
          <h2 className="text-2xl md:text-3xl font-semibold text-zinc-900 dark:text-white mb-4">
            {isAr ? 'البداية' : 'The Origin'}
          </h2>
          <p className="text-sm md:text-base text-zinc-600 dark:text-zinc-300">
            {isAr
              ? 'بدأ Discover من سؤال بسيط: لماذا لا تملك معظم الأكاديميات الرياضية طريقة واضحة لقياس تقدم طلابها؟ بعد سنوات من الخبرة في مجال التدريب والأعمال، أنشأنا نظامًا لا يتطلب تغيير البرنامج — بل يُضيف وضوحًا فوق ما هو موجود أصلاً.'
              : "Discover began from a simple question: why don't most sports academies have a clear way to measure student progress? After years in coaching and business, we built a system that doesn't require changing the program — just adds clarity on top of what already exists."}
          </p>
        </section>

        <section className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto mb-12">
          <div className="rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/80 dark:bg-white/10 p-6 text-zinc-900 dark:text-white ltr:text-left rtl:text-right">
            <h2 className="text-xl font-semibold mb-2">
              {isAr ? 'رسالتنا' : 'Our Mission'}
            </h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-300">
              {isAr
                ? 'توفير بنية قياس مرنة يمكن لأي أكاديمية رياضية استخدامها لتوضيح التقدم، تحفيز الطلاب، وزيادة الاحتفاظ — بدون تعقيد.'
                : 'To provide a flexible measurement framework that any sports academy can use to show progress, motivate students, and increase retention — without complexity.'}
            </p>
          </div>
          <div className="rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/80 dark:bg-white/10 p-6 text-zinc-900 dark:text-white ltr:text-left rtl:text-right">
            <h2 className="text-xl font-semibold mb-2">
              {isAr ? 'منهجنا' : 'Our Approach'}
            </h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-300">
              {isAr
                ? 'Discover ليس منهجًا بديلاً، بل طبقة تُدمج مع ما تقوم به فعلاً. نحن ندعم المدرب لا نستبدله.'
                : "Discover isn't a replacement curriculum — it's a layer that integrates with what you already do. We support the coach, not replace them."}
            </p>
          </div>
        </section>

        <section className="max-w-5xl mx-auto mb-12">
          <h2 className="text-2xl md:text-3xl font-semibold text-zinc-900 dark:text-white mb-4">
            {isAr ? 'كيف يعمل النظام' : 'How the System Works'}
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
            {isAr ? 'الفريق' : 'The Team'}
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {teamMembers.map((member) => (
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
