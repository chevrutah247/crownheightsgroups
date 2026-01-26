import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h4>Crown Heights Groups</h4>
          <p>
            Connecting communities through WhatsApp groups. 
            Find and join groups in Crown Heights and surrounding neighborhoods.
          </p>
        </div>
        
        <div className="footer-section">
          <h4>Quick Links</h4>
          <ul className="footer-links">
            <li><Link href="/">Browse Groups</Link></li>
            <li><Link href="/suggest">Suggest a Group</Link></li>
            <li><Link href="/contact">Contact Us</Link></li>
          </ul>
        </div>
        
        <div className="footer-section">
          <h4>Categories</h4>
          <ul className="footer-links">
            <li><Link href="/?category=1">Community</Link></li>
            <li><Link href="/?category=2">Business & Jobs</Link></li>
            <li><Link href="/?category=6">Real Estate</Link></li>
            <li><Link href="/?category=11">Buy & Sell</Link></li>
          </ul>
        </div>
        
        <div className="footer-section">
          <h4>Contact</h4>
          <ul className="footer-links">
            <li>
              <a href="mailto:contact@edonthego.org">contact@edonthego.org</a>
            </li>
          </ul>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>
          © {new Date().getFullYear()} Crown Heights Groups. 
          All rights reserved. | 
          <Link href="/privacy"> Privacy Policy</Link>
        </p>
      </div>
    </footer>
  );
}
