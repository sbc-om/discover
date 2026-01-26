import TopNavbar from '@/components/TopNavbar';
import ScrollArea from '@/components/ScrollArea';
import Footer from '@/components/Footer';
import { Target, Users, Award, Shield } from 'lucide-react';

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isAr = locale === 'ar';

  const features = [
    {
      title: isAr ? 'تقييم دقيق' : 'Precise Assessment',
      description: isAr ? 'قياس احترافي لمهارات اللاعبين' : 'Professional measurement of player skills',
      icon: Target,
    },
    {
      title: isAr ? 'مراحل واضحة' : 'Clear Stages',
      description: isAr ? 'مسار تطوير منظم' : 'Organized development path',
      icon: Award,
    },
    {
      title: isAr ? 'تحفيز فعال' : 'Effective Motivation',
      description: isAr ? 'نظام مكافآت محفز' : 'Motivating reward system',
      icon: Shield,
    },
  ];

  return (
    <ScrollArea className="min-h-screen bg-white dark:bg-zinc-950">
      <div className="min-h-screen flex flex-col">
        <TopNavbar locale={locale as 'en' | 'ar'} />
        
        <main className="pt-16 md:pt-20 pb-16 flex-1">
        {/* Hero Section */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4 sm:px-6 max-w-4xl">
            <div className="text-center">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-zinc-900 dark:text-white mb-4 md:mb-6">
                {isAr ? 'عن Discover' : 'About Discover'}
              </h1>
              <p className="text-lg md:text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
                {isAr
                  ? 'نظام قياس وتحفيز احترافي للأكاديميات الرياضية'
                  : 'Professional measurement and motivation system for sports academies'}
              </p>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 sm:px-6">
          {/* Story */}
          <section className="mb-16 md:mb-20 max-w-3xl mx-auto">
            <div className="bg-zinc-50 dark:bg-zinc-900 rounded-2xl p-8 md:p-10">
              <h2 className="text-2xl md:text-3xl font-bold text-zinc-900 dark:text-white mb-4 md:mb-6">
                {isAr ? 'مهمتنا' : 'Our Mission'}
              </h2>
              <p className="text-base md:text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed mb-4">
                {isAr
                  ? 'نوفر نظامًا احترافيًا لقياس تقدم اللاعبين وتحفيزهم بطريقة واضحة ومنظمة.'
                  : 'We provide a professional system to measure player progress and motivate them in a clear and organized way.'}
              </p>
              <p className="text-base md:text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed">
                {isAr
                  ? 'Discover يضيف طبقة احترافية فوق برنامجك الحالي دون تغيير المناهج.'
                  : 'Discover adds a professional layer on top of your current program without changing curricula.'}
              </p>
            </div>
          </section>

          {/* Features */}
          <section className="mb-16 md:mb-20">
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto">
              {features.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.title}
                    className="p-6 md:p-8 rounded-2xl bg-zinc-50 dark:bg-zinc-900 hover:bg-orange-50 dark:hover:bg-orange-950/20 transition-all"
                  >
                    <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-orange-500/10 dark:bg-orange-500/20 flex items-center justify-center mb-4 md:mb-5">
                      <Icon className="w-6 h-6 md:w-7 md:h-7 text-orange-600 dark:text-orange-400" strokeWidth={2} />
                    </div>
                    <h3 className="text-lg md:text-xl font-bold text-zinc-900 dark:text-white mb-2">
                      {item.title}
                    </h3>
                    <p className="text-sm md:text-base text-zinc-600 dark:text-zinc-400">
                      {item.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Team */}
          <section className="max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-zinc-900 dark:text-white mb-8 md:mb-10 text-center">
              {isAr ? 'الفريق' : 'Team'}
            </h2>
            <div className="grid sm:grid-cols-2 gap-6 md:gap-8">
              <div className="bg-zinc-50 dark:bg-zinc-900 rounded-2xl p-8 text-center">
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-orange-500 flex items-center justify-center mx-auto mb-4 md:mb-5">
                  <span className="text-xl md:text-2xl font-bold text-white">
                    {isAr ? 'ط' : 'T'}
                  </span>
                </div>
                <h3 className="text-lg md:text-xl font-bold text-zinc-900 dark:text-white mb-1">
                  {isAr ? 'طلال ناجي' : 'Talal Naji'}
                </h3>
                <p className="text-sm md:text-base text-orange-600 dark:text-orange-400 font-semibold">
                  {isAr ? 'مؤسس' : 'Founder'}
                </p>
              </div>
              <div className="bg-zinc-50 dark:bg-zinc-900 rounded-2xl p-8 text-center">
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-orange-500 flex items-center justify-center mx-auto mb-4 md:mb-5">
                  <span className="text-xl md:text-2xl font-bold text-white">
                    {isAr ? 'م' : 'M'}
                  </span>
                </div>
                <h3 className="text-lg md:text-xl font-bold text-zinc-900 dark:text-white mb-1">
                  {isAr ? 'مهند السليماني' : 'Mohannad Sulimani'}
                </h3>
                <p className="text-sm md:text-base text-orange-600 dark:text-orange-400 font-semibold">
                  {isAr ? 'شريك مؤسس' : 'Co-Founder'}
                </p>
              </div>
            </div>
          </section>
        </div>
        </main>

        <Footer locale={locale as 'en' | 'ar'} />
      </div>
    </ScrollArea>
  );
}
