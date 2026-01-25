# Available Fonts

All fonts are pre-installed using Next.js Font Optimization (`next/font/google`).  
No external requests to Google Fonts - all fonts are self-hosted and optimized.

## 🌐 English Fonts

| Font Name | Variable | Weights Available |
|-----------|----------|-------------------|
| **Inter** | `--font-inter` | 300, 400, 500, 600, 700, 800 |
| **Poppins** | `--font-poppins` | 300, 400, 500, 600, 700, 800 |
| **Roboto** | `--font-roboto` | 300, 400, 500, 700, 900 |
| **Open Sans** | `--font-opensans` | 300, 400, 500, 600, 700, 800 |
| **Montserrat** | `--font-montserrat` | 300, 400, 500, 600, 700, 800 |
| **Manrope** | `--font-manrope` | 300, 400, 500, 600, 700, 800 |

## 🇸🇦 Arabic Fonts

| Font Name | Variable | Weights Available |
|-----------|----------|-------------------|
| **IBM Plex Sans Arabic** | `--font-ibmplexarabic` | 300, 400, 500, 600, 700 |
| **Cairo** | `--font-cairo` | 300, 400, 500, 600, 700, 800 |
| **Tajawal** | `--font-tajawal` | 300, 400, 500, 700, 800 |
| **Almarai** | `--font-almarai` | 300, 400, 700, 800 |
| **Noto Sans Arabic** | `--font-notosansarabic` | 300, 400, 500, 600, 700, 800 |
| **Amiri** | `--font-amiri` | 400, 700 |

## 🎨 How to Use

### In Settings Page
Navigate to `/dashboard/settings` → Typography tab and select your preferred fonts for Arabic and English.

### In Code
Fonts are automatically applied based on the locale (`dir="rtl"` or `dir="ltr"`).

```tsx
// Fonts are already available as CSS variables
[dir="rtl"] body {
  font-family: var(--font-family-arabic);
}

[dir="ltr"] body {
  font-family: var(--font-family-english);
}
```

### Direct CSS Variable Usage
```css
/* Use specific font directly */
.my-element {
  font-family: var(--font-cairo);
}
```

## ⚡ Performance

- ✅ All fonts are self-hosted (no Google CDN requests)
- ✅ Optimized with Next.js Font Optimization
- ✅ Automatic font subsetting
- ✅ Zero layout shift (font-display: swap)
- ✅ Preloaded for better performance

## 🔄 Adding New Fonts

To add a new font:

1. **Import in `src/app/layout.tsx`:**
   ```tsx
   import { New_Font_Name } from "next/font/google";
   
   const newFont = New_Font_Name({
     variable: "--font-newfont",
     subsets: ["latin"], // or ["arabic"]
     weight: ["400", "700"],
     display: "swap",
   });
   ```

2. **Add to font classes:**
   ```tsx
   function getAllFontClasses(): string {
     return [
       // ... existing fonts
       newFont.variable,
     ].join(' ');
   }
   ```

3. **Add to font mapping:**
   ```tsx
   function getFontVariable(fontName: string, isArabic: boolean): string {
     const fontMap: Record<string, string> = {
       // ... existing fonts
       'New Font Name': '--font-newfont',
     };
     // ...
   }
   ```

4. **Update `TypographyTab.tsx`:**
   Add the font to `ARABIC_FONTS` or `ENGLISH_FONTS` array.

## 📊 Typography System Variables

All typography settings are managed in the `site_settings` database table:

- Font weights (light to extrabold)
- Font sizes (xs to display-2)
- Line heights (tight to loose)
- Letter spacing (tighter to widest)
- Paragraph settings

## 🌍 Locale Support

- **Arabic (ar):** Automatic RTL layout with Arabic font
- **English (en):** Automatic LTR layout with English font
