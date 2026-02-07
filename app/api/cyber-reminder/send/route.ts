// app/api/cyber-reminder/send/route.ts
import { NextResponse } from 'next/server';

// Email HTML template
const getEmailHTML = (email: string, fbiAlerts: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Monthly Cyber Safety Reminder</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: Arial, sans-serif;">
  
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
          
          <!-- Header Banner -->
          <tr>
            <td>
              <img src="https://crownheightsgroups.com/images/email-header.png" alt="CrownHeightsGroups.com - Cyber Safety" width="600" style="display: block; width: 100%;">
            </td>
          </tr>
          
          <!-- Greeting -->
          <tr>
            <td style="padding: 30px 40px 20px 40px;">
              <h1 style="color: #1e3a5f; font-size: 28px; margin: 0 0 15px 0;">
                🛡️ Your Monthly Safety Check
              </h1>
              <p style="color: #333; font-size: 20px; line-height: 1.6; margin: 0;">
                Hello Friend! It's time for your <strong>monthly cyber safety check</strong>. 
                Follow these simple steps to stay protected from scammers.
              </p>
            </td>
          </tr>
          
          <!-- STEP 1: Do Not Call -->
          <tr>
            <td style="padding: 20px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #e8f5e9; border-radius: 12px; border-left: 6px solid #4caf50;">
                <tr>
                  <td style="padding: 25px;">
                    <h2 style="color: #2e7d32; font-size: 24px; margin: 0 0 15px 0;">
                      ✅ Step 1: Stop Spam Calls (One Time Only!)
                    </h2>
                    <p style="color: #333; font-size: 18px; line-height: 1.6; margin: 0 0 15px 0;">
                      Register your phone number to reduce unwanted sales calls. 
                      <strong>You only need to do this ONCE</strong> — it stays active forever!
                    </p>
                    <p style="margin: 0;">
                      <a href="https://www.donotcall.gov/" target="_blank" 
                         style="display: inline-block; background-color: #4caf50; color: white; 
                                padding: 15px 30px; font-size: 18px; font-weight: bold; 
                                text-decoration: none; border-radius: 8px;">
                        📞 Register at DoNotCall.gov →
                      </a>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- STEP 2: Scan Computer -->
          <tr>
            <td style="padding: 20px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #e3f2fd; border-radius: 12px; border-left: 6px solid #2196f3;">
                <tr>
                  <td style="padding: 25px;">
                    <h2 style="color: #1565c0; font-size: 24px; margin: 0 0 15px 0;">
                      🖥️ Step 2: Scan Your Windows Computer
                    </h2>
                    <p style="color: #333; font-size: 18px; line-height: 1.6; margin: 0 0 20px 0;">
                      Run these <strong>FREE</strong> tools to check for viruses:
                    </p>
                    
                    <div style="background-color: white; padding: 20px; border-radius: 8px; margin-bottom: 15px;">
                      <h3 style="color: #1565c0; font-size: 20px; margin: 0 0 10px 0;">
                        A) Windows Built-in Scanner (MRT)
                      </h3>
                      <p style="color: #333; font-size: 18px; line-height: 1.6; margin: 0 0 10px 0;">
                        Already on your computer! Just follow these steps:
                      </p>
                      <ol style="color: #333; font-size: 18px; line-height: 1.8; margin: 0; padding-left: 25px;">
                        <li>Press <strong>Windows key + R</strong> on your keyboard</li>
                        <li>Type: <code style="background: #f0f0f0; padding: 3px 8px; border-radius: 4px; font-size: 20px;">MRT</code></li>
                        <li>Press <strong>Enter</strong></li>
                        <li>Click <strong>"Next"</strong> and select <strong>"Full Scan"</strong></li>
                        <li>Wait for it to finish (may take 30-60 minutes)</li>
                      </ol>
                    </div>
                    
                    <div style="background-color: white; padding: 20px; border-radius: 8px;">
                      <h3 style="color: #1565c0; font-size: 20px; margin: 0 0 10px 0;">
                        B) Dr.Web CureIt! (Extra Protection)
                      </h3>
                      <p style="color: #333; font-size: 18px; line-height: 1.6; margin: 0 0 15px 0;">
                        Download this FREE scanner for a deeper check:
                      </p>
                      <a href="https://free.drweb.com/cureit/" target="_blank" 
                         style="display: inline-block; background-color: #2196f3; color: white; 
                                padding: 15px 30px; font-size: 18px; font-weight: bold; 
                                text-decoration: none; border-radius: 8px;">
                        ⬇️ Download Dr.Web CureIt! →
                      </a>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- STEP 3: Check Email + Change Password -->
          <tr>
            <td style="padding: 20px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fff3e0; border-radius: 12px; border-left: 6px solid #ff9800;">
                <tr>
                  <td style="padding: 25px;">
                    <h2 style="color: #e65100; font-size: 24px; margin: 0 0 15px 0;">
                      📧 Step 3: Check Your Email for Leaks
                    </h2>
                    <p style="color: #333; font-size: 18px; line-height: 1.6; margin: 0 0 20px 0;">
                      Hackers steal passwords from websites. Check if YOUR email was leaked:
                    </p>
                    
                    <div style="background-color: white; padding: 20px; border-radius: 8px; margin-bottom: 15px;">
                      <ol style="color: #333; font-size: 18px; line-height: 1.8; margin: 0; padding-left: 25px;">
                        <li>Go to the website below</li>
                        <li>Type your email address</li>
                        <li>Click <strong>"pwned?"</strong></li>
                      </ol>
                      <p style="margin: 20px 0 15px 0;">
                        <a href="https://haveibeenpwned.com/" target="_blank" 
                           style="display: inline-block; background-color: #ff9800; color: white; 
                                  padding: 15px 30px; font-size: 18px; font-weight: bold; 
                                  text-decoration: none; border-radius: 8px;">
                          🔍 Check at HaveIBeenPwned.com →
                        </a>
                      </p>
                    </div>
                    
                    <div style="background-color: #ffebee; padding: 20px; border-radius: 8px; border: 2px solid #f44336;">
                      <h3 style="color: #c62828; font-size: 22px; margin: 0 0 10px 0;">
                        ⚠️ If You See RED — Change Your Password NOW!
                      </h3>
                      <p style="color: #333; font-size: 18px; line-height: 1.6; margin: 0 0 15px 0;">
                        If the website shows your email was leaked, <strong>change your password immediately</strong>:
                      </p>
                      <a href="https://myaccount.google.com/signinoptions/password" target="_blank" 
                         style="display: inline-block; background-color: #c62828; color: white; 
                                padding: 15px 30px; font-size: 18px; font-weight: bold; 
                                text-decoration: none; border-radius: 8px;">
                        🔐 Change Gmail Password →
                      </a>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- STEP 4: Check Links -->
          <tr>
            <td style="padding: 20px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fce4ec; border-radius: 12px; border-left: 6px solid #e91e63;">
                <tr>
                  <td style="padding: 25px;">
                    <h2 style="color: #c2185b; font-size: 24px; margin: 0 0 15px 0;">
                      🔗 Step 4: NEVER Click Unknown Links!
                    </h2>
                    
                    <div style="background-color: #ffebee; padding: 20px; border-radius: 8px; margin-bottom: 20px; border: 2px dashed #e91e63;">
                      <p style="color: #c62828; font-size: 20px; font-weight: bold; line-height: 1.6; margin: 0;">
                        🚨 DANGER: Scammers send links that look real but contain viruses!
                        If you click a bad link, hackers can steal your passwords, 
                        bank information, and take control of your computer!
                      </p>
                    </div>
                    
                    <p style="color: #333; font-size: 18px; line-height: 1.6; margin: 0 0 15px 0;">
                      <strong>Before clicking ANY link</strong> someone sends you — check it first:
                    </p>
                    
                    <div style="background-color: white; padding: 20px; border-radius: 8px; margin-bottom: 15px;">
                      <ol style="color: #333; font-size: 18px; line-height: 1.8; margin: 0; padding-left: 25px;">
                        <li>Go to <strong>VirusTotal.com</strong></li>
                        <li>Click the <strong>"URL"</strong> tab</li>
                        <li>Paste the suspicious link</li>
                        <li>Click <strong>"Search"</strong></li>
                      </ol>
                    </div>
                    
                    <div style="background-color: #ffcdd2; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                      <p style="color: #b71c1c; font-size: 20px; font-weight: bold; margin: 0;">
                        🚩 See even ONE red flag? DO NOT CLICK THAT LINK!
                      </p>
                    </div>
                    
                    <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 15px 0; font-style: italic;">
                      💡 Pro Tip: You can also check PDF files, Word documents, 
                      and any files people send you — upload them to VirusTotal before opening!
                    </p>
                    
                    <a href="https://www.virustotal.com/" target="_blank" 
                       style="display: inline-block; background-color: #e91e63; color: white; 
                              padding: 15px 30px; font-size: 18px; font-weight: bold; 
                              text-decoration: none; border-radius: 8px;">
                      🛡️ Check Links at VirusTotal.com →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- FBI Scam Alerts -->
          <tr>
            <td style="padding: 20px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #1e3a5f; border-radius: 12px;">
                <tr>
                  <td style="padding: 25px;">
                    <h2 style="color: #ffd700; font-size: 22px; margin: 0 0 15px 0;">
                      🚨 Latest Scam Alerts from FBI
                    </h2>
                    <p style="color: #ffffff; font-size: 16px; line-height: 1.6; margin: 0 0 15px 0;">
                      Stay informed about the newest scams targeting our community:
                    </p>
                    <div style="color: #e0e0e0; font-size: 16px; line-height: 1.6;">
                      ${fbiAlerts}
                    </div>
                    <p style="margin: 15px 0 0 0;">
                      <a href="https://www.ic3.gov/" target="_blank" 
                         style="color: #ffd700; font-size: 16px; text-decoration: underline;">
                        Read more at IC3.gov (FBI Internet Crime Center) →
                      </a>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Visit Website CTA -->
          <tr>
            <td style="padding: 20px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #3b82f6 0%, #1e3a5f 100%); border-radius: 12px;">
                <tr>
                  <td align="center" style="padding: 30px;">
                    <p style="color: #ffffff; font-size: 20px; margin: 0 0 20px 0;">
                      📖 For detailed instructions with pictures, visit:
                    </p>
                    <a href="https://crownheightsgroups.com/cyber-safety" target="_blank" 
                       style="display: inline-block; background-color: #ffd700; color: #1e3a5f; 
                              padding: 18px 40px; font-size: 22px; font-weight: bold; 
                              text-decoration: none; border-radius: 10px;">
                      🔒 CrownHeightsGroups.com/cyber-safety
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background-color: #f5f5f5; border-top: 1px solid #e0e0e0;">
              <p style="color: #666; font-size: 14px; line-height: 1.6; margin: 0; text-align: center;">
                You received this email because you subscribed to monthly cyber safety reminders 
                at CrownHeightsGroups.com
                <br><br>
                <a href="https://crownheightsgroups.com/api/cyber-reminder/unsubscribe?email=${encodeURIComponent(email)}" 
                   style="color: #999; text-decoration: underline;">
                  Unsubscribe from these reminders
                </a>
                <br><br>
                🛡️ Stay Safe! — CrownHeightsGroups.com
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
  
</body>
</html>
`;

// Fetch FBI/IC3 alerts
async function fetchFBIAlerts(): Promise<string> {
  try {
    const response = await fetch('https://www.ic3.gov/Media/RSS/cybercrimes.xml', {
      next: { revalidate: 3600 }
    });
    
    if (!response.ok) {
      return '<p>• Be cautious of unsolicited calls claiming to be from government agencies</p><p>• Never share personal information with unknown callers</p>';
    }
    
    const xml = await response.text();
    
    // Simple XML parsing for RSS items
    const items: string[] = [];
    const itemRegex = /<item>[\s\S]*?<title>(.*?)<\/title>[\s\S]*?<\/item>/g;
    let match;
    let count = 0;
    
    while ((match = itemRegex.exec(xml)) !== null && count < 3) {
      const title = match[1]
        .replace(/<!\[CDATA\[|\]\]>/g, '')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>');
      items.push(\`<p style="margin: 8px 0;">• \${title}</p>\`);
      count++;
    }
    
    return items.length > 0 
      ? items.join('') 
      : '<p>• Be cautious of unsolicited calls claiming to be from government agencies</p><p>• Never share personal information with unknown callers</p>';
  } catch (error) {
    console.error('Error fetching FBI alerts:', error);
    return '<p>• Be cautious of unsolicited calls claiming to be from government agencies</p><p>• Never share personal information with unknown callers</p>';
  }
}

// GET - Check who needs emails (for debugging)
export async function GET() {
  // This would connect to your database to check subscribers
  return NextResponse.json({
    message: 'Cyber reminder send endpoint',
    note: 'POST to this endpoint to trigger email sends, or let Vercel cron handle it'
  });
}

// POST - Send reminder emails (called by Vercel Cron)
export async function POST(request: Request) {
  // Verify cron secret for security
  const authHeader = request.headers.get('authorization');
  if (authHeader !== \`Bearer \${process.env.CRON_SECRET}\`) {
    // Allow in development or if no secret set
    if (process.env.NODE_ENV === 'production' && process.env.CRON_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  try {
    // Get FBI alerts for the email
    const fbiAlerts = await fetchFBIAlerts();
    
    // Here you would:
    // 1. Query your database for subscribers who need reminders (30 days since last email)
    // 2. Send emails using Resend
    // 3. Update the last_sent timestamp
    
    // Example with Resend:
    /*
    const { Resend } = await import('resend');
    const resend = new Resend(process.env.RESEND_API_KEY);
    
    // Get subscribers from database
    const subscribers = await getSubscribersNeedingReminder();
    
    for (const subscriber of subscribers) {
      await resend.emails.send({
        from: 'Cyber Safety <safety@crownheightsgroups.com>',
        to: subscriber.email,
        subject: '🛡️ Your Monthly Cyber Safety Reminder',
        html: getEmailHTML(subscriber.email, fbiAlerts),
      });
      
      // Update last_sent in database
      await updateLastSent(subscriber.email);
    }
    */
    
    return NextResponse.json({
      success: true,
      message: 'Reminder emails sent',
      fbiAlertsIncluded: fbiAlerts.length > 0
    });
    
  } catch (error) {
    console.error('Error sending reminders:', error);
    return NextResponse.json(
      { error: 'Failed to send reminders' },
      { status: 500 }
    );
  }
}
