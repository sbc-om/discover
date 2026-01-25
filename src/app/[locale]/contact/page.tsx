import Link from 'next/link';
import TopNavbar from '@/components/TopNavbar';
import ScrollArea from '@/components/ScrollArea';
import Footer from '@/components/Footer';
import { Mail, Phone, MapPin, Send, MessageCircle, Clock, Sparkles } from 'lucide-react';

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isAr = locale === 'ar';

  const contactInfo = [
    {
      icon: Mail,
      title: isAr ? 'البريد الإلكتروني' : 'Email',
      value: 'info@discovernaturalability.com',
      href: 'mailto:info@discovernaturalability.com',
      description: isAr ? 'راسلنا في أي وقت' : 'Email us anytime',
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      icon: Phone,
      title: isAr ? 'الهاتف' : 'Phone',
      value: '+968 7772 2112',
      href: 'tel:+96877722112',
      description: isAr ? 'اتصل بنا مباشرة' : 'Call us directly',
      gradient: 'from-violet-500 to-purple-500',
    },
    {
      icon: MapPin,
      title: isAr ? 'الموقع' : 'Location',
      value: isAr ? 'مسقط، عُمان' : 'Muscat, Oman',
      description: isAr ? 'مقرنا الرئيسي' : 'Our headquarters',
      gradient: 'from-amber-500 to-orange-500',
    },
  ];

  const supportFeatures = [
    {
      icon: Clock,
      title: isAr ? 'استجابة سريعة' : 'Quick Response',
      description: isAr ? 'نرد خلال 24 ساعة' : 'We respond within 24 hours',
    },
    {
      icon: MessageCircle,
      title: isAr ? 'دعم متخصص' : 'Expert Support',
      description: isAr ? 'فريق محترف لخدمتك' : 'Professional team at your service',
    },
    {
      icon: Sparkles,
      title: isAr ? 'حلول مخصصة' : 'Custom Solutions',
      description: isAr ? 'نفهم احتياجاتك' : 'We understand your needs',
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
                  {isAr ? 'تواصل معنا' : 'Contact Us'}
                </span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-zinc-900 dark:text-white mb-6 leading-tight">
                {isAr ? 'نحن هنا لمساعدتك' : 'We\'re Here to Help'}
              </h1>
              <p className="text-xl md:text-2xl text-zinc-600 dark:text-zinc-400 max-w-3xl mx-auto leading-relaxed">
                {isAr
                  ? 'تواصل معنا لمعرفة المزيد عن Discover وكيف يمكننا مساعدة أكاديميتك'
                  : 'Reach out to learn more about Discover and how we can help your academy'}
              </p>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 max-w-6xl">
          {/* Contact Cards */}
          <section className="mb-24">
            <div className="grid md:grid-cols-3 gap-8">
              {contactInfo.map((item, index) => {
                const Icon = item.icon;
                const CardContent = (
                  <div className="group relative h-full">
                    <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-0 group-hover:opacity-5 rounded-3xl transition-opacity duration-500`} />
                    <div className="relative bg-white dark:bg-zinc-900 rounded-3xl p-8 border-2 border-zinc-100 dark:border-zinc-800 group-hover:border-transparent transition-all duration-300 text-center h-full flex flex-col">
                      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${item.gradient} flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className="w-8 h-8 text-white" strokeWidth={2.5} />
                      </div>
                      <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-3">
                        {item.title}
                      </h3>
                      <p className="text-base text-zinc-600 dark:text-zinc-400 mb-4" dir={item.icon === Phone ? 'ltr' : undefined}>
                        {item.value}
                      </p>
                      <p className="text-sm text-zinc-500 dark:text-zinc-500 mt-auto">
                        {item.description}
                      </p>
                      <div className={`absolute bottom-0 left-0 right-0 h-1.5 bg-gradient-to-r ${item.gradient} rounded-b-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                    </div>
                  </div>
                );
                
                return item.href ? (
                  <a key={item.title} href={item.href} className="block h-full hover:opacity-100 transition-opacity">
                    {CardContent}
                  </a>
                ) : (
                  <div key={item.title}>{CardContent}</div>
                );
              })}
            </div>
          </section>

          {/* Support Features */}
          <section className="mb-24">
            <div className="grid md:grid-cols-3 gap-6">
              {supportFeatures.map((feature) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={feature.title}
                    className="text-center p-8 rounded-2xl bg-gradient-to-br from-zinc-50 to-white dark:from-zinc-900 dark:to-zinc-800 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-300"
                  >
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-950 dark:to-amber-950 flex items-center justify-center mx-auto mb-5">
                      <Icon className="w-7 h-7 text-orange-600 dark:text-orange-400" strokeWidth={2} />
                    </div>
                    <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                      {feature.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>

          {/* CTA Section */}
          <section>
            <div className="relative group overflow-hidden">
              {/* Background Gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-amber-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl" />
              
              <div className="relative bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 rounded-3xl p-12 md:p-16 text-center border-2 border-zinc-800 dark:border-zinc-700">
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-orange-500/20 to-transparent rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-violet-500/20 to-transparent rounded-full blur-3xl" />
                
                <div className="relative z-10">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center mx-auto mb-8">
                    <Send className="w-10 h-10 text-white" strokeWidth={2.5} />
                  </div>
                  
                  <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                    {isAr ? 'هل أنت مستعد للبدء؟' : 'Ready to Get Started?'}
                  </h2>
                  <p className="text-lg text-zinc-300 mb-8 max-w-2xl mx-auto leading-relaxed">
                    {isAr
                      ? 'أرسل لنا بريدًا إلكترونيًا وسيتواصل معك فريقنا خلال 24 ساعة لمناقشة احتياجات أكاديميتك'
                      : 'Send us an email and our team will get back to you within 24 hours to discuss your academy\'s needs'}
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <a
                      href="mailto:info@discovernaturalability.com"
                      className="group/btn inline-flex items-center justify-center gap-3 px-10 py-5 bg-white text-zinc-900 rounded-2xl font-bold text-lg hover:bg-zinc-100 transition-all shadow-xl hover:shadow-2xl hover:scale-105"
                    >
                      {isAr ? 'أرسل بريدًا' : 'Send an Email'}
                      <Send className="w-5 h-5 group-hover/btn:translate-x-1 rtl:group-hover/btn:-translate-x-1 transition-transform" />
                    </a>
                    <Link
                      href={`/${locale}/login`}
                      className="inline-flex items-center justify-center gap-3 px-10 py-5 border-2 border-zinc-700 text-white rounded-2xl font-bold text-lg hover:bg-zinc-800 hover:border-zinc-600 transition-all"
                    >
                      {isAr ? 'تسجيل الدخول' : 'Sign In'}
                    </Link>
                  </div>
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
