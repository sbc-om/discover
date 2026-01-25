import TopNavbar from '@/components/TopNavbar';
import ScrollArea from '@/components/ScrollArea';
import Footer from '@/components/Footer';
import { Target, Users, Award, Zap, Shield, TrendingUp, Sparkles } from 'lucide-react';

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
        ? 'يتم تقييم كل طالب فعليًا من قِبل مدربه على المهارات الحقيقية بطريقة احترافية ودقيقة'
        : 'Every student is evaluated in-person by their coach on real skills professionally and accurately',
      icon: Target,
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      title: isAr ? 'مراحل تطور واضحة' : 'Clear Progression',
      description: isAr
        ? 'تتدرج المراحل بحيث يمكن للجميع معرفة الموقف الحالي ومتابعة التطور'
        : 'Stages progress clearly, giving everyone an instant snapshot and development tracking',
      icon: TrendingUp,
      gradient: 'from-violet-500 to-purple-500',
    },
    {
      title: isAr ? 'نظام تحفيز متقدم' : 'Advanced Motivation System',
      description: isAr
        ? 'إنجازات رقمية وميداليات رسمية تعزز الفخر والانتماء بشكل فعال'
        : 'Digital badges and official medals effectively reinforce pride and belonging',
      icon: Award,
      gradient: 'from-amber-500 to-orange-500',
    },
    {
      title: isAr ? 'اندماج كامل' : 'Full Integration',
      description: isAr
        ? 'لا يُغيّر النظام المناهج، بل يُضيف طبقة تتبع احترافية فوق برنامجك الحالي'
        : 'Adds a professional tracking layer over your existing program without changing curricula',
      icon: Zap,
      gradient: 'from-green-500 to-emerald-500',
    },
  ];

  const values = [
    {
      title: isAr ? 'الجودة' : 'Quality',
      description: isAr ? 'نلتزم بأعلى معايير الجودة في كل ما نقدمه' : 'We commit to the highest quality standards in everything we deliver',
      icon: Shield,
    },
    {
      title: isAr ? 'الابتكار' : 'Innovation',
      description: isAr ? 'نبتكر حلولاً عملية تلبي احتياجات الأكاديميات' : 'We innovate practical solutions that meet academy needs',
      icon: Sparkles,
    },
    {
      title: isAr ? 'الشراكة' : 'Partnership',
      description: isAr ? 'نعمل كشركاء حقيقيين مع عملائنا لتحقيق النجاح' : 'We work as true partners with our clients to achieve success',
      icon: Users,
    },
  ];

  return (
    <ScrollArea className="min-h-screen bg-white dark:bg-zinc-950">
      <TopNavbar locale={locale as 'en' | 'ar'} />
      
      <main className="pt-24 pb-20">
        {/* Hero Section */}
        <section className="relative py-20 md:py-28 overflow-hidden">
          {/* Background */}
          <div className="absolute inset-0 bg-gradient-to-b from-zinc-50 via-white to-transparent dark:from-zinc-900 dark:via-zinc-950 dark:to-transparent" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-orange-500/5 via-violet-500/5 to-transparent rounded-full blur-3xl" />

          <div className="container relative mx-auto px-4 max-w-5xl">
            <div className="text-center mb-12">
              {/* Badge */}
              <div className="mb-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-orange-100 to-amber-100 dark:from-orange-950/50 dark:to-amber-950/50 border border-orange-200 dark:border-orange-900">
                <Sparkles className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                <span className="text-sm font-semibold text-orange-700 dark:text-orange-300">
                  {isAr ? 'عن Discover' : 'About Discover'}
                </span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-zinc-900 dark:text-white mb-6 leading-tight">
                {isAr ? 'نظام قياس وتحفيز احترافي' : 'Professional Measurement & Motivation System'}
              </h1>
              <p className="text-xl md:text-2xl text-zinc-600 dark:text-zinc-400 max-w-3xl mx-auto leading-relaxed">
                {isAr
                  ? 'نظام يناسب أي رياضة، أي برنامج، أي عمر - مصمم خصيصاً للأكاديميات الرياضية'
                  : 'A system that fits any sport, any program, any age - specially designed for sports academies'}
              </p>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 max-w-6xl">
          {/* Origin Story */}
          <section className="mb-24">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 dark:text-white mb-6">
                  {isAr ? 'البداية' : 'The Origin'}
                </h2>
                <div className="space-y-4 text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  <p>
                    {isAr
                      ? 'بدأ Discover من سؤال بسيط: لماذا لا تملك معظم الأكاديميات الرياضية طريقة واضحة ومنظمة لقياس تقدم طلابها؟'
                      : "Discover began from a simple question: why don't most sports academies have a clear, organized way to measure student progress?"}
                  </p>
                  <p>
                    {isAr
                      ? 'بعد سنوات من الخبرة في مجال التدريب الرياضي، أنشأنا نظامًا متكاملاً يُضيف وضوحًا واحترافية فوق ما هو موجود بالفعل.'
                      : 'After years of experience in sports training, we built an integrated system that adds clarity and professionalism to what already exists.'}
                  </p>
                </div>
              </div>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-violet-500/10 rounded-3xl blur-2xl" />
                <div className="relative bg-gradient-to-br from-zinc-50 to-white dark:from-zinc-900 dark:to-zinc-800 rounded-3xl p-10 border border-zinc-200 dark:border-zinc-800">
                  <div className="text-center py-8">
                    <p className="text-xl text-zinc-700 dark:text-zinc-300 leading-relaxed">
                      {isAr
                        ? 'نظام احترافي مصمم لمساعدة الأكاديميات الرياضية على قياس وتطوير مهارات لاعبيها بطريقة منهجية وواضحة'
                        : 'A professional system designed to help sports academies measure and develop their players\' skills in a systematic and clear way'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Mission & Vision */}
          <section className="mb-24">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-amber-500/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative bg-white dark:bg-zinc-900 rounded-3xl p-10 border-2 border-zinc-100 dark:border-zinc-800 group-hover:border-orange-200 dark:group-hover:border-orange-900 transition-all duration-300">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center mb-6">
                    <Target className="w-8 h-8 text-white" strokeWidth={2.5} />
                  </div>
                  <h3 className="text-2xl font-bold text-zinc-900 dark:text-white mb-4">
                    {isAr ? 'رسالتنا' : 'Our Mission'}
                  </h3>
                  <p className="text-base text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    {isAr
                      ? 'توفير بنية قياس مرنة واحترافية لتوضيح التقدم وتحفيز الطلاب في جميع الأكاديميات الرياضية'
                      : 'Provide a flexible, professional measurement framework to show progress and motivate students in all sports academies'}
                  </p>
                </div>
              </div>
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 to-purple-500/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative bg-white dark:bg-zinc-900 rounded-3xl p-10 border-2 border-zinc-100 dark:border-zinc-800 group-hover:border-violet-200 dark:group-hover:border-violet-900 transition-all duration-300">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mb-6">
                    <Sparkles className="w-8 h-8 text-white" strokeWidth={2.5} />
                  </div>
                  <h3 className="text-2xl font-bold text-zinc-900 dark:text-white mb-4">
                    {isAr ? 'منهجنا' : 'Our Approach'}
                  </h3>
                  <p className="text-base text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    {isAr
                      ? 'Discover طبقة احترافية تُدمج مع ما تقوم به. ندعم المدرب ونعزز عمله لا نستبدله'
                      : "Discover is a professional layer that integrates with what you do. We support and enhance the coach's work, not replace it"}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* How it Works */}
          <section className="mb-24">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 dark:text-white mb-4">
                {isAr ? 'كيف يعمل' : 'How it Works'}
              </h2>
              <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
                {isAr
                  ? 'نظام متكامل يجمع بين أفضل الممارسات في القياس والتحفيز'
                  : 'An integrated system combining best practices in measurement and motivation'}
              </p>
            </div>
            <div className="grid sm:grid-cols-2 gap-6">
              {systemItems.map((item, index) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.title}
                    className="group relative"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-zinc-100 to-zinc-50 dark:from-zinc-800 dark:to-zinc-900 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="relative bg-white dark:bg-zinc-900 rounded-2xl p-8 border border-zinc-200 dark:border-zinc-800 group-hover:border-transparent transition-all duration-300">
                      <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${item.gradient} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className="w-7 h-7 text-white" strokeWidth={2} />
                      </div>
                      <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-3">
                        {item.title}
                      </h3>
                      <p className="text-base text-zinc-600 dark:text-zinc-400 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Values */}
          <section className="mb-24">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 dark:text-white mb-4">
                {isAr ? 'قيمنا' : 'Our Values'}
              </h2>
              <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
                {isAr
                  ? 'المبادئ التي نؤمن بها ونعمل على أساسها'
                  : 'The principles we believe in and work by'}
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {values.map((value) => {
                const Icon = value.icon;
                return (
                  <div
                    key={value.title}
                    className="text-center p-8 rounded-2xl bg-gradient-to-br from-zinc-50 to-white dark:from-zinc-900 dark:to-zinc-800 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-300 hover:scale-105"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-950 dark:to-amber-950 flex items-center justify-center mx-auto mb-5">
                      <Icon className="w-8 h-8 text-orange-600 dark:text-orange-400" strokeWidth={2} />
                    </div>
                    <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-3">
                      {value.title}
                    </h3>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                      {value.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Team */}
          <section>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 dark:text-white mb-4">
                {isAr ? 'فريق العمل' : 'Our Team'}
              </h2>
              <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
                {isAr
                  ? 'الأشخاص الذين يعملون على تطوير Discover'
                  : 'The people working to develop Discover'}
              </p>
            </div>
            <div className="grid sm:grid-cols-2 gap-8 max-w-3xl mx-auto">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 to-purple-500/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative bg-white dark:bg-zinc-900 rounded-3xl p-10 border border-zinc-200 dark:border-zinc-800 group-hover:border-violet-200 dark:group-hover:border-violet-900 transition-all duration-300 text-center">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mx-auto mb-6">
                    <span className="text-2xl font-bold text-white">
                      {isAr ? 'ط' : 'T'}
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">
                    {isAr ? 'طلال ناجي' : 'Talal Naji'}
                  </h3>
                  <p className="text-base text-violet-600 dark:text-violet-400 font-semibold">
                    {isAr ? 'مؤسس' : 'Founder'}
                  </p>
                </div>
              </div>
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-amber-500/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative bg-white dark:bg-zinc-900 rounded-3xl p-10 border border-zinc-200 dark:border-zinc-800 group-hover:border-orange-200 dark:group-hover:border-orange-900 transition-all duration-300 text-center">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center mx-auto mb-6">
                    <span className="text-2xl font-bold text-white">
                      {isAr ? 'م' : 'M'}
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">
                    {isAr ? 'مهند السليماني' : 'Mohannad Sulimani'}
                  </h3>
                  <p className="text-base text-orange-600 dark:text-orange-400 font-semibold">
                    {isAr ? 'شريك مؤسس' : 'Co-Founder'}
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      <Footer locale={locale as 'en' | 'ar'} />
    </ScrollArea>
  );
}
