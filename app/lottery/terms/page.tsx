'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import EmergencyBar from '@/components/EmergencyBar';
import Link from 'next/link';

export default function LotteryTermsPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#f0f4f8' }}>
      <EmergencyBar />
      <Header user={null} onLogout={() => {}} />
      
      <main style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 1rem' }}>
        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: '3rem',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
        }}>
          <h1 style={{ 
            color: '#1e3a5f', 
            fontSize: '2.5rem', 
            marginBottom: '0.5rem',
            textAlign: 'center'
          }}>
            🎰 Crown Heights Groups Lottery Pool
          </h1>
          <h2 style={{ 
            color: '#666', 
            fontSize: '1.5rem', 
            fontWeight: 'normal',
            marginBottom: '2rem',
            textAlign: 'center'
          }}>
            Terms and Conditions
          </h2>
          <p style={{
            color: '#999',
            fontSize: '0.95rem',
            textAlign: 'center',
            marginBottom: '3rem'
          }}>
            Last Updated: February 15, 2026
          </p>

          <div style={{ color: '#333', fontSize: '1.1rem', lineHeight: '1.8' }}>
            
            <section style={{ marginBottom: '2.5rem' }}>
              <h3 style={{ color: '#1e3a5f', fontSize: '1.4rem', marginBottom: '1rem' }}>
                1. Introduction
              </h3>
              <p>
                These Terms and Conditions ("Agreement") govern your participation in the Crown Heights Groups 
                Lottery Pool ("Pool"), operated through CrownHeightsGroups.com ("Website"). By clicking "Register" 
                or "Join Pool", you acknowledge that you have read, understood, and agree to be bound by this Agreement.
              </p>
            </section>

            <section style={{ marginBottom: '2.5rem' }}>
              <h3 style={{ color: '#1e3a5f', fontSize: '1.4rem', marginBottom: '1rem' }}>
                2. Definitions
              </h3>
              <ul style={{ paddingLeft: '1.5rem' }}>
                <li><strong>"Pool"</strong> — A group of participants who collectively purchase lottery tickets and share any winnings.</li>
                <li><strong>"Administrator"</strong> — The operator of the Pool, responsible for purchasing tickets and distributing winnings.</li>
                <li><strong>"Participant"</strong> — Any individual who has paid the participation fee and is registered for the current week's pool.</li>
                <li><strong>"Pool Week"</strong> — The period from Thursday 10:01 PM EST to the following Thursday 10:00 PM EST.</li>
                <li><strong>"Contribution"</strong> — The participation fee paid by each Participant to join the weekly Pool, determined by the selected lottery type: Powerball ($3.00), Mega Millions ($6.00), or Both ($9.00), multiplied by the number of Shares purchased.</li>
                <li><strong>"Share"</strong> — A single unit of participation in the Pool. Each Share entitles the holder to one equal portion of any winnings. A Participant may purchase multiple Shares (up to 10) to increase their proportional claim to winnings.</li>
              </ul>
            </section>

            <section style={{ marginBottom: '2.5rem' }}>
              <h3 style={{ color: '#1e3a5f', fontSize: '1.4rem', marginBottom: '1rem' }}>
                3. Eligibility
              </h3>
              <p>To participate in the Pool, you must:</p>
              <ul style={{ paddingLeft: '1.5rem' }}>
                <li>Be at least 18 years of age (or 21 in states where required).</li>
                <li>Be a legal resident of a jurisdiction where lottery participation is permitted.</li>
                <li>Provide accurate and complete registration information.</li>
                <li>Have a valid payment method (PayPal or Square).</li>
                <li>NOT be an employee of any state lottery commission.</li>
              </ul>
            </section>

            <section style={{ marginBottom: '2.5rem' }}>
              <h3 style={{ color: '#1e3a5f', fontSize: '1.4rem', marginBottom: '1rem' }}>
                4. Registration and Participation
              </h3>
              <p><strong>4.1. Registration:</strong> To join the Pool, you must create an account with your legal first and last name, valid email address, and optional lottery number preferences.</p>
              <p><strong>4.2. Payment:</strong> Participation is confirmed ONLY upon successful payment of the applicable Contribution fee. Pricing varies by lottery type: Powerball — $3.00 ($2.00 ticket + $1.00 service fee); Mega Millions — $6.00 ($5.00 ticket + $1.00 service fee); Both — $9.00 ($7.00 tickets + $2.00 service fee). Each additional Share purchased multiplies the base price accordingly.</p>
              <p><strong>4.3. Confirmation:</strong> Upon successful payment, you will receive a confirmation email. This email serves as proof of your participation.</p>
              <p><strong>4.4. Pool Formation:</strong> Each Pool Week begins Thursday at 10:01 PM EST and ends the following Thursday at 10:00 PM EST.</p>
              <p><strong>4.5. Number Selection:</strong> Participants may optionally submit their preferred lottery numbers. The Administrator reserves the right to select final numbers at their discretion.</p>
            </section>

            <section style={{ marginBottom: '2.5rem' }}>
              <h3 style={{ color: '#1e3a5f', fontSize: '1.4rem', marginBottom: '1rem' }}>
                5. Lottery Tickets and Drawings
              </h3>
              <p><strong>5.1.</strong> The Administrator will purchase lottery tickets (Mega Millions and/or Powerball) using the collected pool funds after the Pool Week closes.</p>
              <p><strong>5.2.</strong> Photos or scans of all purchased tickets will be emailed to all participants.</p>
              <p><strong>5.3.</strong> Physical tickets will be securely stored by the Administrator until drawing results are announced.</p>
            </section>

            <section style={{ marginBottom: '2.5rem' }}>
              <h3 style={{ color: '#1e3a5f', fontSize: '1.4rem', marginBottom: '1rem' }}>
                6. Winnings Distribution
              </h3>
              <div style={{
                background: '#f0fdf4',
                border: '2px solid #86efac',
                borderRadius: '12px',
                padding: '1.5rem',
                marginBottom: '1rem'
              }}>
                <p style={{ margin: 0 }}><strong>✅ Share-Based Distribution:</strong> All winnings shall be divided proportionally based on the total number of Shares held by all Participants in the Pool Week during which the winning ticket was purchased. Each Share represents one equal portion. A Participant who holds multiple Shares receives a correspondingly larger portion of the winnings.</p>
              </div>
              <div style={{
                background: '#eff6ff',
                border: '2px solid #93c5fd',
                borderRadius: '12px',
                padding: '1.5rem',
                marginBottom: '1rem'
              }}>
                <p style={{ margin: '0 0 0.75rem 0' }}><strong>📊 Example:</strong> If the Pool has 10 total Shares and the prize is $1,000:</p>
                <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
                  <li>Participant A (1 Share) receives: $1,000 / 10 = <strong>$100</strong></li>
                  <li>Participant B (3 Shares) receives: $1,000 / 10 × 3 = <strong>$300</strong></li>
                </ul>
              </div>
              <p><strong>6.2. Tax Withholding:</strong> For winnings over $600 USD, applicable federal and state taxes will be withheld as required by law.</p>
              <p><strong>6.3. Small Winnings (Under $50):</strong> Will be reinvested to purchase additional tickets for the same lottery's next drawing.</p>
              <p><strong>6.4. Medium Winnings ($50 - $599):</strong> Will be distributed proportionally based on Shares via original payment method within 14 business days.</p>
              <p><strong>6.5. Large Winnings ($600+):</strong> Participants must provide valid tax identification. Distribution based on Shares within 30 days of prize claim.</p>
              <p><strong>6.6. Multiple Shares:</strong> Purchasing additional Shares is equivalent to holding multiple units of participation. Each Share carries equal weight in the distribution formula. The maximum number of Shares per Participant per Pool Week is 10.</p>
            </section>

            <section style={{ marginBottom: '2.5rem' }}>
              <h3 style={{ color: '#1e3a5f', fontSize: '1.4rem', marginBottom: '1rem' }}>
                7. Referral Program
              </h3>
              <p><strong>7.1.</strong> When you invite a friend who registers AND purchases at least one pool entry, you receive a $1.00 credit toward your next entry.</p>
              <p><strong>7.2.</strong> Referral credits have no cash value and cannot be withdrawn.</p>
            </section>

            <section style={{ marginBottom: '2.5rem' }}>
              <h3 style={{ color: '#1e3a5f', fontSize: '1.4rem', marginBottom: '1rem' }}>
                8. Administrator Responsibilities
              </h3>
              <p>The Administrator agrees to:</p>
              <ul style={{ paddingLeft: '1.5rem' }}>
                <li>Purchase lottery tickets promptly after each Pool Week closes.</li>
                <li>Securely store all physical tickets.</li>
                <li>Provide photographic evidence of purchased tickets.</li>
                <li>Notify participants of any winnings within 24 hours.</li>
                <li>Distribute winnings fairly and in accordance with this Agreement.</li>
                <li>Maintain accurate records of all participants, payments, and winnings.</li>
              </ul>
            </section>

            <section style={{ marginBottom: '2.5rem' }}>
              <h3 style={{ color: '#1e3a5f', fontSize: '1.4rem', marginBottom: '1rem' }}>
                9. Disclaimers and Limitations
              </h3>
              <div style={{ 
                background: '#fef2f2', 
                border: '2px solid #fecaca', 
                borderRadius: '12px', 
                padding: '1.5rem',
                marginBottom: '1rem'
              }}>
                <p style={{ margin: 0, color: '#991b1b' }}>
                  <strong>⚠️ No Guarantee of Winnings:</strong> Participation in the Pool does not guarantee any winnings. 
                  Lottery is a game of chance. The contribution fee should be considered an entertainment expense.
                </p>
              </div>
              <p><strong>9.2.</strong> The Administrator's maximum liability shall not exceed the participant's contributions.</p>
            </section>

            <section style={{ marginBottom: '2.5rem' }}>
              <h3 style={{ color: '#1e3a5f', fontSize: '1.4rem', marginBottom: '1rem' }}>
                10. Dispute Resolution
              </h3>
              <p>Any disputes shall first be addressed through good-faith negotiation. Unresolved disputes shall be subject to binding arbitration in New York, NY. This Agreement is governed by the laws of the State of New York.</p>
            </section>

            <section style={{ marginBottom: '2.5rem' }}>
              <h3 style={{ color: '#1e3a5f', fontSize: '1.4rem', marginBottom: '1rem' }}>
                11. Contact Information
              </h3>
              <p>
                <strong>Crown Heights Groups Lottery Pool</strong><br/>
                Email: lottery@crownheightsgroups.com<br/>
                Website: https://crownheightsgroups.com/lottery
              </p>
            </section>

            <section style={{ 
              background: '#fef3c7', 
              border: '3px solid #f59e0b', 
              borderRadius: '16px', 
              padding: '2rem',
              textAlign: 'center'
            }}>
              <h3 style={{ color: '#92400e', fontSize: '1.4rem', marginBottom: '1rem' }}>
                📜 Acknowledgment
              </h3>
              <p style={{ color: '#78350f', margin: 0 }}>
                BY CLICKING "REGISTER" OR "JOIN POOL", YOU ACKNOWLEDGE THAT:<br/><br/>
                ✅ You have read and understood these Terms and Conditions.<br/>
                ✅ You are of legal age to participate in lottery pools.<br/>
                ✅ You understand that lottery is a game of chance with no guaranteed winnings.<br/>
                ✅ You agree to be bound by all terms of this Agreement.
              </p>
            </section>
          </div>

          <div style={{ textAlign: 'center', marginTop: '3rem' }}>
            <Link href="/lottery/join" style={{
              display: 'inline-block',
              background: 'linear-gradient(135deg, #ffd700, #f59e0b)',
              color: '#1e3a5f',
              padding: '1.25rem 2.5rem',
              borderRadius: '12px',
              fontSize: '1.3rem',
              fontWeight: 'bold',
              textDecoration: 'none',
              marginRight: '1rem'
            }}>
              🎟️ I Agree - Join Pool
            </Link>
            <Link href="/lottery" style={{
              display: 'inline-block',
              background: '#e5e7eb',
              color: '#374151',
              padding: '1.25rem 2rem',
              borderRadius: '12px',
              fontSize: '1.1rem',
              textDecoration: 'none'
            }}>
              ← Back to Lottery
            </Link>
          </div>

          <p style={{ 
            textAlign: 'center', 
            color: '#999', 
            fontSize: '0.9rem', 
            marginTop: '2rem' 
          }}>
            © 2026 Crown Heights Groups. All Rights Reserved.
          </p>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
