# دعوة زفاف محمد ودنيا 💍 (Mo-Do Wedding Invitation)

مشروع دعوة زفاف إلكترونية تفاعلية فاخرة مصممة بتقنيات الويب الحديثة، ومجهزة للاستضافة الكاملة على شبكة **Cloudflare Workers** باستخدام **Static Assets** و **Cloudflare D1** كقاعدة بيانات سحابية مركزية مشتركة.

---

## 🏗️ المعمارية التقنية (Architecture)

```
React + Vite (Frontend)
       ↓
Cloudflare Workers (Runtime)
       ↓
Static Assets (dist/ + SPA Fallback) + Worker API (/api/*)
       ↓
Cloudflare D1 (Serverless SQLite Database)
```

1. **الواجهة الأمامية (Frontend)**:
   - React 19 + TypeScript + Vite + Tailwind CSS v4.
   - مكتبات الحركة والتأثيرات الملكية: Motion (`motion/react`) و `canvas-confetti`.
   - المؤثرات الصوتية: `wedding_song.mp3` كأصل ثابت (Static Asset) يُبث مباشرة من شبكة Cloudflare.

2. **الخادم السحابي (Cloudflare Worker API)**:
   - مسار الدخول: `src/worker.ts`.
   - يقوم بمعالجة جميع طلبات `/api/*` بدقة، مع حماية CSRF، وتحقق صارم من صحة المدخلات.
   - يمرّر جميع الطلبات الأخرى (HTML, CSS, JS, Images, Audio) إلى ميزة **Workers Static Assets** مع توجيه SPA (`single-page-application`).

3. **قاعدة البيانات (Cloudflare D1)**:
   - اسم قاعدة البيانات: `mo-do-wedding-db`.
   - ملف الترحيل الأولي: `migrations/0001_initial.sql`.
   - الجداول المصممة:
     - `rsvps`: تسجيل وتأكيد حضور واعتذار الضيوف وعدد المرافقين.
     - `guestbook`: سجل التهاني والمباركات وعدد الإعجابات.
     - `guests`: قائمة الضيوف وإرسال الدعوات المخصصة عبر واتساب (Bulk Dispatcher).
     - `wedding_settings`: حفظ إعدادات وتعديلات الحفل المباشرة (Live Event Editor).

4. **نظام الحماية والمشرف (Security & Admin Authentication)**:
   - شاشة تسجيل دخول مخصصة للمشرف بتصميم ملكي فاخر متناسق مع بطاقة الدعوة.
   - يتم تخزين كلمة المرور في سر مشفر `ADMIN_PASSWORD` (Cloudflare Secret) بعيدًا عن الـ Client وGit.
   - إدارة الجلسات بواسطة ملفات تعريف ارتباط (Cookies) موقّعة بخوارزمية **HMAC-SHA256** عبر **Web Crypto API** ببادئة `__Host-admin_session` مع حقول `HttpOnly`, `Secure`, `SameSite=Strict`, وصلاحية 12 ساعة.
     > **ملاحظة أمنية**: توقيع HMAC يضمن مصداقية البيانات وعدم التلاعب بها، ولكنه لا يقوم بتشفير محتواها.
   - **إبطال الجلسات خادميًا (Server-side Session Revocation)**: عند تسجيل الخروج، يتم تسجيل ختم زمني في D1 (`admin_session_revoked_before`) لرفض أي جلسات سابقة فورًا على الخادم.
   - **توضيح صريح حول حماية السبام ومعدل الطلبات**:
     - آلية تحديد معدل الطلبات المطبقة في الـ Worker تعتمد على ذاكرة داخلية (In-Memory Map) لكل Isolate، وهي حماية **Best-Effort فقط** وليست حاجز سبام كامل أو موزع عبر شبكة Cloudflare.
     - نظام **Cloudflare Turnstile** لم يُنفذ بعد في الواجهات؛ وللحصول على حماية متقدمة ومطلقة ضد روبوتات الإغراق، يُوصى بإضافة Turnstile مستقبلاً (متاح مجانًا من Cloudflare).

---

## 📋 المتطلبات السابقة (Prerequisites)

- Node.js (الإصدار 18 أو أحدث، تم اختباره على Node v24).
- حساب Cloudflare مجاني (Cloudflare Free Plan كافٍ تمامًا لأكثر من 100 ألف طلب يوميًا).
- تثبيت الحزم بواسطة `npm`.

---

## 🚀 البدء السريع والتطوير المحلي (Local Development)

### 1. تثبيت الاعتماديات (Install Dependencies)
```bash
npm install
```

### 2. تجهيز متغيرات التطوير المحلي (Local Dev Secrets)
انسخ ملف `.dev.vars.example` إلى `.dev.vars`:
```bash
cp .dev.vars.example .dev.vars
```
محتوى الملف:
```env
ADMIN_PASSWORD=your_local_admin_password
SESSION_SECRET=your_local_random_hmac_secret_key_12345
```
*(ملف `.dev.vars` مدرج في `.gitignore` ولا يتم رفعه إلى Git مطلقًا).*

### 3. تطبيق ترحيل قاعدة البيانات محليًا (Run Local Migrations)
```bash
npm run d1:migrate:local
```

### 4. تشغيل خادم التطوير السحابي محليًا (Run Local Worker & Assets)
```bash
npm run build
npm run cf:dev
```
سيعمل التطبيق على الرابط المحلي:
`http://127.0.0.1:8787`

---

## 🌐 النشر على Cloudflare Workers (Production Deployment)

### 1. تسجيل الدخول إلى Cloudflare عبر Wrangler
```bash
npx wrangler login
```

### 2. إنشاء قاعدة بيانات D1 السحابية
```bash
npx wrangler d1 create mo-do-wedding-db
```
سيقوم Wrangler بإرجاع معرّف قاعدة البيانات `database_id` بالشكل التالي:
```jsonc
[[d1_databases]]
binding = "DB"
database_name = "mo-do-wedding-db"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```
ضع الـ `database_id` الناتج داخل ملف `wrangler.jsonc`.

### 3. تطبيق الترحيل على قاعدة البيانات السحابية (Apply Remote Migration)
```bash
npm run d1:migrate:remote
```

### 4. ضبط أسرار الإنتاج في Cloudflare (Set Cloudflare Secrets)
```bash
npx wrangler secret put ADMIN_PASSWORD
# أدخل كلمة المرور القوية لحساب المشرف عند الطلب

npx wrangler secret put SESSION_SECRET
# أدخل مفتاح توقيع الجلسات العشوائي والطويل عند الطلب
```

### 5. البناء والنشر (Build & Deploy)
```bash
npm run cf:deploy
```
أو بالخطوات المنفصلة:
```bash
npm run build
npx wrangler deploy
```

---

## 📡 واجهات البرمجة (API Endpoints)

| المسار | الطريقة | الوصول | الوصف |
|---|---|---|---|
| `GET /api/invitation` | GET | عام (Public) | استرجاع بيانات الحفل المباشرة من D1 أو الافتراضيات |
| `POST /api/invitation` | POST | مشرف (Admin) | حفظ التعديلات المباشرة على تفاصيل الحفل في D1 |
| `POST /api/invitation/reset` | POST | مشرف (Admin) | استعادة إعدادات الحفل الافتراضية |
| `POST /api/rsvps` | POST | عام (Public) | تسجيل تأكيد أو اعتذار الحضور للضيف |
| `GET /api/rsvps` | GET | مشرف (Admin) | استعراض كافة تأكيدات الحضور وإحصاءاتها |
| `POST /api/rsvps/manual` | POST | مشرف (Admin) | إضافة تأكيد حضور يدويًا |
| `DELETE /api/rsvps/:id` | DELETE | مشرف (Admin) | حذف تسجيل حضور ضيف |
| `GET /api/guestbook` | GET | عام (Public) | استرجاع رسائل دفتر التهاني والمباركات |
| `POST /api/guestbook` | POST | عام (Public) | إرسال تهنئة مباركة جديدة |
| `POST /api/guestbook/:id/like` | POST | عام (Public) | تسجيل إعجاب بتهنئة |
| `DELETE /api/guestbook/:id` | DELETE | مشرف (Admin) | حذف رسالة تهنئة |
| `GET /api/guests` | GET | مشرف (Admin) | استعراض قائمة الضيوف لمساعد الإرسال السريع |
| `POST /api/guests` | POST | مشرف (Admin) | حفظ أو تحديث بيانات الضيوف (فردي أو جماعي) |
| `DELETE /api/guests/:id` | DELETE | مشرف (Admin) | حذف ضيف من القائمة |
| `POST /api/guests/clear` | POST | مشرف (Admin) | مسح قائمة الضيوف بالكامل |
| `POST /api/admin/login` | POST | عام (Public) | تسجيل دخول المشرف وإصدار Session Cookie موقّعة |
| `POST /api/admin/logout` | POST | مشرف (Admin) | تسجيل الخروج ومسح الـ Cookie |
| `GET /api/admin/session` | GET | عام (Public) | التحقق من صلاحية جلسة المشرف الحالية |

---

## 💰 توافق الخطة المجانية (Cloudflare Free Tier Analysis)

المشروع مصمم ليعمل **بنسبة 100% ضمن حدود الخطة المجانية** لـ Cloudflare لمتوسط 1,500 زيارة شهريًا:
- **Workers Requests**: 100,000 طلب مجاني يوميًا (الحاجة الفعلية للحفل: ~3,000 إلى 5,000 طلب شهريًا).
- **D1 Database Reads**: 5,000,000 قراءة مجانية يوميًا.
- **D1 Database Writes**: 100,000 كتابة مجانية يوميًا.
- **D1 Database Storage**: 5GB مجانًا (الحجم المتوقع لقاعدة البيانات بالكامل أقل من 5MB).
- **Workers Static Assets**: متضمنة في الخطة المجانية، مع تخزين مؤقت على شبكة CDN العالمية.
- لا توجد أي ميزات مدفوعة، أو Durable Objects، أو خوادم خارجية مطلوبة.

---

## 🔒 فحص TypeScript وبناء المشروع

```bash
# فحص الأنواع
npm run lint

# بناء حزمة الإنتاج
npm run build
```
كافة الفحوصات والـ Type Checking تجتاز بنجاح تام وبدون أي أخطاء (Zero TypeScript Errors).
