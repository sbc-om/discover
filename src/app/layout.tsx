import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { cookies } from "next/headers";
import ThemeProvider from "@/providers/ThemeProvider";
import ScrollArea from "@/components/ScrollArea";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground h-screen overflow-hidden`}
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
