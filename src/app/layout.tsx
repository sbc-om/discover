import type { Metadata } from "next";
import { 
  Inter, 
  IBM_Plex_Sans_Arabic,
  Cairo,
  Tajawal,
  Almarai,
  Noto_Sans_Arabic,
  Amiri,
  Poppins,
  Roboto,
  Open_Sans,
  Montserrat,
  Manrope
} from "next/font/google";
import { cookies } from "next/headers";
import ThemeProvider from "@/providers/ThemeProvider";
import ScrollArea from "@/components/ScrollArea";
import "./globals.css";
import pool from "@/lib/db";

// English Fonts
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700", "900"],
  display: "swap",
});

const openSans = Open_Sans({
  variable: "--font-opensans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

// Arabic Fonts
const ibmPlexArabic = IBM_Plex_Sans_Arabic({
  variable: "--font-ibmplexarabic",
  subsets: ["arabic"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

const tajawal = Tajawal({
  variable: "--font-tajawal",
  subsets: ["arabic"],
  weight: ["300", "400", "500", "700", "800"],
  display: "swap",
});

const almarai = Almarai({
  variable: "--font-almarai",
  subsets: ["arabic"],
  weight: ["300", "400", "700", "800"],
  display: "swap",
});

const notoSansArabic = Noto_Sans_Arabic({
  variable: "--font-notosansarabic",
  subsets: ["arabic"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

const amiri = Amiri({
  variable: "--font-amiri",
  subsets: ["arabic"],
  weight: ["400", "700"],
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
    // Return comprehensive typography defaults
    return {
      // Font Families
      font_arabic: 'IBM Plex Sans Arabic',
      font_english: 'Inter',
      
      // Font Weights
      font_weight_light: '300',
      font_weight_regular: '400',
      font_weight_medium: '500',
      font_weight_semibold: '600',
      font_weight_bold: '700',
      font_weight_extrabold: '800',
      
      // Font Sizes - Base
      font_size_xs: '12',
      font_size_sm: '14',
      font_size_base: '16',
      font_size_lg: '18',
      font_size_xl: '20',
      
      // Font Sizes - Headings
      font_size_h1: '48',
      font_size_h2: '36',
      font_size_h3: '30',
      font_size_h4: '24',
      font_size_h5: '20',
      font_size_h6: '18',
      
      // Font Sizes - Display
      font_size_display_1: '72',
      font_size_display_2: '60',
      
      // Line Heights
      line_height_tight: '1.25',
      line_height_snug: '1.375',
      line_height_normal: '1.5',
      line_height_relaxed: '1.625',
      line_height_loose: '2',
      
      // Letter Spacing
      letter_spacing_tighter: '-0.05em',
      letter_spacing_tight: '-0.025em',
      letter_spacing_normal: '0em',
      letter_spacing_wide: '0.025em',
      letter_spacing_wider: '0.05em',
      letter_spacing_widest: '0.1em',
      
      // Paragraph Settings
      paragraph_spacing: '1em',
      paragraph_indent: '0em',
    };
  }
}

// Font mapping - returns CSS variable name
function getFontVariable(fontName: string, isArabic: boolean): string {
  const fontMap: Record<string, string> = {
    // Arabic Fonts
    'IBM Plex Sans Arabic': '--font-ibmplexarabic',
    'Cairo': '--font-cairo',
    'Tajawal': '--font-tajawal',
    'Almarai': '--font-almarai',
    'Noto Sans Arabic': '--font-notosansarabic',
    'Amiri': '--font-amiri',
    // English Fonts
    'Inter': '--font-inter',
    'Poppins': '--font-poppins',
    'Roboto': '--font-roboto',
    'Open Sans': '--font-opensans',
    'Montserrat': '--font-montserrat',
    'Manrope': '--font-manrope',
  };
  
  const defaultFont = isArabic ? '--font-ibmplexarabic' : '--font-inter';
  return fontMap[fontName] || defaultFont;
}

// Get all font class names for the HTML element
function getAllFontClasses(): string {
  return [
    inter.variable,
    poppins.variable,
    roboto.variable,
    openSans.variable,
    montserrat.variable,
    manrope.variable,
    ibmPlexArabic.variable,
    cairo.variable,
    tajawal.variable,
    almarai.variable,
    notoSansArabic.variable,
    amiri.variable,
  ].join(' ');
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

  const arabicFontVar = getFontVariable(settings.font_arabic || 'IBM Plex Sans Arabic', true);
  const englishFontVar = getFontVariable(settings.font_english || 'Inter', false);

  const customStyles = `
    /* Typography System - Professional & Comprehensive */
    :root {
      /* Font Families - Use CSS Variables from next/font */
      --font-family-arabic: var(${arabicFontVar}), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      --font-family-english: var(${englishFontVar}), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      
      /* Font Weights */
      --font-weight-light: ${settings.font_weight_light || '300'};
      --font-weight-regular: ${settings.font_weight_regular || '400'};
      --font-weight-medium: ${settings.font_weight_medium || '500'};
      --font-weight-semibold: ${settings.font_weight_semibold || '600'};
      --font-weight-bold: ${settings.font_weight_bold || '700'};
      --font-weight-extrabold: ${settings.font_weight_extrabold || '800'};
      
      /* Font Sizes - Base Scale */
      --font-size-xs: ${settings.font_size_xs || '12'}px;
      --font-size-sm: ${settings.font_size_sm || '14'}px;
      --font-size-base: ${settings.font_size_base || '16'}px;
      --font-size-lg: ${settings.font_size_lg || '18'}px;
      --font-size-xl: ${settings.font_size_xl || '20'}px;
      
      /* Font Sizes - Headings */
      --font-size-h1: ${settings.font_size_h1 || '48'}px;
      --font-size-h2: ${settings.font_size_h2 || '36'}px;
      --font-size-h3: ${settings.font_size_h3 || '30'}px;
      --font-size-h4: ${settings.font_size_h4 || '24'}px;
      --font-size-h5: ${settings.font_size_h5 || '20'}px;
      --font-size-h6: ${settings.font_size_h6 || '18'}px;
      
      /* Font Sizes - Display */
      --font-size-display-1: ${settings.font_size_display_1 || '72'}px;
      --font-size-display-2: ${settings.font_size_display_2 || '60'}px;
      
      /* Line Heights */
      --line-height-tight: ${settings.line_height_tight || '1.25'};
      --line-height-snug: ${settings.line_height_snug || '1.375'};
      --line-height-normal: ${settings.line_height_normal || '1.5'};
      --line-height-relaxed: ${settings.line_height_relaxed || '1.625'};
      --line-height-loose: ${settings.line_height_loose || '2'};
      
      /* Letter Spacing */
      --letter-spacing-tighter: ${settings.letter_spacing_tighter || '-0.05em'};
      --letter-spacing-tight: ${settings.letter_spacing_tight || '-0.025em'};
      --letter-spacing-normal: ${settings.letter_spacing_normal || '0em'};
      --letter-spacing-wide: ${settings.letter_spacing_wide || '0.025em'};
      --letter-spacing-wider: ${settings.letter_spacing_wider || '0.05em'};
      --letter-spacing-widest: ${settings.letter_spacing_widest || '0.1em'};
      
      /* Paragraph Settings */
      --paragraph-spacing: ${settings.paragraph_spacing || '1em'};
      --paragraph-indent: ${settings.paragraph_indent || '0em'};
    }
    
    /* Base Typography - RTL/LTR */
    [dir="rtl"] body {
      font-family: var(--font-family-arabic) !important;
      font-size: var(--font-size-base);
      font-weight: var(--font-weight-regular);
      line-height: var(--line-height-normal);
      letter-spacing: var(--letter-spacing-normal);
    }
    
    [dir="ltr"] body {
      font-family: var(--font-family-english) !important;
      font-size: var(--font-size-base);
      font-weight: var(--font-weight-regular);
      line-height: var(--line-height-normal);
      letter-spacing: var(--letter-spacing-normal);
    }
    
    /* Heading Styles */
    h1, .h1 {
      font-size: var(--font-size-h1);
      font-weight: var(--font-weight-bold);
      line-height: var(--line-height-tight);
      letter-spacing: var(--letter-spacing-tight);
      margin-bottom: 0.5em;
    }
    
    h2, .h2 {
      font-size: var(--font-size-h2);
      font-weight: var(--font-weight-bold);
      line-height: var(--line-height-tight);
      letter-spacing: var(--letter-spacing-tight);
      margin-bottom: 0.5em;
    }
    
    h3, .h3 {
      font-size: var(--font-size-h3);
      font-weight: var(--font-weight-semibold);
      line-height: var(--line-height-snug);
      letter-spacing: var(--letter-spacing-normal);
      margin-bottom: 0.5em;
    }
    
    h4, .h4 {
      font-size: var(--font-size-h4);
      font-weight: var(--font-weight-semibold);
      line-height: var(--line-height-snug);
      letter-spacing: var(--letter-spacing-normal);
      margin-bottom: 0.5em;
    }
    
    h5, .h5 {
      font-size: var(--font-size-h5);
      font-weight: var(--font-weight-medium);
      line-height: var(--line-height-normal);
      letter-spacing: var(--letter-spacing-normal);
      margin-bottom: 0.5em;
    }
    
    h6, .h6 {
      font-size: var(--font-size-h6);
      font-weight: var(--font-weight-medium);
      line-height: var(--line-height-normal);
      letter-spacing: var(--letter-spacing-normal);
      margin-bottom: 0.5em;
    }
    
    /* Display Styles */
    .display-1 {
      font-size: var(--font-size-display-1);
      font-weight: var(--font-weight-extrabold);
      line-height: var(--line-height-tight);
      letter-spacing: var(--letter-spacing-tighter);
    }
    
    .display-2 {
      font-size: var(--font-size-display-2);
      font-weight: var(--font-weight-bold);
      line-height: var(--line-height-tight);
      letter-spacing: var(--letter-spacing-tight);
    }
    
    /* Body Text Utilities */
    .text-xs {
      font-size: var(--font-size-xs);
      line-height: var(--line-height-normal);
    }
    
    .text-sm {
      font-size: var(--font-size-sm);
      line-height: var(--line-height-normal);
    }
    
    .text-base {
      font-size: var(--font-size-base);
      line-height: var(--line-height-normal);
    }
    
    .text-lg {
      font-size: var(--font-size-lg);
      line-height: var(--line-height-relaxed);
    }
    
    .text-xl {
      font-size: var(--font-size-xl);
      line-height: var(--line-height-relaxed);
    }
    
    /* Font Weight Utilities */
    .font-light { font-weight: var(--font-weight-light); }
    .font-regular { font-weight: var(--font-weight-regular); }
    .font-medium { font-weight: var(--font-weight-medium); }
    .font-semibold { font-weight: var(--font-weight-semibold); }
    .font-bold { font-weight: var(--font-weight-bold); }
    .font-extrabold { font-weight: var(--font-weight-extrabold); }
    
    /* Line Height Utilities */
    .leading-tight { line-height: var(--line-height-tight); }
    .leading-snug { line-height: var(--line-height-snug); }
    .leading-normal { line-height: var(--line-height-normal); }
    .leading-relaxed { line-height: var(--line-height-relaxed); }
    .leading-loose { line-height: var(--line-height-loose); }
    
    /* Letter Spacing Utilities */
    .tracking-tighter { letter-spacing: var(--letter-spacing-tighter); }
    .tracking-tight { letter-spacing: var(--letter-spacing-tight); }
    .tracking-normal { letter-spacing: var(--letter-spacing-normal); }
    .tracking-wide { letter-spacing: var(--letter-spacing-wide); }
    .tracking-wider { letter-spacing: var(--letter-spacing-wider); }
    .tracking-widest { letter-spacing: var(--letter-spacing-widest); }
    
    /* Paragraph Styles */
    p, .paragraph {
      margin-bottom: var(--paragraph-spacing);
      text-indent: var(--paragraph-indent);
    }
    
    /* Link Styles */
    a {
      font-weight: var(--font-weight-medium);
      text-decoration: underline;
      text-decoration-thickness: 1px;
      text-underline-offset: 2px;
      transition: all 0.2s ease;
    }
    
    a:hover {
      text-decoration-thickness: 2px;
    }
    
    /* List Styles */
    ul, ol {
      margin-bottom: var(--paragraph-spacing);
      padding-inline-start: 1.5em;
    }
    
    li {
      margin-bottom: 0.5em;
    }
    
    /* Blockquote Styles */
    blockquote {
      font-size: var(--font-size-lg);
      font-weight: var(--font-weight-medium);
      line-height: var(--line-height-relaxed);
      font-style: italic;
      padding-inline-start: 1.5em;
      border-inline-start: 4px solid currentColor;
      margin: 1.5em 0;
    }
    
    /* Code Styles */
    code, pre {
      font-family: 'Fira Code', 'Consolas', 'Monaco', monospace;
      font-size: 0.875em;
    }
    
    code {
      padding: 0.125em 0.25em;
      border-radius: 0.25em;
      background: rgba(0, 0, 0, 0.05);
    }
    
    .dark code {
      background: rgba(255, 255, 255, 0.1);
    }
    
    pre {
      padding: 1em;
      border-radius: 0.5em;
      overflow-x: auto;
      line-height: var(--line-height-relaxed);
    }
    
    /* Responsive Typography */
    @media (max-width: 768px) {
      :root {
        --font-size-h1: calc(${settings.font_size_h1 || '48'}px * 0.75);
        --font-size-h2: calc(${settings.font_size_h2 || '36'}px * 0.8);
        --font-size-h3: calc(${settings.font_size_h3 || '30'}px * 0.85);
        --font-size-display-1: calc(${settings.font_size_display_1 || '72'}px * 0.6);
        --font-size-display-2: calc(${settings.font_size_display_2 || '60'}px * 0.7);
      }
    }
    
    @media (max-width: 480px) {
      :root {
        --font-size-h1: calc(${settings.font_size_h1 || '48'}px * 0.6);
        --font-size-h2: calc(${settings.font_size_h2 || '36'}px * 0.7);
        --font-size-h3: calc(${settings.font_size_h3 || '30'}px * 0.75);
        --font-size-base: 15px;
      }
    }
    
    /* Text Alignment RTL Support */
    [dir="rtl"] .text-start { text-align: right; }
    [dir="rtl"] .text-end { text-align: left; }
    [dir="ltr"] .text-start { text-align: left; }
    [dir="ltr"] .text-end { text-align: right; }
    
    /* Smooth Font Rendering */
    * {
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      text-rendering: optimizeLegibility;
    }
    
    /* Prevent text selection issues */
    ::selection {
      background-color: rgba(59, 130, 246, 0.3);
    }
    
    .dark ::selection {
      background-color: rgba(59, 130, 246, 0.5);
    }
  `;

  return (
    <html lang={locale} dir={dir} suppressHydrationWarning className={getAllFontClasses()}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <style dangerouslySetInnerHTML={{ __html: customStyles }} />
      </head>
      <body
        className="antialiased bg-background text-foreground h-screen overflow-hidden"
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
