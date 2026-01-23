import { notFound } from 'next/navigation';
import { locales } from '@/i18n/request';
import LocaleProvider from '@/providers/LocaleProvider';
import { ToastProvider } from '@/components/ToastProvider';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  
  // Validate that the incoming `locale` is valid
  if (!locales.includes(locale as any)) {
    notFound();
  }

  return (
    <LocaleProvider initialLocale={locale as typeof locales[number]}>
      <ToastProvider>{children}</ToastProvider>
    </LocaleProvider>
  );
}
