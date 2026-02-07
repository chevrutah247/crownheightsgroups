// app/api/cyber-reminder/test/route.ts
// TEMPORARY - delete after testing!

import { NextResponse } from 'next/server';
import { Resend } from 'resend';

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
          
          <!-- STEP 1 -->
          <tr>
            <td style="padding: 20px 40px;">
              <table width="100%" style="background-color: #e8f5e9; border-radius: 12px; border-left: 6px solid #4caf50;">
                <tr>
                  <td style="padding: 25px;">
                    <h2 style="color: #2e7d32; font-size: 24px; margin: 0 0 15px 0;">
                      ✅ Step 1: Stop Spam Calls (One Time Only!)
                    </h2>
                    <p style="color: #333; font-size: 18px; line-height: 1.6; margin: 0 0 15px 0;">
                      Register your phone number to reduce unwanted sales calls. 
                      <strong>You only need to do this ONCE</strong> — it stays active forever!
                    </p>
                    <a href="https://www.donotcall.gov/" target="_blank" 
                       style="display: inline-block; background-color: #4caf50; color: white; 
                              padding: 15px 30px; font-size: 18px; font-weight: bold; 
                              text-decoration: none; border-radius: 8px;">
                      📞 Register at DoNotCall.gov →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- STEP 2 -->
          <tr>
            <td style="padding: 20px 40px;">
              <table width="100%" style="background-color: #e3f2fd; border-radius: 12px; border-left: 6px solid #2196f3;">
                <tr>
                  <td style="padding: 25px;">
                    <h2 style="color: #1565c0; font-size: 24px; margin: 0 0 15px 0;">
                      🖥️ Step 2: Scan Your Windows Computer
                    </h2>
                    <p style="color: #333; font-size: 18px; line-height: 1.6; margin: 0 0 20px 0;">
                      Run these <strong>FREE</strong> tools to check for viruses:
                    </p>
                    
                    <div style="background-color: white; padding: 20px; border-radius: 8px; margin-bottom: 15px;">
                      <h3 style="color: #1565c0; font-size: 20px; margin: 0 0 10px 0;">A) Windows Built-in Scanner (MRT)</h3>
                      <ol style="color: #333; font-size: 18px; line-height: 1.8; margin: 0; padding-left: 25px;">
                        <li>Press <strong>Windows key + R</strong></li>
                        <li>Type: <code style="background: #f0f0f0; padding: 3px 8px;">MRT</code></li>
                        <li>Press <strong>Enter</strong></li>
                        <li>Select <strong>"Full Scan"</strong></li>
                      </ol>
                    </div>
                    
                    <div style="background-color: white; padding: 20px; border-radius: 8px;">
                      <h3 style="color: #1565c0; font-size: 20px; margin: 0 0 10px 0;">B) Dr.Web CureIt!</h3>
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
          
          <!-- STEP 3 -->
          <tr>
            <td style="padding: 20px 40px;">
              <table width="100%" style="background-color: #fff3e0; border-radius: 12px; border-left: 6px solid #ff9800;">
                <tr>
                  <td style="padding: 25px;">
                    <h2 style="color: #e65100; font-size: 24px; margin: 0 0 15px 0;">
                      📧 Step 3: Check Your Email for Leaks
                    </h2>
                    
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
          
          <!-- STEP 4 -->
          <tr>
            <td style="padding: 20px 40px;">
              <table width="100%" style="background-color: #fce4ec; border-radius: 12px; border-left: 6px solid #e91e63;">
                <tr>
                  <td style="padding: 25px;">
                    <h2 style="color: #c2185b; font-size: 24px; margin: 0 0 15px 0;">
                      🔗 Step 4: NEVER Click Unknown Links!
                    </h2>
                    
                    <div style="background-color: #ffebee; padding: 20px; border-radius: 8px; margin-bottom: 20px; border: 2px dashed #e91e63;">
                      <p style="color: #c62828; font-size: 20px; font-weight: bold; line-height: 1.6; margin: 0;">
                        🚨 Scammers send links with viruses! Check ALL links before clicking!
                      </p>
                    </div>
                    
                    <div style="background-color: white; padding: 20px; border-radius: 8px; margin-bottom: 15px;">
                      <ol style="color: #333; font-size: 18px; line-height: 1.8; margin: 0; padding-left: 25px;">
                        <li>Go to <strong>VirusTotal.com</strong></li>
                        <li>Click <strong>"URL"</strong> tab</li>
                        <li>Paste the suspicious link</li>
                        <li>Click <strong>"Search"</strong></li>
                      </ol>
                    </div>
                    
                    <div style="background-color: #ffcdd2; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                      <p style="color: #b71c1c; font-size: 20px; font-weight: bold; margin: 0;">
                        🚩 See ONE red flag? DO NOT CLICK!
                      </p>
                    </div>
                    
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
          
          <!-- FBI Alerts -->
          <tr>
            <td style="padding: 20px 40px;">
              <table width="100%" style="background-color: #1e3a5f; border-radius: 12px;">
                <tr>
                  <td style="padding: 25px;">
                    <h2 style="color: #ffd700; font-size: 22px; margin: 0 0 15px 0;">
                      🚨 Latest Scam Alerts from FBI
                    </h2>
                    <div style="color: #e0e0e0; font-size: 16px; line-height: 1.6;">
                      ${fbiAlerts}
                    </div>
                    <p style="margin: 15px 0 0 0;">
                      <a href="https://www.ic3.gov/" target="_blank" style="color: #ffd700;">
                        Read more at IC3.gov →
                      </a>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- CTA -->
          <tr>
            <td style="padding: 20px 40px;">
              <table width="100%" style="background: linear-gradient(135deg, #3b82f6 0%, #1e3a5f 100%); border-radius: 12px;">
                <tr>
                  <td align="center" style="padding: 30px;">
                    <p style="color: #ffffff; font-size: 20px; margin: 0 0 20px 0;">
                      📖 For detailed instructions visit:
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
            <td style="padding: 30px 40px; background-color: #f5f5f5;">
              <p style="color: #666; font-size: 14px; text-align: center; margin: 0;">
                You subscribed to cyber safety reminders at CrownHeightsGroups.com
                <br><br>
                <a href="https://crownheightsgroups.com/api/cyber-reminder/unsubscribe?email=\${encodeURIComponent(email)}" 
                   style="color: #999;">Unsubscribe</a>
                <br><br>
                🛡️ Stay Safe!
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

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const testEmail = searchParams.get('email');
  
  if (!testEmail) {
    return NextResponse.json({ 
      error: 'Missing email',
      usage: '/api/cyber-reminder/test?email=your@email.com'
    }, { status: 400 });
  }

  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ error: 'RESEND_API_KEY not configured' }, { status: 500 });
  }

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    
    const fbiAlerts = '<p>• Beware of AI voice scams impersonating family</p><p>• Tech support scams targeting seniors rising</p><p>• Romance scams cost over $1 billion in 2024</p>';
    
    const { data, error } = await resend.emails.send({
      from: 'Cyber Safety <safety@crownheightsgroups.com>',
      to: testEmail,
      subject: '🛡️ Your Monthly Cyber Safety Reminder',
      html: getEmailHTML(testEmail, fbiAlerts),
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Email sent to ' + testEmail, id: data?.id });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to send' }, { status: 500 });
  }
}
