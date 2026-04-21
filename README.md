# عالم الأطفال 🌍👶

متجر إلكتروني متكامل للكتب والألعاب التعليمية للأطفال — يعمل بـ Next.js 14 مع دعم كامل للعربية والـ RTL.

---

## 🚀 التشغيل السريع

### المتطلبات
- Node.js 18+
- npm أو yarn

### خطوات التشغيل

```bash
# 1. تثبيت المكتبات
npm install

# 2. إنشاء ملف البيئة
copy .env.example .env

# 3. إنشاء قاعدة البيانات
npm run db:push

# 4. إضافة البيانات التجريبية (10 منتجات)
npm run db:seed

# 5. تشغيل المشروع
npm run dev
```

افتح [http://localhost:3000](http://localhost:3000) في المتصفح.

---

## 🗂️ هيكل المشروع

```
kids_world_j/
├── app/
│   ├── page.tsx                    # الصفحة الرئيسية
│   ├── category/[ageGroup]/        # صفحات التصنيف
│   ├── product/[slug]/             # صفحة المنتج + نموذج الطلب
│   ├── order-success/              # صفحة تأكيد الطلب
│   ├── admin/                      # لوحة الأدمن
│   └── api/                        # API Routes
├── components/
│   ├── layout/    (Header, Footer, CartDrawer)
│   ├── home/      (Hero, Categories, WhyUs, BestSellers, Testimonials)
│   └── product/   (ProductCard, OrderForm)
├── lib/
│   ├── algeria-data.ts  # 58 ولاية + 1500+ بلدية
│   ├── prisma.ts
│   └── utils.ts
├── prisma/
│   ├── schema.prisma    # نموذج قاعدة البيانات
│   └── seed.ts          # 10 منتجات تجريبية
├── store/
│   └── cart.ts          # Zustand سلة المشتريات
└── types/index.ts
```

---

## 🎛️ لوحة الأدمن

اذهب إلى [http://localhost:3000/admin](http://localhost:3000/admin)

- **كلمة المرور:** ما كتبتها في `.env` → `ADMIN_PASSWORD`
- **الوظائف:**
  - إضافة / تعديل / إخفاء المنتجات
  - عرض وتحديث حالة الطلبات
  - تصدير الطلبات إلى CSV

### تحديث حالة الطلب
```
جديد → قيد التحضير → تم الشحن → مُسلَّم
```

---

## ➕ إضافة منتج جديد

**من لوحة الأدمن:**
1. اذهب لـ `/admin/products`
2. اضغط "منتج جديد"
3. أدخل: اسم، العنوان الجذاب، السعر، الصور، المميزات
4. اضغط "حفظ"

**بالكود (seed):**
أضف عنصراً جديداً في `prisma/seed.ts` ثم شغّل `npm run db:seed`

---

## 🌍 بيانات الولايات

ملف `lib/algeria-data.ts` يحتوي على:
- 58 ولاية جزائرية بأسمائها العربية والفرنسية
- 1500+ بلدية مرتبطة بكل ولاية
- أسعار التوصيل لكل ولاية (منزل / مكتب)

---

## 🚢 النشر على Vercel

```bash
# 1. ثبّت Vercel CLI
npm i -g vercel

# 2. ارفع المشروع
vercel

# 3. أضف متغيرات البيئة في Vercel Dashboard:
#    ADMIN_PASSWORD=xxx
#    DATABASE_URL=file:./dev.db
```

> **ملاحظة:** لقاعدة البيانات في الإنتاج، استخدم PlanetScale أو Turso بدلاً من SQLite.

---

## 📱 المميزات التقنية

| الميزة | التقنية |
|--------|---------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Database | SQLite + Prisma ORM |
| Forms | React Hook Form + Zod |
| Cart | Zustand |
| Animations | Framer Motion |
| Direction | RTL — Arabic (Cairo font) |
| Delivery | 58 Algerian wilayas |

---

## 📞 تواصل

لأي استفسار أو مشكلة تقنية، يرجى فتح Issue في المشروع.
