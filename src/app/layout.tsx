import type { Metadata } from "next";
import { Inter, IBM_Plex_Sans_Arabic } from "next/font/google";
import { cookies } from "next/headers";
import ThemeProvider from "@/providers/ThemeProvider";
import ScrollArea from "@/components/ScrollArea";
import "./globals.css";
import pool from "@/lib/db";

// Inter for English text - clean and modern
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

// IBM Plex Sans Arabic - beautiful Arabic font (same as spirithubcafe.com)
const ibmPlexArabic = IBM_Plex_Sans_Arabic({
  variable: "--font-arabic",
  subsets: ["arabic"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "DNA - Discover Natural Ability",
  description: "Sports talent discovery and management system",
};

async function getSiteSettings() {
  try {
    const result = await pool.query('SELECT setting_key, setting_value FROM site_settings');
    const settings: Record<string, string> = {};
    result.rows.forEach((row) => {
      settings[row.setting_key] = row.setting_value;
    });
    return settings;
  } catch (error) {
    // Return defaults if error
    return {
      font_arabic: 'IBM Plex Sans Arabic',
      font_english: 'Inter',
      font_size_base: '16',
      font_size_heading_1: '48',
      font_size_heading_2: '36',
      font_size_heading_3: '24',
      font_size_heading_4: '20',
    };
  }
}

function getFontUrl(fontName: string): string {
  const fontMap: Record<string, string> = {
    'IBM Plex Sans Arabic': 'IBM+Plex+Sans+Arabic:wght@300;400;500;600;700',
    'Cairo': 'Cairo:wght@300;400;500;600;700;800',
    'Tajawal': 'Tajawal:wght@300;400;500;700;800',
    'Almarai': 'Almarai:wght@300;400;700;800',
    'Noto Sans Arabic': 'Noto+Sans+Arabic:wght@300;400;500;600;700;800',
    'Amiri': 'Amiri:wght@400;700',
    'Inter': 'Inter:wght@300;400;500;600;700;800',
    'Poppins': 'Poppins:wght@300;400;500;600;700;800',
    'Roboto': 'Roboto:wght@300;400;500;700;900',
    'Open Sans': 'Open+Sans:wght@300;400;500;600;700;800',
    'Montserrat': 'Montserrat:wght@300;400;500;600;700;800',
    'Manrope': 'Manrope:wght@300;400;500;600;700;800',
  };
  return fontMap[fontName] || fontMap['Inter'];
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const locale = cookieStore.get("NEXT_LOCALE")?.value || "en";
  const dir = locale === "ar" ? "rtl" : "ltr";
  
  const settings = await getSiteSettings();
  
  const themeScript = `(() => {\n  try {\n    const stored = localStorage.getItem('theme');\n    const theme = stored || 'system';\n    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;\n    const isDark = theme === 'dark' || (theme === 'system' && prefersDark);\n    document.documentElement.classList.toggle('dark', isDark);\n  } catch (e) {}\n})();`;

  const arabicFontUrl = getFontUrl(settings.font_arabic || 'IBM Plex Sans Arabic');
  const englishFontUrl = getFontUrl(settings.font_english || 'Inter');

  const customStyles = `
    :root {
      --font-size-base: ${settings.font_size_base || '16'}px;
      --font-size-h1: ${settings.font_size_heading_1 || '48'}px;
      --font-size-h2: ${settings.font_size_heading_2 || '36'}px;
      --font-size-h3: ${settings.font_size_heading_3 || '24'}px;
      --font-size-h4: ${settings.font_size_heading_4 || '20'}px;
    }
    [dir="rtl"] body {
      font-family: '${settings.font_arabic || 'IBM Plex Sans Arabic'}', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
    }
    [dir="ltr"] body {
      font-family: '${settings.font_english || 'Inter'}', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
    }
  `;

  return (
    <html lang={locale} dir={dir} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <link href={`https://fonts.googleapis.com/css2?family=${arabicFontUrl}&family=${englishFontUrl}&display=swap`} rel="stylesheet" />
        <style dangerouslySetInnerHTML={{ __html: customStyles }} />
      </head>
      <body
        className={`${inter.variable} ${ibmPlexArabic.variable} antialiased bg-background text-foreground h-screen overflow-hidden`}
      >
        <ThemeProvider>
          <ScrollArea className="h-screen w-screen">
            {children}
          </ScrollArea>
        </ThemeProvider>
      </body>
    </html>
  );
}
