# Crown Heights Groups

WhatsApp Community Directory for Crown Heights and surrounding neighborhoods.

## Features

- 🔐 **User Authentication** - Registration with email verification
- ✉️ **Email Verification** - 6-digit code verification via email
- 📱 **WhatsApp Groups Catalog** - Browse and join community groups
- ⭐ **Featured Groups** - Pin important groups to appear first
- 🔍 **Search & Filters** - Filter by neighborhood, category, search query
- 📊 **Sorting** - Sort by popularity, date, or alphabetically
- 📝 **Suggest Groups** - Users can suggest new groups and neighborhoods
- 👨‍💼 **Admin Panel** - Manage groups, categories, locations, and suggestions
- 📧 **Contact Form** - Email integration with nodemailer
- 🔎 **SEO Optimized** - Server-side rendering, sitemap, robots.txt

## Tech Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **React 18**
- **Nodemailer** (for email verification and contact form)

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

### Environment Variables (Optional)

Create a `.env.local` file for email configuration:

```env
EMAIL_USER=contact@edonthego.org
EMAIL_PASS=qvun irsl zsaf asux
```

## Authentication System

### Registration Flow
1. User fills registration form (name, email, password)
2. System sends 6-digit verification code to email
3. User enters code on verification page
4. Account is activated and user is logged in

### Login Flow
1. User enters email and password
2. System validates credentials
3. If email not verified, redirects to verification page
4. On success, creates session and redirects to home

### Default Admin Account
- Email: `admin@crownheightsgroups.com`
- Password: `admin123`
- **Change this password in production!**

## Project Structure

```
crownheightsgroups/
├── app/
│   ├── layout.tsx          # Root layout with metadata
│   ├── page.tsx            # Home page with catalog
│   ├── auth/
│   │   ├── register/       # Registration page
│   │   ├── login/          # Login page
│   │   └── verify/         # Email verification page
│   ├── suggest/page.tsx    # Suggest group form
│   ├── contact/page.tsx    # Contact form
│   ├── admin/page.tsx      # Admin dashboard
│   ├── c/[slug]/           # Category pages
│   ├── api/
│   │   ├── auth/           # Authentication APIs
│   │   │   ├── register/   # Registration endpoint
│   │   │   ├── login/      # Login endpoint
│   │   │   ├── verify/     # Verification endpoint
│   │   │   ├── resend/     # Resend code endpoint
│   │   │   ├── session/    # Session validation
│   │   │   └── logout/     # Logout endpoint
│   │   ├── contact/        # Contact form API
│   │   ├── groups/         # Groups API
│   │   └── suggestions/    # Suggestions API
│   ├── sitemap.ts          # Dynamic sitemap
│   └── robots.ts           # Robots.txt
├── components/
│   ├── Header.tsx
│   ├── Footer.tsx
│   ├── GroupCard.tsx
│   └── Filters.tsx
├── lib/
│   ├── types.ts            # TypeScript interfaces
│   ├── data.ts             # Sample data & helpers
│   └── auth.ts             # Authentication utilities
└── styles/
    └── globals.css         # Global styles
```

## Featured Groups (Pinned)

Groups can be pinned to always appear first, regardless of sorting:
- Set `isPinned: true` on a group
- Optionally set `pinnedOrder` for ordering among pinned groups
- Pinned groups show a "Featured" badge

## Admin Panel

Access the admin panel at `/admin` (requires admin role) to:
- View statistics
- Manage groups (including pin/unpin)
- Manage categories
- Manage locations
- Review suggestions
- Configure banner

## Email Configuration

All emails (verification, contact form) use Gmail with app password:
- Email: contact@edonthego.org
- App Password: qvun irsl zsaf asux (for Google profile "crownheightsgroups")

## SEO

- Server-side rendering for all public pages
- Automatic sitemap generation
- robots.txt configuration
- OpenGraph and Twitter meta tags
- Canonical URLs

## Commands for Testing

```bash
# Install dependencies
npm install

# Development mode (with hot reload)
npm run dev

# Build the project
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## Deployment

The site is ready for deployment on:
- Vercel (recommended)
- Netlify
- Any Node.js hosting

### Vercel Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

## Domain

Planned domain: **crownheightsgroups.com**

## License

Private project.

---

Built with ❤️ for the Crown Heights community.
