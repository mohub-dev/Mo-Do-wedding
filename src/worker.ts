/**
 * Cloudflare Worker for Mo-Do Wedding Invitation
 * Handles /api/* routes with Cloudflare D1 and secure admin authentication.
 * All other routes are delegated to Cloudflare Workers Static Assets.
 */

export interface Env {
  DB: D1Database;
  ASSETS: Fetcher;
  ADMIN_PASSWORD?: string;
  SESSION_SECRET?: string;
}

/**
 * In-memory rate limiting and brute-force tracking
 *
 * IMPORTANT ARCHITECTURAL NOTE:
 * Cloudflare Workers isolates are distributed edge containers without shared memory.
 * These in-memory maps provide a localized, BEST-EFFORT throttle per isolate.
 * They do NOT represent a globally distributed rate limiter.
 * For production-grade, zero-cost bot and spam protection on public forms (RSVP & Guestbook),
 * Cloudflare Turnstile (100% free with unlimited requests) can be added as a widget.
 */
const loginAttempts = new Map<string, { count: number; resetAt: number }>();
const requestThrottles = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const record = requestThrottles.get(ip);
  if (!record || now > record.resetAt) {
    requestThrottles.set(ip, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (record.count >= limit) {
    return false;
  }
  record.count += 1;
  return true;
}

function checkLoginBruteForce(ip: string): boolean {
  const now = Date.now();
  const record = loginAttempts.get(ip);
  if (!record || now > record.resetAt) {
    return true;
  }
  return record.count < 5; // Max 5 failed attempts within 15 minutes per isolate
}

function recordFailedLogin(ip: string) {
  const now = Date.now();
  const record = loginAttempts.get(ip);
  if (!record || now > record.resetAt) {
    loginAttempts.set(ip, { count: 1, resetAt: now + 15 * 60 * 1000 });
  } else {
    record.count += 1;
  }
}

function resetLoginAttempts(ip: string) {
  loginAttempts.delete(ip);
}

/**
 * Web Crypto HMAC-SHA256 Token Helpers
 *
 * IMPORTANT NOTE:
 * HMAC signs the payload to verify authenticity and prevent tampering;
 * it does NOT encrypt the payload. Confidential data must not be stored in the payload.
 */
async function signToken(payload: object, secret: string): Promise<string> {
  const jsonStr = JSON.stringify(payload);
  const enc = new TextEncoder();

  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign('HMAC', key, enc.encode(jsonStr));
  const sigB64 = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  const payloadB64 = btoa(jsonStr)
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

  return `${payloadB64}.${sigB64}`;
}

async function verifyToken(token: string, secret: string): Promise<{ valid: boolean; payload?: any }> {
  try {
    const parts = token.split('.');
    if (parts.length !== 2) return { valid: false };

    const [payloadB64, sigB64] = parts;
    const jsonStr = atob(payloadB64.replace(/-/g, '+').replace(/_/g, '/'));
    const parsed = JSON.parse(jsonStr);

    if (parsed.exp && Date.now() > parsed.exp) {
      return { valid: false }; // Expired
    }

    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      enc.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    const binarySig = Uint8Array.from(
      atob(sigB64.replace(/-/g, '+').replace(/_/g, '/')),
      c => c.charCodeAt(0)
    );

    const isValid = await crypto.subtle.verify('HMAC', key, binarySig, enc.encode(jsonStr));
    return { valid: isValid, payload: isValid ? parsed : undefined };
  } catch {
    return { valid: false };
  }
}

function getSessionSecret(env: Env): string {
  return env.SESSION_SECRET || env.ADMIN_PASSWORD || 'local_dev_fallback_session_secret_12345';
}

function parseCookies(cookieHeader: string | null): Record<string, string> {
  if (!cookieHeader) return {};
  const cookies: Record<string, string> = {};
  for (const pair of cookieHeader.split(';')) {
    const [name, ...rest] = pair.trim().split('=');
    if (name) {
      cookies[name] = rest.join('=');
    }
  }
  return cookies;
}

/**
 * Server-Side Session Authentication & Revocation Verification
 */
async function isAuthenticated(request: Request, env: Env): Promise<boolean> {
  const cookieHeader = request.headers.get('Cookie');
  const cookies = parseCookies(cookieHeader);
  // Prioritize __Host-admin_session, fallback to admin_session for non-HTTPS local dev
  const sessionToken = cookies['__Host-admin_session'] || cookies['admin_session'];
  if (!sessionToken) return false;

  const secret = getSessionSecret(env);
  const result = await verifyToken(sessionToken, secret);
  if (!result.valid || result.payload?.role !== 'admin') {
    return false;
  }

  // Server-side Revocation Check against D1 (Fail-Closed):
  // If database check fails for any reason, access is denied.
  try {
    const row = await env.DB.prepare(
      "SELECT value FROM wedding_settings WHERE key = 'admin_session_revoked_before'"
    ).first<{ value: string }>();
    if (row && row.value) {
      const revokedBefore = parseInt(row.value, 10);
      if (result.payload.createdAt && result.payload.createdAt <= revokedBefore) {
        return false; // Revoked!
      }
    }
  } catch (e) {
    console.error('Database error during session revocation check (Failing Closed)', e);
    return false; // Fail-Closed: deny access if database cannot be verified
  }

  return true;
}

/**
 * Strict Same-Origin Verification:
 * - Uses exact URL origin comparison (no startsWith)
 * - Allows localhost/127.0.0.1 cross-port ONLY if request is local
 * - Checks Origin header first, falls back to Referer with full origin match
 */
function verifySameOrigin(request: Request): boolean {
  const requestUrl = new URL(request.url);
  const expectedOrigin = requestUrl.origin;
  const isLocalRequest = requestUrl.hostname === 'localhost' || requestUrl.hostname === '127.0.0.1';

  const originHeader = request.headers.get('Origin');
  if (originHeader) {
    try {
      const parsedOrigin = new URL(originHeader);
      if (parsedOrigin.origin === expectedOrigin) return true;
      if (isLocalRequest && (parsedOrigin.hostname === 'localhost' || parsedOrigin.hostname === '127.0.0.1')) {
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  const refererHeader = request.headers.get('Referer');
  if (refererHeader) {
    try {
      const parsedReferer = new URL(refererHeader);
      if (parsedReferer.origin === expectedOrigin) return true;
      if (isLocalRequest && (parsedReferer.hostname === 'localhost' || parsedReferer.hostname === '127.0.0.1')) {
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  // If both Origin and Referer are absent on mutating requests, reject
  return false;
}

function jsonResponse(data: any, status = 200, headers: HeadersInit = {}): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      ...headers,
    },
  });
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const clientIp = request.headers.get('CF-Connecting-IP') || '127.0.0.1';

    // Route only /api/* requests inside the Worker API logic
    if (url.pathname.startsWith('/api/')) {
      const method = request.method;

      // Global CSRF / Origin Check on mutating requests
      if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
        if (!verifySameOrigin(request)) {
          return jsonResponse({ error: 'Ø±ÙØ¶ Ø§Ù„Ø§ØªØµØ§Ù„: Ø·Ù„Ø¨ ØºÙŠØ± Ù…ØµØ±Ø­ Ø¨Ù‡ (Cross-Origin rejected)' }, 403);
        }
      }

      try {
        /* -------------------------------------------------------------
         * 1. Public API: GET /api/invitation
         * ----------------------------------------------------------- */
        if (url.pathname === '/api/invitation' && method === 'GET') {
          const row = await env.DB.prepare(
            'SELECT value FROM wedding_settings WHERE key = ?'
          ).bind('invitation_data').first<{ value: string }>();

          if (row && row.value) {
            try {
              const parsed = JSON.parse(row.value);
              return jsonResponse({ success: true, data: parsed });
            } catch {
              return jsonResponse({ success: true, data: null });
            }
          }
          return jsonResponse({ success: true, data: null });
        }

        /* -------------------------------------------------------------
         * 2. Protected API: POST /api/invitation (Update Live Settings)
         * ----------------------------------------------------------- */
        if (url.pathname === '/api/invitation' && method === 'POST') {
          if (!(await isAuthenticated(request, env))) {
            return jsonResponse({ error: 'ØºÙŠØ± Ù…ØµØ±Ø­: ÙŠÙ„Ø²Ù… ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø¯Ø®ÙˆÙ„ ÙƒÙ…Ø´Ø±Ù' }, 401);
          }
          const body = await request.json();
          if (!body || typeof body !== 'object') {
            return jsonResponse({ error: 'Ø¨ÙŠØ§Ù†Ø§Øª ØºÙŠØ± ØµØ§Ù„Ø­Ø©' }, 400);
          }

          const valueStr = JSON.stringify(body);
          await env.DB.prepare(
            `INSERT INTO wedding_settings (key, value, updated_at)
             VALUES ('invitation_data', ?, CURRENT_TIMESTAMP)
             ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP`
          ).bind(valueStr).run();

          return jsonResponse({ success: true, message: 'ØªÙ… Ø­ÙØ¸ ØªÙØ§ØµÙŠÙ„ Ø§Ù„Ø¯Ø¹ÙˆØ© Ø¨Ù†Ø¬Ø§Ø­' });
        }

        /* -------------------------------------------------------------
         * 3. Protected API: POST /api/invitation/reset (Reset Settings)
         * ----------------------------------------------------------- */
        if (url.pathname === '/api/invitation/reset' && method === 'POST') {
          if (!(await isAuthenticated(request, env))) {
            return jsonResponse({ error: 'ØºÙŠØ± Ù…ØµØ±Ø­: ÙŠÙ„Ø²Ù… ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø¯Ø®ÙˆÙ„ ÙƒÙ…Ø´Ø±Ù' }, 401);
          }
          await env.DB.prepare(
            'DELETE FROM wedding_settings WHERE key = ?'
          ).bind('invitation_data').run();

          return jsonResponse({ success: true, message: 'ØªÙ…Øª Ø§Ø³ØªØ¹Ø§Ø¯Ø© Ø§Ù„Ø¥Ø¹Ø¯Ø§Ø¯Ø§Øª Ø§Ù„Ø§ÙØªØ±Ø§Ø¶ÙŠØ© Ø¨Ù†Ø¬Ø§Ø­' });
        }

        /* -------------------------------------------------------------
         * 4. Public API: POST /api/rsvps (Submit RSVP)
         * ----------------------------------------------------------- */
        if (url.pathname === '/api/rsvps' && method === 'POST') {
          if (!checkRateLimit(clientIp, 10, 60 * 1000)) {
            return jsonResponse({ error: 'ØªÙ… ØªØ¬Ø§ÙˆØ² Ø§Ù„Ø­Ø¯ Ø§Ù„Ù…Ø³Ù…ÙˆØ­ Ù…Ù† Ø§Ù„Ù…Ø­Ø§ÙˆÙ„Ø§Øª. ÙŠØ±Ø¬Ù‰ Ø§Ù„Ø§Ù†ØªØ¸Ø§Ø± Ø¯Ù‚ÙŠÙ‚Ø©' }, 429);
          }

          const body = (await request.json()) as any;
          const guestName = (body.guestName || '').trim();
          const status = body.status;
          const companionCount = parseInt(body.companionCount, 10) || 0;
          const note = (body.note || '').trim();
          const submittedAt = (body.submittedAt || '').trim() || new Date().toLocaleString('ar-EG');
          const id = (body.id || '').trim() || Date.now().toString();

          // Server-side Validation
          if (!guestName || guestName.length > 100) {
            return jsonResponse({ error: 'Ø§Ø³Ù… Ø§Ù„Ø¶ÙŠÙ Ù…Ø·Ù„ÙˆØ¨ ÙˆÙ„Ø§ ÙŠØ¬Ø¨ Ø£Ù† ÙŠØªØ¬Ø§ÙˆØ² 100 Ø­Ø±Ù' }, 400);
          }
          if (status !== 'attending' && status !== 'declined') {
            return jsonResponse({ error: 'Ø­Ø§Ù„Ø© Ø§Ù„Ø­Ø¶ÙˆØ± ÙŠØ¬Ø¨ Ø£Ù† ØªÙƒÙˆÙ† Ø­Ø¶ÙˆØ± Ø£Ùˆ Ø§Ø¹ØªØ°Ø§Ø±' }, 400);
          }
          if (companionCount < 0 || companionCount > 20) {
            return jsonResponse({ error: 'Ø¹Ø¯Ø¯ Ø§Ù„Ù…Ø±Ø§ÙÙ‚ÙŠÙ† ØºÙŠØ± ØµØ§Ù„Ø­' }, 400);
          }
          if (note.length > 500) {
            return jsonResponse({ error: 'Ø§Ù„Ù…Ù„Ø§Ø­Ø¸Ø© ÙŠØ¬Ø¨ Ø£Ù„Ø§ ØªØªØ¬Ø§ÙˆØ² 500 Ø­Ø±Ù' }, 400);
          }

          // Delete any existing RSVP for this exact guest name to avoid duplication
          await env.DB.prepare(
            'DELETE FROM rsvps WHERE guest_name = ?'
          ).bind(guestName).run();

          // Insert new RSVP record
          await env.DB.prepare(
            `INSERT INTO rsvps (id, guest_name, status, companion_count, note, submitted_at, created_at)
             VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`
          ).bind(id, guestName, status, status === 'attending' ? companionCount : 0, note, submittedAt).run();

          return jsonResponse({
            success: true,
            record: {
              id,
              guestName,
              status,
              companionCount: status === 'attending' ? companionCount : 0,
              note,
              submittedAt,
            }
          });
        }

        /* -------------------------------------------------------------
         * 5. Protected API: GET /api/rsvps (List All RSVPs for Admin)
         * ----------------------------------------------------------- */
        if (url.pathname === '/api/rsvps' && method === 'GET') {
          if (!(await isAuthenticated(request, env))) {
            return jsonResponse({ error: 'ØºÙŠØ± Ù…ØµØ±Ø­: ÙŠÙ„Ø²Ù… ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø¯Ø®ÙˆÙ„ ÙƒÙ…Ø´Ø±Ù' }, 401);
          }

          const { results } = await env.DB.prepare(
            'SELECT id, guest_name as guestName, status, companion_count as companionCount, note, submitted_at as submittedAt FROM rsvps ORDER BY created_at DESC'
          ).all();

          return jsonResponse({ success: true, rsvps: results || [] });
        }

        /* -------------------------------------------------------------
         * 6. Protected API: POST /api/rsvps/manual (Add Manual RSVP)
         * ----------------------------------------------------------- */
        if (url.pathname === '/api/rsvps/manual' && method === 'POST') {
          if (!(await isAuthenticated(request, env))) {
            return jsonResponse({ error: 'ØºÙŠØ± Ù…ØµØ±Ø­: ÙŠÙ„Ø²Ù… ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø¯Ø®ÙˆÙ„ ÙƒÙ…Ø´Ø±Ù' }, 401);
          }

          const body = (await request.json()) as any;
          const guestName = (body.guestName || '').trim();
          const status = body.status;
          const companionCount = parseInt(body.companionCount, 10) || 0;
          const note = (body.note || '').trim();
          const submittedAt = (body.submittedAt || '').trim() || new Date().toLocaleString('ar-EG');
          const id = (body.id || '').trim() || Date.now().toString();

          if (!guestName) {
            return jsonResponse({ error: 'Ø§Ø³Ù… Ø§Ù„Ø¶ÙŠÙ Ù…Ø·Ù„ÙˆØ¨' }, 400);
          }

          await env.DB.prepare(
            'DELETE FROM rsvps WHERE guest_name = ?'
          ).bind(guestName).run();

          await env.DB.prepare(
            `INSERT INTO rsvps (id, guest_name, status, companion_count, note, submitted_at, created_at)
             VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`
          ).bind(id, guestName, status, status === 'attending' ? companionCount : 0, note, submittedAt).run();

          return jsonResponse({
            success: true,
            record: {
              id,
              guestName,
              status,
              companionCount: status === 'attending' ? companionCount : 0,
              note,
              submittedAt,
            }
          });
        }

        /* -------------------------------------------------------------
         * 7. Protected API: DELETE /api/rsvps/:id
         * ----------------------------------------------------------- */
        if (url.pathname.startsWith('/api/rsvps/') && method === 'DELETE') {
          if (!(await isAuthenticated(request, env))) {
            return jsonResponse({ error: 'ØºÙŠØ± Ù…ØµØ±Ø­: ÙŠÙ„Ø²Ù… ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø¯Ø®ÙˆÙ„ ÙƒÙ…Ø´Ø±Ù' }, 401);
          }
          const id = url.pathname.replace('/api/rsvps/', '');
          await env.DB.prepare('DELETE FROM rsvps WHERE id = ?').bind(id).run();
          return jsonResponse({ success: true, message: 'ØªÙ… Ø§Ù„Ø­Ø°Ù Ø¨Ù†Ø¬Ø§Ø­' });
        }

        /* -------------------------------------------------------------
         * 8. Public API: GET /api/guestbook (List Messages)
         * ----------------------------------------------------------- */
        if (url.pathname === '/api/guestbook' && method === 'GET') {
          const { results } = await env.DB.prepare(
            'SELECT id, author, relation, content, created_at as createdAt, likes FROM guestbook ORDER BY created_timestamp DESC'
          ).all();

          return jsonResponse({ success: true, messages: results || [] });
        }

        /* -------------------------------------------------------------
         * 9. Public API: POST /api/guestbook (Post Message)
         * ----------------------------------------------------------- */
        if (url.pathname === '/api/guestbook' && method === 'POST') {
          if (!checkRateLimit(clientIp, 10, 60 * 1000)) {
            return jsonResponse({ error: 'ØªÙ… ØªØ¬Ø§ÙˆØ² Ø§Ù„Ø­Ø¯ Ø§Ù„Ù…Ø³Ù…ÙˆØ­ Ø¨Ù‡ Ù…Ù† Ø§Ù„Ø±Ø³Ø§Ø¦Ù„. ÙŠØ±Ø¬Ù‰ Ø§Ù„Ù…Ø­Ø§ÙˆÙ„Ø© Ù„Ø§Ø­Ù‚Ù‹Ø§' }, 429);
          }

          const body = (await request.json()) as any;
          const author = (body.author || '').trim();
          const relation = (body.relation || '').trim();
          const content = (body.content || '').trim();
          const createdAt = (body.createdAt || '').trim() || 'Ø§Ù„Ø¢Ù†';
          const id = (body.id || '').trim() || Date.now().toString();

          // Validation
          if (!author || author.length > 100) {
            return jsonResponse({ error: 'Ø§Ø³Ù… Ø§Ù„ÙƒØ§ØªØ¨ Ù…Ø·Ù„ÙˆØ¨ ÙˆÙ„Ø§ ÙŠØªØ¬Ø§ÙˆØ² 100 Ø­Ø±Ù' }, 400);
          }
          if (!content || content.length > 1000) {
            return jsonResponse({ error: 'Ù†Øµ Ø§Ù„ØªÙ‡Ù†Ø¦Ø© Ù…Ø·Ù„ÙˆØ¨ ÙˆÙ„Ø§ ÙŠØªØ¬Ø§ÙˆØ² 1000 Ø­Ø±Ù' }, 400);
          }

          await env.DB.prepare(
            `INSERT INTO guestbook (id, author, relation, content, created_at, likes, created_timestamp)
             VALUES (?, ?, ?, ?, ?, 1, CURRENT_TIMESTAMP)
             ON CONFLICT(id) DO UPDATE SET
               author = excluded.author,
               relation = excluded.relation,
               content = excluded.content,
               created_at = excluded.created_at`
          ).bind(id, author, relation, content, createdAt).run();

          return jsonResponse({
            success: true,
            message: {
              id,
              author,
              relation,
              content,
              createdAt,
              likes: 1,
            }
          });
        }

        /* -------------------------------------------------------------
         * 10. Public API: POST /api/guestbook/:id/like
         * ----------------------------------------------------------- */
        if (url.pathname.startsWith('/api/guestbook/') && url.pathname.endsWith('/like') && method === 'POST') {
          const id = url.pathname.replace('/api/guestbook/', '').replace('/like', '');
          await env.DB.prepare(
            'UPDATE guestbook SET likes = likes + 1 WHERE id = ?'
          ).bind(id).run();
          return jsonResponse({ success: true });
        }

        /* -------------------------------------------------------------
         * 11. Protected API: DELETE /api/guestbook/:id
         * ----------------------------------------------------------- */
        if (url.pathname.startsWith('/api/guestbook/') && method === 'DELETE') {
          if (!(await isAuthenticated(request, env))) {
            return jsonResponse({ error: 'ØºÙŠØ± Ù…ØµØ±Ø­: ÙŠÙ„Ø²Ù… ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø¯Ø®ÙˆÙ„ ÙƒÙ…Ø´Ø±Ù' }, 401);
          }
          const id = url.pathname.replace('/api/guestbook/', '');
          await env.DB.prepare('DELETE FROM guestbook WHERE id = ?').bind(id).run();
          return jsonResponse({ success: true, message: 'ØªÙ… Ø­Ø°Ù Ø§Ù„Ø±Ø³Ø§Ù„Ø© Ø¨Ù†Ø¬Ø§Ø­' });
        }

        /* -------------------------------------------------------------
         * 12. Protected API: GET /api/guests (Get Batch Guest List)
         * ----------------------------------------------------------- */
        if (url.pathname === '/api/guests' && method === 'GET') {
          if (!(await isAuthenticated(request, env))) {
            return jsonResponse({ error: 'ØºÙŠØ± Ù…ØµØ±Ø­: ÙŠÙ„Ø²Ù… ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø¯Ø®ÙˆÙ„ ÙƒÙ…Ø´Ø±Ù' }, 401);
          }

          const { results } = await env.DB.prepare(
            'SELECT id, name, phone, sent, sent_at as sentAt, notes FROM guests ORDER BY created_at ASC'
          ).all();

          // map sent integer to boolean for frontend compatibility
          const formatted = (results || []).map((r: any) => ({
            ...r,
            sent: Boolean(r.sent),
          }));

          return jsonResponse({ success: true, guests: formatted });
        }

        /* -------------------------------------------------------------
         * 13. Protected API: POST /api/guests (Save Guests batch/single)
         * ----------------------------------------------------------- */
        if (url.pathname === '/api/guests' && method === 'POST') {
          if (!(await isAuthenticated(request, env))) {
            return jsonResponse({ error: 'ØºÙŠØ± Ù…ØµØ±Ø­: ÙŠÙ„Ø²Ù… ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø¯Ø®ÙˆÙ„ ÙƒÙ…Ø´Ø±Ù' }, 401);
          }

          const body = (await request.json()) as any;
          const guestsList: any[] = Array.isArray(body.guests) ? body.guests : (body.guest ? [body.guest] : []);

          if (guestsList.length === 0) {
            return jsonResponse({ error: 'Ù„Ø§ ØªÙˆØ¬Ø¯ Ø¨ÙŠØ§Ù†Ø§Øª Ø¶ÙŠÙˆÙ Ù„Ù„Ø­ÙØ¸' }, 400);
          }

          const stmts = guestsList.map(g => {
            const id = g.id || Date.now().toString() + Math.random().toString(36).substring(2, 7);
            const name = (g.name || '').trim();
            const phone = (g.phone || '').trim();
            const sent = g.sent ? 1 : 0;
            const sentAt = g.sentAt || '';
            const notes = g.notes || '';

            return env.DB.prepare(
              `INSERT INTO guests (id, name, phone, sent, sent_at, notes, created_at)
               VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
               ON CONFLICT(id) DO UPDATE SET
                 name = excluded.name,
                 phone = excluded.phone,
                 sent = excluded.sent,
                 sent_at = excluded.sent_at,
                 notes = excluded.notes`
            ).bind(id, name, phone, sent, sentAt, notes);
          });

          await env.DB.batch(stmts);
          return jsonResponse({ success: true, count: stmts.length });
        }

        /* -------------------------------------------------------------
         * 14. Protected API: DELETE /api/guests/:id
         * ----------------------------------------------------------- */
        if (url.pathname.startsWith('/api/guests/') && method === 'DELETE') {
          if (!(await isAuthenticated(request, env))) {
            return jsonResponse({ error: 'ØºÙŠØ± Ù…ØµØ±Ø­: ÙŠÙ„Ø²Ù… ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø¯Ø®ÙˆÙ„ ÙƒÙ…Ø´Ø±Ù' }, 401);
          }
          const id = url.pathname.replace('/api/guests/', '');
          await env.DB.prepare('DELETE FROM guests WHERE id = ?').bind(id).run();
          return jsonResponse({ success: true, message: 'ØªÙ… Ø­Ø°Ù Ø§Ù„Ø¶ÙŠÙ Ø¨Ù†Ø¬Ø§Ø­' });
        }

        /* -------------------------------------------------------------
         * 15. Protected API: POST /api/guests/clear
         * ----------------------------------------------------------- */
        if (url.pathname === '/api/guests/clear' && method === 'POST') {
          if (!(await isAuthenticated(request, env))) {
            return jsonResponse({ error: 'ØºÙŠØ± Ù…ØµØ±Ø­: ÙŠÙ„Ø²Ù… ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø¯Ø®ÙˆÙ„ ÙƒÙ…Ø´Ø±Ù' }, 401);
          }
          await env.DB.prepare('DELETE FROM guests').run();
          return jsonResponse({ success: true, message: 'ØªÙ… Ù…Ø³Ø­ Ù‚Ø§Ø¦Ù…Ø© Ø§Ù„Ø¶ÙŠÙˆÙ' });
        }

        /* -------------------------------------------------------------
         * 16. Admin Auth: POST /api/admin/login
         * ----------------------------------------------------------- */
        if (url.pathname === '/api/admin/login' && method === 'POST') {
          if (!checkLoginBruteForce(clientIp)) {
            return jsonResponse({ error: 'ØªÙ… Ù‚ÙÙ„ Ù…Ø­Ø§ÙˆÙ„Ø§Øª ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø¯Ø®ÙˆÙ„ Ù…Ø¤Ù‚ØªÙ‹Ø§ Ù„ÙƒØ«Ø±Ø© Ø§Ù„Ù…Ø­Ø§ÙˆÙ„Ø§Øª Ø§Ù„Ø®Ø§Ø·Ø¦Ø©. ÙŠØ±Ø¬Ù‰ Ø§Ù„Ø§Ù†ØªØ¸Ø§Ø± 15 Ø¯Ù‚ÙŠÙ‚Ø©.' }, 429);
          }

          const body = (await request.json()) as any;
          const password = body.password;
          const expectedPassword = env.ADMIN_PASSWORD;

          if (!expectedPassword) {
            return jsonResponse({
              error: 'ÙƒÙ„Ù…Ø© Ù…Ø±ÙˆØ± Ø§Ù„Ù…Ø´Ø±Ù ØºÙŠØ± Ù…Ø¶Ø¨ÙˆØ·Ø© Ø¹Ù„Ù‰ Ø§Ù„Ø®Ø§Ø¯Ù…. ÙŠØ±Ø¬Ù‰ Ø¶Ø¨Ø· Secret ADMIN_PASSWORD Ø¨ÙˆØ§Ø³Ø·Ø© wrangler secret put ADMIN_PASSWORD'
            }, 500);
          }

          if (!password || password !== expectedPassword) {
            recordFailedLogin(clientIp);
            return jsonResponse({ error: 'ÙƒÙ„Ù…Ø© Ø§Ù„Ù…Ø±ÙˆØ± ØºÙŠØ± ØµØ­ÙŠØ­Ø©' }, 401);
          }

          // Successful authentication
          resetLoginAttempts(clientIp);
          const secret = getSessionSecret(env);
          const sessionPayload = {
            role: 'admin',
            createdAt: Date.now(),
            exp: Date.now() + 12 * 60 * 60 * 1000, // 12 Hours expiration
          };

          const token = await signToken(sessionPayload, secret);
          const isHttps = url.protocol === 'https:';
          const headers = new Headers();

          if (isHttps) {
            // Production HTTPS: strictly use __Host- prefix with Secure and SameSite=Strict
            headers.set('Set-Cookie', `__Host-admin_session=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=43200`);
          } else {
            // Local Development HTTP (localhost / 127.0.0.1): standard cookie without Secure
            headers.set('Set-Cookie', `admin_session=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=43200`);
          }

          headers.set('Content-Type', 'application/json; charset=utf-8');
          headers.set('Cache-Control', 'no-store');

          return new Response(JSON.stringify({ success: true, message: 'ØªÙ… ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø¯Ø®ÙˆÙ„ Ø¨Ù†Ø¬Ø§Ø­' }), {
            status: 200,
            headers,
          });
        }

        /* -------------------------------------------------------------
         * 17. Admin Auth: POST /api/admin/logout
         * ----------------------------------------------------------- */
        if (url.pathname === '/api/admin/logout' && method === 'POST') {
          // Require a valid admin session before processing logout and revocation
          if (!(await isAuthenticated(request, env))) {
            return jsonResponse({ error: 'ØºÙŠØ± Ù…ØµØ±Ø­: ÙŠÙ„Ø²Ù… Ø¬Ù„Ø³Ø© Ø¥Ø¯Ø§Ø±Ø© ØµØ§Ù„Ø­Ø© Ù„ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø®Ø±ÙˆØ¬' }, 401);
          }

          // Record revocation timestamp in D1 to immediately invalidate any active tokens server-side
          try {
            await env.DB.prepare(
              `INSERT INTO wedding_settings (key, value, updated_at)
               VALUES ('admin_session_revoked_before', ?, CURRENT_TIMESTAMP)
               ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP`
            ).bind(Date.now().toString()).run();
          } catch (err) {
            console.error('Could not record logout revocation timestamp in D1', err);
            return jsonResponse({ error: 'ØªØ¹Ø°Ø± Ø¥ØªÙ…Ø§Ù… ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø®Ø±ÙˆØ¬ Ø¹Ù„Ù‰ Ø§Ù„Ø®Ø§Ø¯Ù…' }, 500);
          }

          // Clear both cookie variants on logout for complete safety
          const hostClear = '__Host-admin_session=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0';
          const legacyClear = 'admin_session=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0';

          const headers = new Headers();
          headers.append('Set-Cookie', hostClear);
          headers.append('Set-Cookie', legacyClear);
          headers.set('Content-Type', 'application/json; charset=utf-8');
          headers.set('Cache-Control', 'no-store');

          return new Response(JSON.stringify({ success: true, message: 'ØªÙ… ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø®Ø±ÙˆØ¬ Ø¨Ù†Ø¬Ø§Ø­' }), {
            status: 200,
            headers,
          });
        }

        /* -------------------------------------------------------------
         * 18. Admin Auth: GET /api/admin/session
         * ----------------------------------------------------------- */
        if (url.pathname === '/api/admin/session' && method === 'GET') {
          const authenticated = await isAuthenticated(request, env);
          return jsonResponse({ success: true, authenticated });
        }

        // Unmatched API endpoint
        return jsonResponse({ error: 'Endpoint not found' }, 404);

      } catch (err: any) {
        console.error('API Error:', err);
        return jsonResponse({ error: 'Ø­Ø¯Ø« Ø®Ø·Ø£ ÙÙŠ Ø§Ù„Ø®Ø§Ø¯Ù…', details: err?.message || String(err) }, 500);
      }
    }

    /* -----------------------------------------------------------------
     * Static Assets Delivery with SPA Fallback
     * All non-API requests (HTML, JS, CSS, MP3, images) are served directly
     * by Cloudflare Workers Static Assets.
     * --------------------------------------------------------------- */
    return env.ASSETS.fetch(request);
  },
};
