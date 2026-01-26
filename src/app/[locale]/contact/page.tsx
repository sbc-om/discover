import Link from 'next/link';
import TopNavbar from '@/components/TopNavbar';
import ScrollArea from '@/components/ScrollArea';
import Footer from '@/components/Footer';
import { Mail, Phone, MapPin } from 'lucide-react';

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
    },
    {
      icon: Phone,
      title: isAr ? 'الهاتف' : 'Phone',
      value: '+968 7772 2112',
      href: 'tel:+96877722112',
    },
    {
      icon: MapPin,
      title: isAr ? 'الموقع' : 'Location',
      value: isAr ? 'مسقط، عُمان' : 'Muscat, Oman',
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
                {isAr ? 'تواصل معنا' : 'Contact Us'}
              </h1>
              <p className="text-lg md:text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
                {isAr
                  ? 'نحن هنا للإجابة على أسئلتك'
                  : 'We\'re here to answer your questions'}
              </p>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 sm:px-6">
          {/* Contact Cards */}
          <section className="max-w-4xl mx-auto">
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
              {contactInfo.map((item) => {
                const Icon = item.icon;
                const CardContent = (
                  <div className="p-6 md:p-8 rounded-2xl bg-zinc-50 dark:bg-zinc-900 hover:bg-orange-50 dark:hover:bg-orange-950/20 transition-all text-center">
                    <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-orange-500/10 dark:bg-orange-500/20 flex items-center justify-center mx-auto mb-4 md:mb-5">
                      <Icon className="w-6 h-6 md:w-7 md:h-7 text-orange-600 dark:text-orange-400" strokeWidth={2} />
                    </div>
                    <h3 className="text-base md:text-lg font-bold text-zinc-900 dark:text-white mb-2 md:mb-3">
                      {item.title}
                    </h3>
                    <p className="text-sm md:text-base text-zinc-600 dark:text-zinc-400" dir={item.icon === Phone ? 'ltr' : undefined}>
                      {item.value}
                    </p>
                  </div>
                );
                
                return item.href ? (
                  <a key={item.title} href={item.href} className="block hover:opacity-100 transition-opacity">
                    {CardContent}
                  </a>
                ) : (
                  <div key={item.title}>{CardContent}</div>
                );
              })}
            </div>
          </section>
        </div>
        </main>

        <Footer locale={locale as 'en' | 'ar'} />
      </div>
    </ScrollArea>
  );
}
