import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import TypographyShowcase from '@/components/TypographyShowcase';

export default async function TypographyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const messages = await getMessages();

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <div className="min-h-screen bg-white dark:bg-zinc-900">
        <div className="max-w-6xl mx-auto">
          <div className="py-8 px-4 border-b border-zinc-200 dark:border-zinc-800">
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">
              {locale === 'ar' ? 'عرض أنماط الطباعة' : 'Typography Showcase'}
            </h1>
            <p className="mt-2 text-zinc-600 dark:text-zinc-400">
              {locale === 'ar' 
                ? 'مجموعة شاملة من أنماط الطباعة المتاحة في النظام'
                : 'Complete collection of typography styles available in the system'}
            </p>
          </div>
          <TypographyShowcase />
        </div>
      </div>
    </NextIntlClientProvider>
  );
}
