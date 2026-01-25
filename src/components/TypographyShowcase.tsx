'use client';

import useLocale from '@/hooks/useLocale';

export default function TypographyShowcase() {
  const { locale } = useLocale();
  const isAr = locale === 'ar';

  return (
    <div className="space-y-12 p-8">
      {/* Display Styles */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
          {isAr ? 'أنماط العرض' : 'Display Styles'}
        </h2>
        <div className="space-y-4">
          <div className="display-1 text-zinc-900 dark:text-white">
            {isAr ? 'عنوان عرض 1' : 'Display Heading 1'}
          </div>
          <div className="display-2 text-zinc-900 dark:text-white">
            {isAr ? 'عنوان عرض 2' : 'Display Heading 2'}
          </div>
        </div>
      </section>

      {/* Headings */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
          {isAr ? 'العناوين' : 'Headings'}
        </h2>
        <div className="space-y-3">
          <h1 className="text-zinc-900 dark:text-white">
            {isAr ? 'عنوان من المستوى الأول (H1)' : 'Heading Level 1 (H1)'}
          </h1>
          <h2 className="text-zinc-900 dark:text-white">
            {isAr ? 'عنوان من المستوى الثاني (H2)' : 'Heading Level 2 (H2)'}
          </h2>
          <h3 className="text-zinc-900 dark:text-white">
            {isAr ? 'عنوان من المستوى الثالث (H3)' : 'Heading Level 3 (H3)'}
          </h3>
          <h4 className="text-zinc-900 dark:text-white">
            {isAr ? 'عنوان من المستوى الرابع (H4)' : 'Heading Level 4 (H4)'}
          </h4>
          <h5 className="text-zinc-900 dark:text-white">
            {isAr ? 'عنوان من المستوى الخامس (H5)' : 'Heading Level 5 (H5)'}
          </h5>
          <h6 className="text-zinc-900 dark:text-white">
            {isAr ? 'عنوان من المستوى السادس (H6)' : 'Heading Level 6 (H6)'}
          </h6>
        </div>
      </section>

      {/* Body Text Sizes */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
          {isAr ? 'أحجام النصوص' : 'Text Sizes'}
        </h2>
        <div className="space-y-3">
          <p className="text-xs text-zinc-600 dark:text-zinc-300">
            {isAr ? 'نص صغير جداً (XS) - مثالي للملاحظات والتفاصيل الدقيقة' : 'Extra small text (XS) - Perfect for footnotes and fine details'}
          </p>
          <p className="text-sm text-zinc-600 dark:text-zinc-300">
            {isAr ? 'نص صغير (SM) - مناسب للنصوص الثانوية والتسميات' : 'Small text (SM) - Ideal for secondary text and labels'}
          </p>
          <p className="text-base text-zinc-700 dark:text-zinc-200">
            {isAr ? 'نص أساسي (Base) - الحجم الافتراضي للنصوص العادية والفقرات' : 'Base text - Default size for body text and paragraphs'}
          </p>
          <p className="text-lg text-zinc-800 dark:text-zinc-100">
            {isAr ? 'نص كبير (LG) - رائع للمقدمات والنصوص البارزة' : 'Large text (LG) - Great for introductions and lead paragraphs'}
          </p>
          <p className="text-xl text-zinc-900 dark:text-white">
            {isAr ? 'نص كبير جداً (XL) - للعناوين الفرعية والنصوص المهمة' : 'Extra large text (XL) - For subheadings and important text'}
          </p>
        </div>
      </section>

      {/* Font Weights */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
          {isAr ? 'أوزان الخطوط' : 'Font Weights'}
        </h2>
        <div className="space-y-2 text-base">
          <p className="font-light text-zinc-600 dark:text-zinc-300">
            {isAr ? 'خفيف (Light) - 300' : 'Light Weight - 300'}
          </p>
          <p className="font-regular text-zinc-700 dark:text-zinc-200">
            {isAr ? 'عادي (Regular) - 400' : 'Regular Weight - 400'}
          </p>
          <p className="font-medium text-zinc-800 dark:text-zinc-100">
            {isAr ? 'متوسط (Medium) - 500' : 'Medium Weight - 500'}
          </p>
          <p className="font-semibold text-zinc-900 dark:text-white">
            {isAr ? 'شبه غامق (Semibold) - 600' : 'Semibold Weight - 600'}
          </p>
          <p className="font-bold text-zinc-900 dark:text-white">
            {isAr ? 'غامق (Bold) - 700' : 'Bold Weight - 700'}
          </p>
          <p className="font-extrabold text-zinc-900 dark:text-white">
            {isAr ? 'غامق جداً (Extrabold) - 800' : 'Extrabold Weight - 800'}
          </p>
        </div>
      </section>

      {/* Line Heights */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
          {isAr ? 'ارتفاعات الأسطر' : 'Line Heights'}
        </h2>
        <div className="space-y-4">
          <div className="space-y-1">
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Tight (1.25)</p>
            <p className="leading-tight text-zinc-700 dark:text-zinc-200">
              {isAr ? 'نص ضيق المسافة بين الأسطر مناسب للعناوين والنصوص المختصرة التي لا تحتاج إلى مسافات كبيرة' : 'Tight line height is perfect for headings and compact text that doesn\'t need much breathing room'}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Normal (1.5)</p>
            <p className="leading-normal text-zinc-700 dark:text-zinc-200">
              {isAr ? 'ارتفاع السطر العادي هو الافتراضي ومناسب لمعظم النصوص والفقرات القياسية' : 'Normal line height is the default and works well for most body text and standard paragraphs'}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Relaxed (1.625)</p>
            <p className="leading-relaxed text-zinc-700 dark:text-zinc-200">
              {isAr ? 'ارتفاع سطر مريح يوفر مساحة إضافية بين الأسطر لتحسين القراءة في النصوص الطويلة' : 'Relaxed line height provides extra space between lines for improved readability in longer texts'}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Loose (2.0)</p>
            <p className="leading-loose text-zinc-700 dark:text-zinc-200">
              {isAr ? 'ارتفاع سطر واسع جداً يعطي مساحة كبيرة بين الأسطر مناسب للنصوص التي تحتاج إلى تباعد واضح' : 'Loose line height gives generous spacing between lines ideal for text that needs clear separation'}
            </p>
          </div>
        </div>
      </section>

      {/* Letter Spacing */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
          {isAr ? 'المسافات بين الأحرف' : 'Letter Spacing'}
        </h2>
        <div className="space-y-2 text-base">
          <p className="tracking-tighter text-zinc-700 dark:text-zinc-200">
            {isAr ? 'أضيق (Tighter) - مسافة ضيقة جداً' : 'Tighter - Very tight spacing'}
          </p>
          <p className="tracking-tight text-zinc-700 dark:text-zinc-200">
            {isAr ? 'ضيق (Tight) - مسافة ضيقة' : 'Tight - Tight spacing'}
          </p>
          <p className="tracking-normal text-zinc-700 dark:text-zinc-200">
            {isAr ? 'عادي (Normal) - المسافة الافتراضية' : 'Normal - Default spacing'}
          </p>
          <p className="tracking-wide text-zinc-700 dark:text-zinc-200">
            {isAr ? 'واسع (Wide) - مسافة واسعة' : 'Wide - Wide spacing'}
          </p>
          <p className="tracking-wider text-zinc-700 dark:text-zinc-200">
            {isAr ? 'أوسع (Wider) - مسافة أوسع' : 'Wider - Wider spacing'}
          </p>
          <p className="tracking-widest text-zinc-700 dark:text-zinc-200">
            {isAr ? 'الأوسع (Widest) - أوسع مسافة' : 'Widest - Widest spacing'}
          </p>
        </div>
      </section>

      {/* Practical Examples */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
          {isAr ? 'أمثلة عملية' : 'Practical Examples'}
        </h2>
        
        {/* Article Example */}
        <article className="prose dark:prose-invert max-w-none">
          <h3>{isAr ? 'مقال توضيحي' : 'Sample Article'}</h3>
          <p className="text-lg leading-relaxed">
            {isAr 
              ? 'هذه فقرة تمهيدية بحجم كبير ومسافات مريحة بين الأسطر. تستخدم للمقدمات والنصوص الافتتاحية التي تحتاج إلى جذب الانتباه وتسهيل القراءة.'
              : 'This is a lead paragraph with larger text and relaxed line spacing. Used for introductions and opening text that needs to grab attention and be easy to read.'
            }
          </p>
          <p>
            {isAr
              ? 'هذه فقرة عادية بالحجم الأساسي. تحتوي على معلومات مفصلة وتستخدم الحجم والتباعد القياسي للحفاظ على القراءة المريحة. يمكن أن تحتوي على روابط وعناصر أخرى.'
              : 'This is a regular paragraph with base text size. It contains detailed information and uses standard sizing and spacing for comfortable reading. It can contain links and other elements.'
            }
          </p>
          <blockquote>
            {isAr
              ? '"الاقتباسات تستخدم حجماً أكبر قليلاً ووزن متوسط مع نمط مائل لتمييزها عن النص العادي."'
              : '"Blockquotes use slightly larger text with medium weight and italic style to distinguish them from regular text."'
            }
          </blockquote>
          <ul>
            <li>{isAr ? 'عنصر قائمة أول' : 'First list item'}</li>
            <li>{isAr ? 'عنصر قائمة ثاني' : 'Second list item'}</li>
            <li>{isAr ? 'عنصر قائمة ثالث' : 'Third list item'}</li>
          </ul>
        </article>
      </section>

      {/* Code Examples */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
          {isAr ? 'أمثلة الأكواد' : 'Code Examples'}
        </h2>
        <div className="space-y-3">
          <p className="text-zinc-700 dark:text-zinc-200">
            {isAr ? 'استخدم ' : 'Use '}
            <code>inline code</code>
            {isAr ? ' للأكواد المضمنة في النص' : ' for inline code snippets'}
          </p>
          <pre className="bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100">
{`function greet(name) {
  return \`Hello, \${name}!\`;
}`}
          </pre>
        </div>
      </section>
    </div>
  );
}
