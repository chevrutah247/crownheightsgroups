import { NextRequest, NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';
import { Resend } from 'resend';
import { manualStoresDefaults, type ManualStore } from '@/lib/manual-specials-data';

const MANUAL_KEY = 'manual_store_specials';
// Who receives the Monday reminder. Multiple emails can be configured via env var.
const DEFAULT_RECIPIENTS = ['chevrutah24x7@gmail.com'];

function getRedis() {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (url && token) return new Redis({ url, token });
  return null;
}

function timeAgo(iso?: string): string {
  if (!iso) return 'never updated';
  try {
    const then = new Date(iso).getTime();
    const days = Math.floor((Date.now() - then) / (1000 * 60 * 60 * 24));
    if (days === 0) return 'today';
    if (days === 1) return '1 day ago';
    if (days < 7) return `${days} days ago`;
    const weeks = Math.floor(days / 7);
    return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
  } catch {
    return iso;
  }
}

function buildEmailHtml(stores: ManualStore[]) {
  const adminUrl = 'https://crownheightsgroups.com/admin/store-specials';
  const storeRows = stores
    .map((s) => {
      const last = timeAgo(s.updatedAt);
      const stale = !s.updatedAt || (Date.now() - new Date(s.updatedAt).getTime()) > 6 * 24 * 60 * 60 * 1000;
      const staleBadge = stale
        ? '<span style="background:#dc2626;color:#fff;font-size:11px;font-weight:700;padding:2px 8px;border-radius:999px;margin-left:8px">NEEDS UPDATE</span>'
        : '<span style="background:#16a34a;color:#fff;font-size:11px;font-weight:700;padding:2px 8px;border-radius:999px;margin-left:8px">FRESH</span>';
      const refLink = s.referenceUrl
        ? `<a href="${s.referenceUrl}" style="color:#2563eb;text-decoration:underline">${s.referenceUrl}</a>`
        : '<em style="color:#94a3b8">no reference URL set</em>';
      return `
        <tr>
          <td style="padding:12px 0;border-bottom:1px solid #e2e8f0">
            <div style="font-size:16px;font-weight:700;color:#1e3a5f">${s.logoEmoji || '🛒'} ${s.name}${staleBadge}</div>
            <div style="font-size:14px;color:#475569;margin-top:4px">Last updated: ${last} · ${s.specials.length} items</div>
            <div style="font-size:13px;color:#64748b;margin-top:4px">Source: ${refLink}</div>
          </td>
        </tr>`;
    })
    .join('');

  return `<!DOCTYPE html><html><body style="margin:0;padding:20px;background:#f1f5f9;font-family:-apple-system,Segoe UI,Roboto,sans-serif">
    <div style="max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08)">
      <div style="padding:24px;background:linear-gradient(135deg,#1e3a5f,#2d5a87);color:#fff">
        <h1 style="margin:0;font-size:22px">🛒 Monday Specials Reminder</h1>
        <p style="margin:6px 0 0;opacity:0.9;font-size:14px">Weekly update checklist for Crown Heights stores</p>
      </div>
      <div style="padding:20px 24px">
        <p style="font-size:15px;color:#334155">
          Hi! Time to refresh the manual store specials for the week.
          The three stores below are updated by hand (the others fetch automatically).
        </p>
        <table style="width:100%;border-collapse:collapse;margin-top:12px">${storeRows}</table>
        <div style="margin-top:24px;text-align:center">
          <a href="${adminUrl}" style="display:inline-block;background:#2563eb;color:#fff;padding:12px 28px;border-radius:10px;text-decoration:none;font-weight:700;font-size:15px">
            Open Admin → Store Specials
          </a>
        </div>
        <p style="font-size:12px;color:#94a3b8;margin-top:28px;text-align:center">
          This reminder runs every Monday at 9:00 AM EDT.<br>
          You can silence future emails by removing this address from the cron recipients.
        </p>
      </div>
    </div>
  </body></html>`;
}

export async function GET(request: NextRequest) {
  // Vercel cron secret check (optional but recommended)
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const redis = getRedis();
    let stores: ManualStore[] = manualStoresDefaults;
    if (redis) {
      const raw = await redis.get(MANUAL_KEY);
      if (raw) {
        const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
        if (Array.isArray(parsed)) stores = parsed;
      }
    }

    const resendKey = process.env.RESEND_API_KEY;
    if (!resendKey) {
      return NextResponse.json({ error: 'Email service not configured' }, { status: 500 });
    }
    const resend = new Resend(resendKey);

    const recipients = (process.env.SPECIALS_REMINDER_RECIPIENTS || DEFAULT_RECIPIENTS.join(','))
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const html = buildEmailHtml(stores);
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });

    let sent = 0;
    const errors: string[] = [];
    for (const to of recipients) {
      try {
        await resend.emails.send({
          from: 'Crown Heights Groups <updates@crownheightsgroups.com>',
          to,
          subject: `🛒 ${today} — Update store specials (Kahan's, Kol Tuv)`,
          html,
        });
        sent++;
      } catch (e: any) {
        errors.push(`${to}: ${e.message}`);
      }
    }

    return NextResponse.json({
      ok: true,
      sent,
      recipients,
      errors: errors.length ? errors : undefined,
      manualStores: stores.map((s) => ({ id: s.id, name: s.name, updatedAt: s.updatedAt, itemCount: s.specials.length })),
    });
  } catch (error: any) {
    console.error('store-specials-reminder error:', error);
    return NextResponse.json({ error: error.message || 'Internal error' }, { status: 500 });
  }
}
