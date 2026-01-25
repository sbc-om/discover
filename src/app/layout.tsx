import type { Metadata } from "next";
import { Inter, IBM_Plex_Sans_Arabic } from "next/font/google";
import { cookies } from "next/headers";
import ThemeProvider from "@/providers/ThemeProvider";
import ScrollArea from "@/components/ScrollArea";
import "./globals.css";

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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const locale = cookieStore.get("NEXT_LOCALE")?.value || "en";
  const dir = locale === "ar" ? "rtl" : "ltr";
  const themeScript = `(() => {\n  try {\n    const stored = localStorage.getItem('theme');\n    const theme = stored || 'system';\n    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;\n    const isDark = theme === 'dark' || (theme === 'system' && prefersDark);\n    document.documentElement.classList.toggle('dark', isDark);\n  } catch (e) {}\n})();`;

  return (
    <html lang={locale} dir={dir} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
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
