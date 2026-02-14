# Crown Heights Groups

WhatsApp Community Directory for Crown Heights and surrounding neighborhoods.

## Features

- User Authentication with email verification
- WhatsApp Groups Catalog with search & filters
- Featured/Pinned Groups
- Services Directory
- Business Directory
- Community Events
- Charity Campaigns
- Shabbos Hosting
- Lottery Pool (weekly Mega Millions + Powerball)
- Weekly Newsletter
- Admin Panel
- Gate page (community filter)

## Tech Stack

- **Next.js 14** (App Router), TypeScript, React 18
- **Upstash Redis** — main database
- **Supabase** — lottery database
- **Square** — payment processing
- **Resend + Nodemailer** — email
- **Vercel** — hosting with cron jobs

## Getting Started

```bash
npm install
npm run dev
```

## Environment Variables

Copy `.env.example` to `.env.local` and fill in the values. See `.env.example` for required variables.

## Deployment

```bash
vercel
```

Domain: **crownheightsgroups.com**

---

Built for the Crown Heights community.
