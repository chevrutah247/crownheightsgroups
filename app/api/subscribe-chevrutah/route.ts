import { NextRequest, NextResponse } from 'next/server';

const EDITION_NAMES: Record<string, string> = {
  russian: 'Chevrutah24x7 (RUS)',
  kids: 'Chevrutah KIDS (ENG)',
};

export async function POST(request: NextRequest) {
  try {
    const { email, edition } = await request.json();

    if (!email || !edition) {
      return NextResponse.json({ error: 'Email and edition are required' }, { status: 400 });
    }

    if (!(edition in EDITION_NAMES)) {
      return NextResponse.json({ error: 'Invalid edition' }, { status: 400 });
    }

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Server config error' }, { status: 500 });
    }

    const editionName = EDITION_NAMES[edition];

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'CrownHeightsGroups <noreply@shabbathub.com>',
        to: 'chevrutah24x7@gmail.com',
        subject: `New Chevrutah subscription: ${editionName}`,
        reply_to: email,
        html: `
          <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px;">
            <h2 style="color:#4c1d95;">New Chevrutah subscription from CrownHeightsGroups</h2>
            <p><strong>Edition:</strong> ${escapeHtml(editionName)}</p>
            <p><strong>Email:</strong> ${escapeHtml(email)}</p>
          </div>
        `,
      }),
    });

    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to send' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
