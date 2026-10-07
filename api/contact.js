/* ==========================================================================
   /api/contact — POST endpoint for portfolio contact form
   - Server-side validation (never trust client)
   - Honeypot check (silent for bots)
   - Rate limiting (3 requests per minute per IP)
   - Resend for email delivery
   - HTML escaping (XSS prevention)
   - CORS restricted to portfolio origin
   ========================================================================== */

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

/* ---------- CONFIG ---------- */
const ALLOWED_ORIGINS = [
    'https://ravirajhere-portfolio.vercel.app',
    'http://localhost:3000',      // vercel dev
    'http://localhost:8000'       // python http.server (frontend only testing)
];

const RATE_LIMIT_WINDOW_MS = 60 * 1000;   // 1 minute
const RATE_LIMIT_MAX = 3;                  // 3 requests per minute per IP

const TO_EMAIL = 'raviraj2k09@gmail.com';
const FROM_EMAIL = 'Portfolio Contact <onboarding@resend.dev>';

const MIN_NAME = 2;
const MAX_NAME = 60;
const MAX_EMAIL = 120;
const MIN_MESSAGE = 10;
const MAX_MESSAGE = 2000;

/* ---------- In-memory rate limit ----------
   Note: Vercel serverless instances are ephemeral.
   This limits abuse per warm instance — good enough for a portfolio.
   For stricter limits, use Upstash Redis or Vercel KV. */
const rateLimitMap = new Map();

function checkRateLimit(ip) {
    const now = Date.now();
    const entry = rateLimitMap.get(ip);

    if (entry && now - entry.start < RATE_LIMIT_WINDOW_MS) {
        if (entry.count >= RATE_LIMIT_MAX) {
            return false;
        }
        entry.count++;
    } else {
        rateLimitMap.set(ip, { start: now, count: 1 });
    }

    // Opportunistic cleanup — prevent unbounded growth
    if (rateLimitMap.size > 1000) {
        for (const [key, val] of rateLimitMap.entries()) {
            if (now - val.start > RATE_LIMIT_WINDOW_MS) {
                rateLimitMap.delete(key);
            }
        }
    }

    return true;
}

/* ---------- HTML escape ---------- */
function escapeHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

/* ---------- CORS ---------- */
function setCorsHeaders(req, res) {
    const origin = req.headers.origin;
    if (origin && ALLOWED_ORIGINS.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Vary', 'Origin');
    }
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Max-Age', '86400');
}

/* ---------- Validation ---------- */
function validate({ name, email, message }) {
    if (!name || typeof name !== 'string') {
        return 'Please enter your name.';
    }
    const trimmedName = name.trim();
    if (trimmedName.length < MIN_NAME) {
        return 'Name must be at least 2 characters.';
    }
    if (trimmedName.length > MAX_NAME) {
        return 'Name is too long.';
    }

    if (!email || typeof email !== 'string') {
        return 'Please enter your email.';
    }
    const trimmedEmail = email.trim();
    if (trimmedEmail.length > MAX_EMAIL) {
        return 'Email is too long.';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!emailRegex.test(trimmedEmail)) {
        return 'Please enter a valid email address.';
    }

    if (!message || typeof message !== 'string') {
        return 'Please enter your message.';
    }
    const trimmedMessage = message.trim();
    if (trimmedMessage.length < MIN_MESSAGE) {
        return 'Message must be at least 10 characters.';
    }
    if (trimmedMessage.length > MAX_MESSAGE) {
        return 'Message is too long.';
    }

    return null;
}

/* ---------- Handler ---------- */
export default async function handler(req, res) {
    setCorsHeaders(req, res);

    // Preflight
    if (req.method === 'OPTIONS') {
        return res.status(204).end();
    }

    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST, OPTIONS');
        return res.status(405).json({ error: 'Method not allowed.' });
    }

    // Reject if Resend isn't configured
    if (!process.env.RESEND_API_KEY) {
        console.error('[contact] RESEND_API_KEY is not set');
        return res.status(500).json({ error: 'Server not configured. Try again later.' });
    }

    // Parse body — Vercel auto-parses JSON, but be defensive
    let body = req.body;
    if (typeof body === 'string') {
        try { body = JSON.parse(body); } catch (e) { body = {}; }
    }
    if (!body || typeof body !== 'object') {
        return res.status(400).json({ error: 'Invalid request body.' });
    }

    const { name, email, message, website } = body;

    // Honeypot — silent success for bots
    if (website && String(website).trim() !== '') {
        return res.status(200).json({ ok: true });
    }

    // Rate limit
    const ip = (req.headers['x-forwarded-for'] || '')
        .split(',')[0]
        .trim() || 'unknown';

    if (!checkRateLimit(ip)) {
        return res.status(429).json({ error: 'Too many requests. Try again in a minute.' });
    }

    // Validate
    const error = validate({ name, email, message });
    if (error) {
        return res.status(400).json({ error });
    }

    const cleanName = name.trim();
    const cleanEmail = email.trim();
    const cleanMessage = message.trim();

    // Send via Resend
    try {
        const { data, error: sendError } = await resend.emails.send({
            from: FROM_EMAIL,
            to: TO_EMAIL,
            replyTo: cleanEmail,
            subject: `Portfolio contact — ${cleanName}`,
            text:
                `New message from portfolio contact form\n\n` +
                `Name: ${cleanName}\n` +
                `Email: ${cleanEmail}\n` +
                `IP: ${ip}\n\n` +
                `---\n\n${cleanMessage}\n`,
            html: `
                <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;max-width:600px;color:#0f172a;">
                    <h2 style="margin:0 0 16px;font-size:18px;color:#0f2e5c;">New message from portfolio</h2>
                    <table style="width:100%;border-collapse:collapse;font-size:14px;">
                        <tr>
                            <td style="padding:6px 0;color:#64748b;width:80px;">Name</td>
                            <td style="padding:6px 0;font-weight:600;">${escapeHtml(cleanName)}</td>
                        </tr>
                        <tr>
                            <td style="padding:6px 0;color:#64748b;">Email</td>
                            <td style="padding:6px 0;"><a href="mailto:${escapeHtml(cleanEmail)}" style="color:#0f2e5c;">${escapeHtml(cleanEmail)}</a></td>
                        </tr>
                    </table>
                    <hr style="margin:16px 0;border:none;border-top:1px solid #e2e8f0;">
                    <div style="font-size:14px;line-height:1.6;white-space:pre-wrap;">${escapeHtml(cleanMessage)}</div>
                    <hr style="margin:16px 0;border:none;border-top:1px solid #e2e8f0;">
                    <p style="font-size:12px;color:#94a3b8;margin:0;">Reply directly to this email to respond to ${escapeHtml(cleanName)}.</p>
                </div>
            `
        });

        if (sendError) {
            console.error('[contact] Resend error:', sendError);
            return res.status(502).json({ error: 'Failed to send. Try again later.' });
        }

        return res.status(200).json({ ok: true, id: data?.id || null });
    } catch (err) {
        console.error('[contact] Server error:', err);
        return res.status(500).json({ error: 'Something went wrong. Try again later.' });
    }
}
