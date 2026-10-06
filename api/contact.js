import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// Simple in-memory rate limit
const rateLimit = new Map();
const RATE_WINDOW = 60 * 60 * 1000; // 1 hour
const RATE_MAX = 5;

function getIP(req) {
  return (
    req.headers['x-forwarded-for']?.split(',')[0].trim() ||
    req.socket?.remoteAddress ||
    'unknown'
  );
}

function isRateLimited(ip) {
  const now = Date.now();
  const entry = rateLimit.get(ip) || { count: 0, start: now };
  if (now - entry.start > RATE_WINDOW) {
    entry.count = 0;
    entry.start = now;
  }
  entry.count += 1;
  rateLimit.set(ip, entry);
  return entry.count > RATE_MAX;
}

function validate({ name, email, message }) {
  if (!name || name.length < 2 || name.length > 60) {
    return 'Invalid name.';
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    return 'Invalid email.';
  }
  if (!message || message.length < 10 || message.length > 2000) {
    return 'Invalid message.';
  }
  const spam = ['viagra', 'casino', 'click here', 'buy now', 'crypto'];
  const lower = message.toLowerCase();
  if (spam.some((w) => lower.includes(w))) {
    return 'Message flagged as spam.';
  }
  return null;
}

function escapeHtml(s = '') {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const ip = getIP(req);
  if (isRateLimited(ip)) {
    return res.status(429).json({
      error: 'Too many messages. Please try again later.',
    });
  }

  const { name, email, message, website, context } = req.body || {};

  // Honeypot
  if (website && website.trim() !== '') {
    return res.status(200).json({ ok: true });
  }

  const err = validate({ name, email, message });
  if (err) {
    return res.status(400).json({ error: err });
  }

  const subject =
    context === 'author'
      ? `Book inquiry from ${name}`
      : context === 'recruiter'
      ? `Opportunity from ${name}`
      : `New message from ${name}`;

  try {
    const { data, error } = await resend.emails.send({
      from: 'Portfolio <onboarding@resend.dev>',
      to: 'raviraj2k09@gmail.com',
      replyTo: email,
      subject,
      text: `Name: ${name}\nEmail: ${email}\nContext: ${context || 'general'}\n\n${message}`,
      html: `
        <div style="font-family:system-ui,sans-serif;max-width:560px;padding:20px">
          <h2 style="margin:0 0 16px;color:#1C1A17">New message from ${escapeHtml(name)}</h2>
          <p style="margin:0 0 8px"><strong>Email:</strong> ${escapeHtml(email)}</p>
          <p style="margin:0 0 8px"><strong>Context:</strong> ${escapeHtml(context || 'general')}</p>
          <hr style="border:none;border-top:1px solid #E5DED2;margin:16px 0">
          <p style="margin:0;white-space:pre-wrap">${escapeHtml(message)}</p>
        </div>
      `,
    });

    if (error) {
      console.error('[resend]', error);
      return res.status(500).json({ error: 'Failed to send.' });
    }

    return res.status(200).json({ ok: true, id: data?.id });
  } catch (e) {
    console.error('[contact]', e);
    return res.status(500).json({ error: 'Server error.' });
  }
}
