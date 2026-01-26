import Link from 'next/link';
import TopNavbar from '@/components/TopNavbar';
import ScrollArea from '@/components/ScrollArea';
import Footer from '@/components/Footer';
import { Target, Layers, Award, ArrowRight, BarChart3, Trophy, Zap } from 'lucide-react';

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isAr = locale === 'ar';

  const highlights = [
    {
      title: isAr ? 'تقييم دقيق' : 'Precise Assessment',
      description: isAr ? 'قياس موثق لقدرات اللاعبين' : 'Documented player ability measurement',
      icon: Target,
    },
    {
      title: isAr ? 'مراحل واضحة' : 'Clear Stages',
      description: isAr ? 'مسار تطوير منظم وفعّال' : 'Organized development path',
      icon: Layers,
    },
    {
      title: isAr ? 'تحفيز مستمر' : 'Continuous Motivation',
      description: isAr ? 'إنجازات وميداليات تحفيزية' : 'Achievements and medals',
      icon: Award,
    },
  ];

  const features = [
    {
      title: isAr ? 'تتبع التقدم' : 'Track Progress',
      icon: BarChart3,
    },
    {
      title: isAr ? 'نظام المكافآت' : 'Reward System',
      icon: Trophy,
    },
    {
      title: isAr ? 'سرعة وسهولة' : 'Fast & Easy',
      icon: Zap,
    },
  ];

  return (
    <ScrollArea className="min-h-screen bg-white dark:bg-zinc-950">
      <div className="min-h-screen flex flex-col">
        <TopNavbar locale={locale as 'en' | 'ar'} />
        
        {/* Hero Section */}
      <section className="relative min-h-[85vh] md:min-h-screen flex items-center justify-center overflow-hidden pt-16 md:pt-20">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-50 to-white dark:from-zinc-950 dark:to-zinc-900" />
        
        {/* Subtle Gradient */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-orange-500/5 dark:bg-orange-500/10 rounded-full blur-3xl" />

        <div className="container relative mx-auto px-4 sm:px-6 py-12 md:py-20">
          <div className="text-center max-w-4xl mx-auto">
            {/* Logo */}
            <div className="flex justify-center mb-8 md:mb-12">
              <div className="w-full max-w-[280px] sm:max-w-sm md:max-w-md">
                <img
                  src="/logo/dna-logo-b.svg"
                  alt="DNA - Discover Natural Ability"
                  className="w-full h-auto dark:hidden"
                />
                <img
                  src="/logo/dna-logo-w.svg"
                  alt="DNA - Discover Natural Ability"
                  className="w-full h-auto hidden dark:block"
                />
              </div>
            </div>

            {/* Main Heading */}
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-zinc-900 dark:text-white mb-4 md:mb-6 leading-tight px-4">
              {isAr
                ? 'نظام احترافي لتطوير اللاعبين'
                : 'Professional Player Development System'}
            </h1>

            <p className="text-base sm:text-lg md:text-xl text-zinc-600 dark:text-zinc-400 mb-8 md:mb-12 max-w-2xl mx-auto px-4">
              {isAr
                ? 'قياس دقيق • مراحل واضحة • تحفيز مستمر'
                : 'Precise Assessment • Clear Stages • Continuous Motivation'}
            </p>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center items-center px-4">
              <Link
                href={`/${locale}/login`}
                className="w-full sm:w-auto group inline-flex items-center justify-center gap-2 px-8 md:px-10 py-3.5 md:py-4 text-base md:text-lg font-bold text-white bg-orange-500 rounded-xl hover:bg-orange-600 transition-all shadow-lg hover:shadow-xl hover:scale-[1.02]"
              >
                {isAr ? 'ابدأ الآن' : 'Get Started'}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 rtl:rotate-180 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24 bg-white dark:bg-zinc-900">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto">
            {highlights.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="group p-6 md:p-8 rounded-2xl bg-zinc-50 dark:bg-zinc-800 hover:bg-orange-50 dark:hover:bg-orange-950/20 transition-all duration-300"
                >
                  <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-orange-500/10 dark:bg-orange-500/20 flex items-center justify-center mb-4 md:mb-5 group-hover:scale-110 transition-transform">
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
        </div>
      </section>

      {/* Quick Features */}
      <section className="py-12 md:py-16 bg-zinc-50 dark:bg-zinc-950">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex flex-wrap justify-center gap-4 md:gap-6 max-w-3xl mx-auto">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="flex items-center gap-3 px-5 md:px-6 py-3 md:py-3.5 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800"
                >
                  <Icon className="w-4 h-4 md:w-5 md:h-5 text-orange-500" strokeWidth={2} />
                  <span className="text-sm md:text-base font-semibold text-zinc-900 dark:text-white">
                    {feature.title}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

        {/* CTA Section */}
        <section className="py-16 md:py-24 bg-zinc-900 dark:bg-zinc-950">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4 md:mb-6 px-4">
                {isAr ? 'ابدأ رحلة التطوير الآن' : 'Start Your Development Journey'}
              </h2>
              <p className="text-base md:text-lg text-zinc-400 mb-8 md:mb-10 px-4">
                {isAr
                  ? 'انضم إلى مئات الأكاديميات'
                  : 'Join hundreds of academies'}
              </p>
              <Link
                href={`/${locale}/login`}
                className="inline-flex items-center justify-center gap-2 px-8 md:px-10 py-3.5 md:py-4 text-base md:text-lg font-bold text-zinc-900 bg-white rounded-xl hover:bg-zinc-100 transition-all shadow-xl hover:scale-[1.02]"
              >
                {isAr ? 'ابدأ مجاناً' : 'Start Free'}
                <ArrowRight className="w-5 h-5 rtl:rotate-180" />
              </Link>
            </div>
          </div>
        </section>

        <div className="mt-auto">
          <Footer locale={locale as 'en' | 'ar'} />
        </div>
      </div>
    </ScrollArea>
  );
}
