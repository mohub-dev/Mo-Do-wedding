# الرسائل الصوتية للعروسين Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** إضافة بطاقة تُمكّن الضيف من تسجيل وإرسال رسالة صوتية مدتها حتى 60 ثانية، مع لوحة إدارة خاصة للاستماع والحذف.

**Architecture:** يرفع العميل ملف WebM/Opus عبر `multipart/form-data` إلى Worker. يتحقق Worker من البيانات ويخزن الملف في R2 الخاص ثم يحتفظ بالبيانات الوصفية في D1؛ لا يمرر الملف إلا عبر مسار إدارة محمي. يضيف React بطاقة التسجيل وتبويب الإدارة فوق سياق البيانات القائم.

**Tech Stack:** React 19، TypeScript، MediaRecorder، Cloudflare Workers، R2، D1، Vitest، React Testing Library.

**Spec:** `docs/superpowers/specs/2026-10-06-voice-messages-design.md`

## Global Constraints

- الاسم إلزامي، بعد `trim`، وبحد أقصى 100 حرف.
- يدعم تسجيل `audio/webm`/Opus فقط.
- مدة التسجيل القصوى 60 ثانية؛ يوقف العميل التسجيل تلقائيًا عندها.
- الحد الأقصى للملف 5 MiB.
- Bucket الإنتاج: `mo-do-wedding-voice-messages`، وbinding الاسم `VOICE_MESSAGES`.
- التسجيلات خاصة: الاستماع والحذف وقائمة التسجيلات للمشرف فقط.
- لا ترفع الأسرار أو ملفات `.dev.vars` إلى Git.

## Review Focus

- متصفح لا يدعم `MediaRecorder` أو يرفض إذن الميكروفون: تعرض البطاقة رسالة عربية ولا تعرض حالة تسجيل زائفة.
- انتهاء 60 ثانية أثناء التسجيل: يوقف التسجيل مرة واحدة ويجعل المعاينة متاحة دون تسريب مؤقتات.
- ملف أكبر من 5 MiB أو غير WebM/Opus: يرفضه Worker قبل التخزين ولا ينشئ سجل D1.
- فشل D1 بعد رفع R2: يحذف Worker الكائن المرفوع ولا يترك ملفًا يتيمًا.
- حساب غير مسجل كمشرف: لا يستطيع عرض القائمة أو بث ملف الصوت أو الحذف.

---

## File Structure

- `migrations/0002_voice_messages.sql`: جدول وفهرس البيانات الوصفية للتسجيلات.
- `wrangler.jsonc`: binding R2 المحلي والإنتاجي باسم `VOICE_MESSAGES`.
- `src/types.ts`: نوع `VoiceMessageRecord` وأنواع الرفع المشتركة مع الواجهة.
- `src/worker.ts`: التحقق من تحميل الصوت، ومسارات القائمة/البث/الحذف المحمية.
- `src/context/WeddingDataContext.tsx`: حالة التسجيلات وعمليات الجلب والحذف والرفع.
- `src/components/VoiceMessageCard.tsx`: تجربة الضيف لتسجيل، معاينة، وإرسال الصوت.
- `src/components/VoiceMessagesAdmin.tsx`: قائمة المشرف ومشغّل الصوت والحذف.
- `src/components/WeddingCard.tsx`: إدراج بطاقة الضيف بعد دفتر التهاني.
- `src/components/AdminDashboard.tsx`: إضافة تبويب الرسائل الصوتية.
- `tests/worker/voiceMessages.test.ts`: اختبارات مسارات Worker باستخدام D1/R2 محاكيين.
- `tests/components/VoiceMessageCard.test.tsx`: اختبارات واجهة التسجيل وحالات الخطأ.
- `tests/components/VoiceMessagesAdmin.test.tsx`: اختبارات واجهة الإدارة والحذف.
- `vitest.config.ts` و`tests/setup.ts`: بيئة Vitest وjsdom.
- `README.md`: إعداد Bucket R2، تطبيق الترحيل، وتشغيل التطوير المحلي.

### Task 1: Establish storage schema, bindings, and test harness

**Files:**
- Create: `migrations/0002_voice_messages.sql`
- Create: `vitest.config.ts`
- Create: `tests/setup.ts`
- Modify: `package.json`
- Modify: `package-lock.json`
- Modify: `wrangler.jsonc`
- Modify: `src/worker.ts:7-12`
- Modify: `src/types.ts`
- Test: `tests/worker/voiceMessages.test.ts`

**Interfaces:**
- Produces: `Env.VOICE_MESSAGES: R2Bucket` and `VoiceMessageRecord` with `id`, `guestName`, `contentType`, `sizeBytes`, `durationSeconds`, and `createdAt`.
- Produces: `npm test` running Vitest once and `npm run test:watch` for local development.

- [ ] **Step 1: Add failing schema/config assertions**

Create `tests/worker/voiceMessages.test.ts` asserting that a supported test environment exposes `DB` and `VOICE_MESSAGES`, and that a query against `voice_messages` succeeds after migrations.

- [ ] **Step 2: Run the Worker test to verify it fails**

Run: `npm test -- tests/worker/voiceMessages.test.ts`

Expected: FAIL because the R2 binding, table, and Vitest Worker test environment are absent.

- [ ] **Step 3: Configure test dependencies and scripts**

Add `vitest`, `jsdom`, `@testing-library/react`, and `@testing-library/user-event` as development dependencies. Configure Vitest to load `tests/setup.ts`; add `test` and `test:watch` scripts. Keep the current `lint` and `build` scripts intact.

- [ ] **Step 4: Add R2/D1 storage definitions**

Create migration `0002_voice_messages.sql` with `voice_messages(id TEXT PRIMARY KEY, guest_name TEXT NOT NULL, object_key TEXT NOT NULL UNIQUE, content_type TEXT NOT NULL, size_bytes INTEGER NOT NULL, duration_seconds INTEGER NOT NULL, created_at TEXT NOT NULL)` and an index on `created_at DESC`. Add `r2_buckets` entry binding `VOICE_MESSAGES` to `mo-do-wedding-voice-messages`. Extend Worker `Env` and add the `VoiceMessageRecord` client type.

- [ ] **Step 5: Run the Worker test to verify it passes**

Run: `npm test -- tests/worker/voiceMessages.test.ts`

Expected: PASS; the test database has the new table and the R2 binding is available.

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json vitest.config.ts tests/setup.ts tests/worker/voiceMessages.test.ts migrations/0002_voice_messages.sql wrangler.jsonc src/worker.ts src/types.ts
git commit -m "feat: add voice message storage foundation"
```

### Task 2: Implement validated Worker upload and protected administration routes

**Files:**
- Modify: `src/worker.ts:240-700`
- Test: `tests/worker/voiceMessages.test.ts`

**Interfaces:**
- Consumes: `Env.DB`, `Env.VOICE_MESSAGES`, current `isAuthenticated`, `verifySameOrigin`, and request-rate limiting.
- Produces:
  - `POST /api/voice-messages` accepting form fields `guestName`, `durationSeconds`, and `audio`.
  - `GET /api/voice-messages` for admins.
  - `GET /api/voice-messages/:id/audio` for admins.
  - `DELETE /api/voice-messages/:id` for admins.

- [ ] **Step 1: Write failing Worker route tests**

Add tests that:

```ts
expect(response.status).toBe(201); // valid 10-second audio/webm upload
expect(rejectedEmptyName.status).toBe(400);
expect(rejectedOversize.status).toBe(413);
expect(rejectedDuration.status).toBe(400); // 61 seconds
expect(unauthenticatedList.status).toBe(401);
```

Use a real `FormData`/`File` fixture with `type: 'audio/webm'`; after a valid request, assert the D1 metadata and R2 object both exist. Add a test that forces D1 insertion to fail and expects the uploaded R2 object to be removed.

- [ ] **Step 2: Run Worker tests to verify they fail**

Run: `npm test -- tests/worker/voiceMessages.test.ts`

Expected: FAIL because the four routes do not exist.

- [ ] **Step 3: Implement upload validation and route handlers**

Add constants `MAX_VOICE_MESSAGE_DURATION_SECONDS = 60`, `MAX_VOICE_MESSAGE_BYTES = 5 * 1024 * 1024`, and supported MIME predicate for `audio/webm`. Generate an ID with `crypto.randomUUID()` and object key `voice-messages/<id>.webm`. Validate before `R2.put`; use the same ID in D1. On D1 failure after `put`, call `VOICE_MESSAGES.delete(objectKey)` before returning a 500.

For administration, select only metadata in the list response; stream `R2Object.body` with saved content type from the audio route; require `isAuthenticated` before every route. Delete the R2 object first, then delete its D1 row only if the object deletion succeeds.

- [ ] **Step 4: Run Worker tests to verify they pass**

Run: `npm test -- tests/worker/voiceMessages.test.ts`

Expected: PASS, including authorization, invalid-input, rollback, listing, streaming, and deletion cases.

- [ ] **Step 5: Commit**

```bash
git add src/worker.ts tests/worker/voiceMessages.test.ts
git commit -m "feat: add secure voice message API"
```

### Task 3: Add client data APIs and the guest recording card

**Files:**
- Create: `src/components/VoiceMessageCard.tsx`
- Modify: `src/context/WeddingDataContext.tsx`
- Modify: `src/components/WeddingCard.tsx:260-267`
- Test: `tests/components/VoiceMessageCard.test.tsx`

**Interfaces:**
- Consumes: `MediaRecorder`, `navigator.mediaDevices.getUserMedia`, and context function `saveVoiceMessage(input: { guestName: string; durationSeconds: number; audio: Blob }): Promise<boolean>`.
- Produces: `VoiceMessageCard({ initialGuestName?: string })` and context state `voiceMessages`, plus `fetchVoiceMessages` and `deleteVoiceMessage` for admin consumers.

- [ ] **Step 1: Write failing card tests**

Add tests that assert: start and send controls are disabled or blocked for empty names; a fake recorder reaching 60 seconds calls `stop()` once; denied microphone access displays Arabic error copy; an upload error preserves the preview and exposes retry; a successful upload clears the form. Mock only browser media APIs and assert visible UI states.

- [ ] **Step 2: Run component tests to verify they fail**

Run: `npm test -- tests/components/VoiceMessageCard.test.tsx`

Expected: FAIL because `VoiceMessageCard` and context methods do not exist.

- [ ] **Step 3: Extend `WeddingDataContext` audio state and methods**

Fetch the protected list only after a successful admin-session check. Implement `saveVoiceMessage` with `FormData`; do not set a manual `Content-Type`. Include credentials for admin-only list, stream, and delete requests. Keep public upload response handling separate from admin state.

- [ ] **Step 4: Implement `VoiceMessageCard`**

Use `MediaRecorder` with an `audio/webm` MIME preference when supported. Maintain focused states for `idle`, `recording`, `preview`, `uploading`, `success`, and `error`. Accumulate `dataavailable` chunks into one `Blob`, create/revoke preview object URLs correctly, and clean up the recorder, tracks, interval, timeout, and URL on unmount. Stop automatically at 60 seconds. Render Arabic labels: «اترك رسالة صوتية للعروسين»، «ابدأ التسجيل»، «إيقاف التسجيل»، «استمع للمعاينة»، «إعادة التسجيل»، و«إرسال الرسالة».

- [ ] **Step 5: Insert the card after `Guestbook`**

Pass `guestName` from `WeddingCard` as `initialGuestName`. Do not alter the existing RSVP, guestbook, or action-tray flows.

- [ ] **Step 6: Run component tests to verify they pass**

Run: `npm test -- tests/components/VoiceMessageCard.test.tsx`

Expected: PASS for input validation, 60-second stop, microphone denial, retry, and successful submission.

- [ ] **Step 7: Commit**

```bash
git add src/components/VoiceMessageCard.tsx src/context/WeddingDataContext.tsx src/components/WeddingCard.tsx tests/components/VoiceMessageCard.test.tsx
git commit -m "feat: add guest voice message recorder"
```

### Task 4: Add protected voice-message administration UI

**Files:**
- Create: `src/components/VoiceMessagesAdmin.tsx`
- Modify: `src/components/AdminDashboard.tsx`
- Test: `tests/components/VoiceMessagesAdmin.test.tsx`

**Interfaces:**
- Consumes: `voiceMessages: VoiceMessageRecord[]`, `isLoadingVoiceMessages`, `fetchVoiceMessages(): Promise<void>`, and `deleteVoiceMessage(id: string): Promise<boolean>` from context.
- Produces: `VoiceMessagesAdmin` rendered only after the dashboard confirms the active admin session.

- [ ] **Step 1: Write failing admin component tests**

Add tests asserting that the empty state is shown with no messages, each item renders guest name/date/duration and an audio source at `/api/voice-messages/<id>/audio`, and confirmed deletion calls the real context function then removes the item from the displayed list.

- [ ] **Step 2: Run the admin component tests to verify they fail**

Run: `npm test -- tests/components/VoiceMessagesAdmin.test.tsx`

Expected: FAIL because the component and dashboard tab are absent.

- [ ] **Step 3: Implement `VoiceMessagesAdmin` and dashboard tab**

Add `voiceMessages` to the dashboard tab union and use a `Mic` icon. Render the component only within the authenticated dashboard branch. Use a relative audio route, `controls`, `preload="none"`, and a confirmation dialog before deletion. Call `fetchVoiceMessages` when the tab becomes active.

- [ ] **Step 4: Run the admin component tests to verify they pass**

Run: `npm test -- tests/components/VoiceMessagesAdmin.test.tsx`

Expected: PASS for empty, populated, and deletion states.

- [ ] **Step 5: Commit**

```bash
git add src/components/VoiceMessagesAdmin.tsx src/components/AdminDashboard.tsx tests/components/VoiceMessagesAdmin.test.tsx
git commit -m "feat: manage voice messages in admin dashboard"
```

### Task 5: Document deployment and verify the complete feature

**Files:**
- Modify: `README.md`
- Modify: `package.json` only if a verification script is needed

**Interfaces:**
- Consumes: all previous routes, UI, migration, and R2 binding.
- Produces: reproducible local and Cloudflare deployment instructions for R2 voice messages.

- [ ] **Step 1: Add deployment instructions**

Document `npx wrangler r2 bucket create mo-do-wedding-voice-messages`, the exact `wrangler.jsonc` binding, `npm run d1:migrate:local`, `npm run d1:migrate:remote`, and that R2 must remain private because Worker admin routes proxy playback.

- [ ] **Step 2: Run focused test suite**

Run: `npm test -- tests/worker/voiceMessages.test.ts tests/components/VoiceMessageCard.test.tsx tests/components/VoiceMessagesAdmin.test.tsx`

Expected: PASS with all voice-message tests green.

- [ ] **Step 3: Run repository verification**

Run: `npm run lint && npm run build`

Expected: PASS with no TypeScript errors and a production bundle generated in `dist/`.

- [ ] **Step 4: Run local integration check**

Run: `npm run d1:migrate:local` followed by `npm run cf:dev`.

Use a browser with microphone permission to upload a short recording, confirm it appears in the authenticated dashboard, plays only through the protected route, and is removed from both D1 and R2 when deleted.

- [ ] **Step 5: Commit**

```bash
git add README.md package.json package-lock.json
git commit -m "docs: document voice message deployment"
```
