# Ravi Raj — Portfolio

Personal portfolio of **Ravi Raj** — 1st year BTech student from Patna, India.

Live: [ravirajhere-portfolio.vercel.app](https://ravirajhere-portfolio.vercel.app)

---

## About

A hand-written portfolio for recruiters and collaborators. Built without frameworks — every line of HTML, CSS, and JavaScript written by hand.

**6 live projects. Learning in public since 2024.**

---

## Pages

| Page | Purpose |
|------|---------|
| [index.html](index.html) | Portfolio — hero, work, skills, contact (inline form) |
| [resume-pdf.html](resume-pdf.html) | Resume — print-optimized, ATS-friendly |
| [404.html](404.html) | Custom 404 page |

---

## Projects

| Project | Live | Source |
|---------|------|--------|
| Author Website + Book Reader | [ravirajhere-author.vercel.app](https://ravirajhere-author.vercel.app/book.html) | [GitHub](https://github.com/ravirajhere/author-website) |
| Snake Game | [ravirajhere-snake.vercel.app](https://ravirajhere-snake.vercel.app) | [GitHub](https://github.com/ravirajhere/snake-game) |
| CLI Portfolio (`npx ravirajhere`) | — | [GitHub](https://github.com/ravirajhere/cli-portfolio) |
| Expense Splitter | [expense-splitter-rj.vercel.app](https://expense-splitter-rj.vercel.app/) | [GitHub](https://github.com/ravirajhere/expense-splitter) |
| Weather Now | [ravirajhere-weather.vercel.app](https://ravirajhere-weather.vercel.app) | [GitHub](https://github.com/ravirajhere/weather-now) |
| Password Generator | [rj-password-tool.vercel.app](https://rj-password-tool.vercel.app) | [GitHub](https://github.com/ravirajhere/password-tool) |

---

## Tech Stack

### Frontend

- **HTML5** — hand-written, semantic
- **CSS3** — custom properties, no frameworks
- **JavaScript** — vanilla, no dependencies
- **No build step** — every line written by hand

### Backend (Serverless)

- **Vercel Functions** — 2 API endpoints
- **Resend** — email delivery (contact form)

---

## API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/contact` | POST | Contact form — rate-limited, honeypot-protected, sends via Resend |
| `/api/stats` | GET | Live GitHub commits — cached 10 min |

---

## Features

### For Recruiters

- **Live GitHub commits** — hero shows "Committed today"
- **Contact form** — inline on the page, server-side, rate-limited, spam-protected
- **Honest skill levels** — "Working" vs "Learning"
- **Resume** — print-optimized, ATS-friendly

### Infrastructure

- **Custom 404** — playful error page (dark + amber theme)
- **SEO** — canonical tags, OG tags, Twitter cards, Schema.org JSON-LD (Person), sitemap.xml, robots.txt
- **Analytics** — Vercel Web Analytics (privacy-friendly, no cookies)
- **Accessibility** — skip links, focus states, ARIA labels, reduced-motion
- **Security** — server-side keys, rate limiting, honeypot, CORS headers
- **Social** — custom OG image (`og-cover.jpg`, 1200×630)

---

## Folder Structure

    /
    ├── index.html              # Portfolio (with inline contact form)
    ├── resume-pdf.html         # Resume (print-optimized)
    ├── 404.html                # Custom 404
    ├── sitemap.xml             # SEO sitemap
    ├── robots.txt              # Crawler rules
    ├── package.json            # Backend dependencies
    ├── vercel.json             # Function config
    ├── api/                    # Serverless functions
    │   ├── contact.js
    │   └── stats.js
    ├── css/
    │   ├── style.css
    │   └── 404.css
    ├── js/
    │   └── script.js
    └── assets/
        ├── favicon.png
        └── images/
            ├── formal.jpg
            ├── casual.jpg
            ├── Singh_ravirajhere.jpeg
            └── og-cover.jpg    # Social share image (1200×630)

---

## Local Development

### Frontend only

No build step. Open any HTML file in a browser.

For best results, run a local server:

    python -m http.server 8000

Then open: http://localhost:8000

### With backend (API routes)

Backend functions need Vercel environment. Install dependencies first:

    npm install

Then run:

    vercel dev

Required environment variables:

    RESEND_API_KEY=re_xxxxx

---

## Deploy

Hosted on **Vercel**. Push to `main` branch — site updates automatically.

    git add .
    git commit -m "Update"
    git push origin main

Vercel auto-detects `api/` folder and deploys serverless functions.

---

## Environment Variables

Set in Vercel dashboard → Project → Settings → Environment Variables:

| Variable | Purpose |
|----------|---------|
| `RESEND_API_KEY` | Email delivery (contact form) |

---

## Resume PDF

The resume is a print-optimized HTML page. To get a PDF:

1. Open [resume-pdf.html](resume-pdf.html) in a browser
2. Press `Ctrl + P` (or `Cmd + P` on Mac)
3. Choose "Save as PDF"
4. Done — ATS-friendly, consistent output

---

## Related Projects

- **[Author Website](https://github.com/ravirajhere/author-website)** — `ravirajhere-author.vercel.app`
  - Author home, book reader (11 chapters, EN + HI), newsletter, custom 404

- **[Book](https://ravirajhere-author.vercel.app/book.html)** — "A Boy Who Never Thought"
  - Bilingual memoir — 11 chapters so far

- **[Snake Game](https://github.com/ravirajhere/snake-game)** — `ravirajhere-snake.vercel.app`
  - Classic Nokia Snake rebuilt for the browser
  - HTML5 Canvas, vanilla JS, no frameworks

- **[CLI Portfolio](https://github.com/ravirajhere/cli-portfolio)** — `npx ravirajhere`
  - Terminal portfolio, zero dependencies
  - Node.js, ANSI colors, typewriter effect

- **[Expense Splitter](https://github.com/ravirajhere/expense-splitter)** — `expense-splitter-rj.vercel.app`
  - Split bills with friends, localStorage, no backend

- **[Weather Now](https://github.com/ravirajhere/weather-now)** — `ravirajhere-weather.vercel.app`
  - Live weather via public API, geolocation, responsive

- **[Password Generator](https://github.com/ravirajhere/password-tool)** — `rj-password-tool.vercel.app`
  - Secure passwords, strength meter, copy to clipboard

---

## Contact

- **Email:** raviraj2k09@gmail.com
- **GitHub:** [@ravirajhere](https://github.com/ravirajhere)
- **LinkedIn:** [Ravirajhere](https://linkedin.com/in/Ravirajhere)

Or use the [contact form](index.html#contact) on the homepage.

---

## License

Content © 2026 Ravi Raj. All rights reserved.

Code is open for reference and learning.

---

**Made With ❤️ & Curiosity**
