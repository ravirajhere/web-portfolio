// api/contact.js
const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

// Simple in-memory rate limit (Vercel function instances ke liye)
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000;  // 1 minute
const RATE_LIMIT_MAX = 3;              // 3 requests per minute per IP

module.exports = async function handler(req, res) {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', 'https://ravirajhere-portfolio.vercel.app');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { name, email, message, website } = req.body || {};

        // Honeypot — silently accept if bot filled it
        if (website && website.trim() !== '') {
            return res.status(200).json({ ok: true });
        }

        // Rate limit
        const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || 'unknown';
        const now = Date.now();
        const entry = rateLimitMap.get(ip);
        if (entry && now - entry.start < RATE_LIMIT_WINDOW) {
            if (entry.count >= RATE_LIMIT_MAX) {
                return res.status(429).json({ error: 'Too many requests. Try again in a minute.' });
            }
            entry.count++;
        } else {
            rateLimitMap.set(ip, { start: now, count: 1 });
        }

        // Server-side validation
        if (!name || name.length < 2 || name.length > 60) {
            return res.status(400).json({ error: 'Please enter a valid name.' });
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
        if (!email || !emailRegex.test(email) || email.length > 120) {
            return res.status(400).json({ error: 'Please enter a valid email.' });
        }
        if (!message || message.length < 10 || message.length > 2000) {
            return res.status(400).json({ error: 'Please enter a valid message.' });
        }

        // Send via Resend
        const { data, error } = await resend.emails.send({
            from: 'Portfolio Contact <onboarding@resend.dev>',  // ya apna verified domain
            to: 'raviraj2k09@gmail.com',
            replyTo: email,
            subject: `Portfolio contact — ${name}`,
            text: `From: ${name} <${email}>\n\n${message}`,
            html: `
                <h2>New message from portfolio</h2>
                <p><strong>Name:</strong> ${escapeHtml(name)}</p>
                <p><strong>Email:</strong> ${escapeHtml(email)}</p>
                <hr>
                <p>${escapeHtml(message).replace(/\n/g, '<br>')}</p>
            `
        });

        if (error) {
            console.error('[contact] Resend error:', error);
            return res.status(500).json({ error: 'Failed to send. Try again later.' });
        }

        return res.status(200).json({ ok: true, id: data?.id });

    } catch (err) {
        console.error('[contact] Server error:', err);
        return res.status(500).json({ error: 'Server error. Try again later.' });
    }
};

function escapeHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}
