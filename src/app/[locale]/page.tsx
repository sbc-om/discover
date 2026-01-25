import Link from 'next/link';
import TopNavbar from '@/components/TopNavbar';
import ScrollArea from '@/components/ScrollArea';
import Footer from '@/components/Footer';
import { Target, Layers, Award, ArrowRight, Users, TrendingUp, Sparkles, BarChart3, Trophy } from 'lucide-react';

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isAr = locale === 'ar';

  const highlights = [
    {
      title: isAr ? 'تقييم ميداني' : 'Field Assessment',
      description: isAr ? 'قياس حقيقي وموثق لقدرات كل لاعب من خلال تقييمات احترافية' : 'Real, documented measurement of each player through professional assessments',
      icon: Target,
      gradient: 'from-blue-500 to-cyan-500',
      bgGradient: 'from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30',
    },
    {
      title: isAr ? 'مراحل واضحة' : 'Clear Stages',
      description: isAr ? 'نظام مراحل منظم وسهل الفهم مع مسارات تطوير واضحة' : 'Organized, easy-to-understand stage system with clear development paths',
      icon: Layers,
      gradient: 'from-violet-500 to-purple-500',
      bgGradient: 'from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30',
    },
    {
      title: isAr ? 'تحفيز ذكي' : 'Smart Recognition',
      description: isAr ? 'إنجازات رقمية وميداليات حقيقية لتحفيز مستمر وفعال' : 'Digital achievements and real medals for continuous, effective motivation',
      icon: Award,
      gradient: 'from-amber-500 to-orange-500',
      bgGradient: 'from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30',
    },
  ];

  const features = [
    {
      title: isAr ? 'تتبع التقدم' : 'Progress Tracking',
      description: isAr ? 'راقب تطور كل لاعب بدقة عبر الزمن' : 'Monitor each player\'s development accurately over time',
      icon: BarChart3,
    },
    {
      title: isAr ? 'تحفيز فعال' : 'Effective Motivation',
      description: isAr ? 'نظام مكافآت يحفز اللاعبين للوصول لأهدافهم' : 'Reward system that motivates players to reach their goals',
      icon: Trophy,
    },
    {
      title: isAr ? 'تجربة متميزة' : 'Premium Experience',
      description: isAr ? 'واجهة سهلة وحديثة للمدربين واللاعبين' : 'Easy, modern interface for coaches and players',
      icon: Sparkles,
    },
  ];

  const steps = [
    {
      step: '01',
      title: isAr ? 'قياس' : 'Assess',
      description: isAr ? 'تقييم واقعي داخل الأكاديمية' : 'Real assessment within the academy',
      icon: TrendingUp,
    },
    {
      step: '02',
      title: isAr ? 'توزيع' : 'Assign',
      description: isAr ? 'مرحلة حسب القدرة الفعلية' : 'Stage based on actual ability',
      icon: Users,
    },
    {
      step: '03',
      title: isAr ? 'توثيق' : 'Recognize',
      description: isAr ? 'إنجاز موثق وميدالية' : 'Documented achievement + medal',
      icon: Award,
    },
  ];

  return (
    <ScrollArea className="min-h-screen bg-white dark:bg-zinc-950">
      <TopNavbar locale={locale as 'en' | 'ar'} />
      
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        {/* Advanced Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-50 via-white to-zinc-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950" />
        
        {/* Animated Gradient Orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-blue-500/10 via-violet-500/10 to-transparent rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-br from-orange-500/10 via-amber-500/10 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />

        <div className="container relative mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="text-center max-w-5xl mx-auto">
            {/* Logo with Animation */}
            <div className="flex justify-center mb-10 animate-float-soft">
              <div className="w-full max-w-md md:max-w-lg relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-violet-500/20 to-orange-500/20 blur-3xl" />
                <img
                  src="/logo/dna-logo-b.svg"
                  alt="DNA - Discover Natural Ability"
                  className="w-full h-auto dark:hidden relative"
                />
                <img
                  src="/logo/dna-logo-w.svg"
                  alt="DNA - Discover Natural Ability"
                  className="w-full h-auto hidden dark:block relative"
                />
              </div>
            </div>

            {/* Slogan with Badge */}
            <div className="mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-orange-100 to-amber-100 dark:from-orange-950/50 dark:to-amber-950/50 border border-orange-200 dark:border-orange-900">
              <Sparkles className="w-4 h-4 text-orange-600 dark:text-orange-400" />
              <span className="text-sm font-semibold text-orange-700 dark:text-orange-300">
                {isAr ? 'نظام احترافي للأكاديميات الرياضية' : 'Professional System for Sports Academies'}
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl text-zinc-700 dark:text-zinc-300 mb-12 max-w-2xl mx-auto leading-relaxed">
              {isAr
                ? 'نظام قياس وتحفيز متكامل يساعد الأكاديميات على تطوير لاعبيها بطريقة احترافية ومنظمة'
                : 'An integrated measurement and motivation system that helps academies develop their players professionally and systematically'}
            </h1>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <Link
                href={`/${locale}/login`}
                className="group inline-flex items-center gap-3 px-10 py-4 text-base font-bold text-white bg-gradient-to-r from-orange-500 to-amber-600 rounded-2xl hover:from-orange-600 hover:to-amber-700 transition-all shadow-lg hover:shadow-xl hover:shadow-orange-500/25 hover:scale-105"
              >
                {isAr ? 'ابدأ الآن' : 'Get Started'}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 rtl:rotate-180 transition-transform" />
              </Link>
              <Link
                href={`/${locale}/about`}
                className="inline-flex items-center gap-3 px-10 py-4 text-base font-bold text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-800 border-2 border-zinc-200 dark:border-zinc-700 rounded-2xl hover:border-zinc-300 dark:hover:border-zinc-600 transition-all hover:scale-105"
              >
                {isAr ? 'اعرف المزيد' : 'Learn More'}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Highlights Section */}
      <section className="py-24 md:py-32 bg-white dark:bg-zinc-950">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 dark:text-white mb-4">
              {isAr ? 'لماذا Discover؟' : 'Why Discover?'}
            </h2>
            <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
              {isAr
                ? 'نظام متكامل يجمع بين القياس الدقيق والتحفيز الفعال'
                : 'An integrated system combining accurate measurement with effective motivation'}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-10 max-w-6xl mx-auto">
            {highlights.map((item, index) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="group relative"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Gradient Background Effect */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${item.bgGradient} rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                  
                  {/* Card */}
                  <div className="relative bg-white dark:bg-zinc-900 rounded-3xl p-8 h-full border-2 border-zinc-100 dark:border-zinc-800 group-hover:border-transparent transition-all duration-300 group-hover:scale-[1.02]">
                    {/* Icon Container */}
                    <div className="mb-6">
                      <div className={`inline-flex w-16 h-16 rounded-2xl bg-gradient-to-br ${item.gradient} p-0.5`}>
                        <div className="w-full h-full bg-white dark:bg-zinc-900 rounded-2xl flex items-center justify-center group-hover:bg-transparent transition-colors duration-300">
                          <Icon className="w-7 h-7 text-zinc-700 dark:text-zinc-300 group-hover:text-white transition-colors duration-300" strokeWidth={2} />
                        </div>
                      </div>
                    </div>
                    
                    {/* Content */}
                    <h3 className="text-2xl font-bold text-zinc-900 dark:text-white mb-4">
                      {item.title}
                    </h3>
                    <p className="text-base text-zinc-600 dark:text-zinc-400 leading-relaxed">
                      {item.description}
                    </p>

                    {/* Bottom Gradient Line */}
                    <div className={`absolute bottom-0 left-0 right-0 h-1.5 bg-gradient-to-r ${item.gradient} rounded-b-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 md:py-28 bg-gradient-to-b from-white via-zinc-50 to-white dark:from-zinc-950 dark:via-zinc-900/50 dark:to-zinc-950">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="group relative p-8 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-orange-200 dark:hover:border-orange-900 transition-all duration-300 hover:scale-105"
                >
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-950 dark:to-amber-950 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                    <Icon className="w-7 h-7 text-orange-600 dark:text-orange-400" strokeWidth={2} />
                  </div>
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="relative py-20 md:py-32 bg-white dark:bg-zinc-950 overflow-hidden">
        {/* Background Decoration */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-orange-50/30 to-transparent dark:via-orange-950/10" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-br from-orange-500/5 via-amber-500/5 to-transparent rounded-full blur-3xl" />
        
        <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 dark:text-white mb-4">
              {isAr ? 'كيف يعمل' : 'How it Works'}
            </h2>
            <p className="text-lg text-zinc-600 dark:text-zinc-400">
              {isAr ? 'ثلاث خطوات بسيطة' : 'Three simple steps'}
            </p>
          </div>

          <div className="max-w-5xl mx-auto" dir="ltr">
            <div className="flex flex-col md:flex-row items-stretch justify-center gap-6 md:gap-0">
              {steps.map((item, index) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="flex items-center flex-1">
                    {/* Step Card */}
                    <div className="relative group flex flex-col items-center text-center w-full px-6 py-8">
                      {/* Card Background */}
                      <div className="absolute inset-0 bg-gradient-to-br from-white via-zinc-50 to-white dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-900 rounded-3xl border-2 border-zinc-200 dark:border-zinc-700 group-hover:border-orange-300 dark:group-hover:border-orange-700 transition-all duration-300 group-hover:scale-105" />
                      
                      {/* Step Number Badge */}
                      <div className="relative mb-5">
                        <div className="absolute inset-0 bg-gradient-to-br from-orange-400 to-amber-500 rounded-2xl blur-lg opacity-40 group-hover:opacity-60 transition-opacity" />
                        <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                          <Icon className="w-9 h-9 text-white" strokeWidth={2.5} />
                        </div>
                      </div>

                      {/* Step Number */}
                      <div className="relative text-sm font-black text-orange-500 dark:text-orange-400 mb-3 tracking-wider">
                        {item.step}
                      </div>

                      {/* Title */}
                      <h3 className="relative text-xl font-bold text-zinc-900 dark:text-white mb-3">
                        {item.title}
                      </h3>

                      {/* Description */}
                      <p className="relative text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                        {item.description}
                      </p>

                      {/* Progress Indicator */}
                      <div className="relative mt-6 w-16 h-1 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                    
                    {/* Animated Arrow between steps */}
                    {index < steps.length - 1 && (
                      <div className="hidden md:flex items-center justify-center -mx-3 z-10">
                        <div className="relative">
                          <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-amber-400 rounded-full blur-md opacity-30" />
                          <div className="relative w-12 h-12 bg-white dark:bg-zinc-900 rounded-full flex items-center justify-center border-2 border-orange-200 dark:border-orange-900">
                            <ArrowRight className="w-5 h-5 text-orange-500 dark:text-orange-400 animate-pulse" strokeWidth={3} />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-28 md:py-36 bg-zinc-900 dark:bg-zinc-950 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-950/20 via-transparent to-amber-950/20" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-gradient-to-br from-orange-500/10 via-amber-500/10 to-transparent rounded-full blur-3xl" />
        
        <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="mb-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-orange-950/50 border border-orange-900/50">
              <Sparkles className="w-4 h-4 text-orange-400" />
              <span className="text-sm font-semibold text-orange-300">
                {isAr ? 'انضم إلينا الآن' : 'Join Us Now'}
              </span>
            </div>

            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              {isAr ? 'جاهز لتطوير أكاديميتك؟' : 'Ready to Elevate Your Academy?'}
            </h2>
            <p className="text-xl md:text-2xl text-zinc-300 mb-12 max-w-3xl mx-auto leading-relaxed">
              {isAr
                ? 'انضم إلى مئات الأكاديميات التي تستخدم Discover لتطوير لاعبيها بشكل احترافي ومنظم'
                : 'Join hundreds of academies using Discover to develop their players professionally and systematically'}
            </p>
            <div className="flex flex-col sm:flex-row gap-5 justify-center items-center">
              <Link
                href={`/${locale}/login`}
                className="group inline-flex items-center justify-center gap-3 px-10 py-5 text-lg font-bold text-zinc-900 bg-white rounded-2xl hover:bg-zinc-100 transition-all shadow-2xl hover:shadow-white/20 hover:scale-105"
              >
                {isAr ? 'ابدأ مجاناً' : 'Start Free'}
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 rtl:rotate-180 transition-transform" />
              </Link>
              <Link
                href={`/${locale}/contact`}
                className="inline-flex items-center justify-center gap-3 px-10 py-5 text-lg font-bold text-white border-2 border-zinc-700 rounded-2xl hover:bg-zinc-800 hover:border-zinc-600 transition-all"
              >
                {isAr ? 'تواصل معنا' : 'Contact Us'}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer locale={locale as 'en' | 'ar'} />
    </ScrollArea>
  );
}
