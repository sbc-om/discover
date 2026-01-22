# DNA - Discover Natural Ability 🏆

نظام متكامل ثنائي اللغة لاكتشاف وإدارة المواهب الرياضية  
A comprehensive multilingual sports talent discovery and management system

## المميزات / Features ✨

- **دعم ثنائي اللغة / Bilingual Support**: واجهة بالعربية والإنجليزية مع دعم RTL
- **التحكم بالصلاحيات / RBAC**: أدوار مدير، مدرب، ولاعب مع صلاحيات دقيقة
- **إدارة المستخدمين / User Management**: إدارة كاملة لدورة حياة المستخدمين
- **إدارة الأكاديميات / Academy Management**: تتبع وإدارة الأكاديميات الرياضية
- **الفحوصات الصحية / Health Tests**: مراقبة الصحة والأداء للرياضيين
- **طلبات الميداليات / Medal Requests**: إدارة الإنجازات والتكريمات
- **البرامج / Programs**: إدارة البرامج والجداول التدريبية
- **نظام المراسلة / Messaging**: رسائل داخلية مع تكامل WhatsApp
- **تصميم متجاوب / Responsive Design**: واجهة حديثة تعمل على جميع الأجهزة

## التقنيات المستخدمة / Tech Stack 🛠️

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, PostgreSQL
- **Authentication**: JWT + bcrypt
- **Internationalization**: next-intl
- **Database**: PostgreSQL 16
- **Containerization**: Docker & Docker Compose

## البدء السريع / Quick Start 🚀

### 1. تثبيت المتطلبات / Prerequisites
- Docker & Docker Compose
- Node.js 20+
- pnpm

### 2. إعداد البيئة / Setup
\`\`\`bash
cp .env.example .env
\`\`\`

### 3. تشغيل البرنامج / Run Application

**باستخدام Docker:**
\`\`\`bash
docker-compose up -d --build
\`\`\`

**أو تطوير محلي / Local Development:**
\`\`\`bash
pnpm install
pnpm dev
\`\`\`

### 4. الوصول للتطبيق / Access

- **Development**: http://localhost:3000
- **English**: http://localhost:3000/en
- **Arabic**: http://localhost:3000/ar

### بيانات الدخول الافتراضية / Default Login
- Email: admin@dna.com
- Password: admin123
- ⚠️ غيّر كلمة المرور في الإنتاج!

## هيكل المشروع / Project Structure 📁

\`\`\`
discover/
├── src/app/[locale]/        # الصفحات حسب اللغة
├── src/components/          # المكونات القابلة لإعادة الاستخدام
├── src/lib/                 # الأدوات المساعدة
├── messages/                # ملفات الترجمة
├── database/                # سكريبتات قاعدة البيانات
└── docker-compose.yml       # إعداد Docker
\`\`\`

## الأدوار والصلاحيات / Roles & Permissions 🔐

### المدير / Admin
- صلاحيات كاملة على جميع الموديولات

### المدرب / Coach
- قراءة/إنشاء/تحديث: المستخدمون، الفحوصات، البرامج، الرسائل

### اللاعب / Player  
- قراءة فقط: لوحة التحكم، الفحوصات، البرامج، الرسائل

## الموديولات / Modules 📦

1. لوحة التحكم / Dashboard
2. المستخدمون / Users
3. الأدوار / Roles
4. الأكاديميات / Academies
5. الفحوصات الصحية / Health Tests
6. طلبات الميداليات / Medal Requests
7. البرامج / Programs
8. الرسائل / Messages
9. واتساب / WhatsApp
10. الإعدادات / Settings

## أوامر مفيدة / Useful Commands

\`\`\`bash
# تطوير / Development
pnpm dev

# بناء / Build
pnpm build

# Docker
docker-compose up -d
docker-compose logs -f
docker-compose down

# قاعدة البيانات / Database
docker exec -i discover-postgres psql -U postgres -d discover < database/init.sql
\`\`\`

---

صنع بـ ❤️ لاكتشاف المواهب الرياضية  
Made with ❤️ for sports talent discovery
