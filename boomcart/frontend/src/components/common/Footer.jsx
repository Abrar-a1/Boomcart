import { Link } from 'react-router-dom';
import { FiInstagram, FiTwitter, FiFacebook } from 'react-icons/fi';

export default function Footer() {
  return (
    <footer style={{ backgroundColor: '#1E3A3A' }}>
      {/* Main content — constrained max-width, centered */}
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '56px 32px 48px 32px' }}>
        {/* Grid — uses CSS grid for even column distribution */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '40px' }}>

          {/* Shop */}
          <div>
            <h4 style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#D4AF37', marginBottom: '20px' }}>Shop</h4>
            <ul>
              {[['Bridal Wear','/?category=bridal'],["Men's Clothing",'/?category=men'],["Women's Clothing",'/?category=women'],['Kids Wear','/kids'],['Featured Items','/?isFeatured=true']].map(([l,h]) => (
                <li key={l} style={{ marginBottom: '12px' }}>
                  <Link
                    to={h}
                    style={{ display: 'inline-block', fontSize: '14px', fontWeight: 500, color: 'rgba(255,255,255,0.6)', transition: 'all 0.3s ease' }}
                    onMouseEnter={e => { e.currentTarget.style.color = '#D4AF37'; e.currentTarget.style.transform = 'translateX(2px)'; }}
                    onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; e.currentTarget.style.transform = 'translateX(0)'; }}
                  >{l}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account */}
          <div>
            <h4 style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#D4AF37', marginBottom: '20px' }}>Account</h4>
            <ul>
              {[['My Profile','/profile'],['My Orders','/profile?tab=orders'],['Wishlist','/wishlist'],['Cart','/cart']].map(([l,h]) => (
                <li key={l} style={{ marginBottom: '12px' }}>
                  <Link
                    to={h}
                    style={{ display: 'inline-block', fontSize: '14px', fontWeight: 500, color: 'rgba(255,255,255,0.6)', transition: 'all 0.3s ease' }}
                    onMouseEnter={e => { e.currentTarget.style.color = '#D4AF37'; e.currentTarget.style.transform = 'translateX(2px)'; }}
                    onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; e.currentTarget.style.transform = 'translateX(0)'; }}
                  >{l}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#D4AF37', marginBottom: '20px' }}>Support</h4>
            <ul>
              {['Contact Us','Return Policy','Shipping Info','Size Guide','FAQ'].map(l => (
                <li key={l} style={{ marginBottom: '12px' }}>
                  <a
                    href="#"
                    style={{ display: 'inline-block', fontSize: '14px', fontWeight: 500, color: 'rgba(255,255,255,0.6)', transition: 'all 0.3s ease' }}
                    onMouseEnter={e => { e.currentTarget.style.color = '#D4AF37'; e.currentTarget.style.transform = 'translateX(2px)'; }}
                    onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; e.currentTarget.style.transform = 'translateX(0)'; }}
                  >{l}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#D4AF37', marginBottom: '20px' }}>Company</h4>
            <ul>
              {['About Us', 'Careers', 'Our Stores', 'Press', 'Sustainability'].map(l => (
                <li key={l} style={{ marginBottom: '12px' }}>
                  <a
                    href="#"
                    style={{ display: 'inline-block', fontSize: '14px', fontWeight: 500, color: 'rgba(255,255,255,0.6)', transition: 'all 0.3s ease' }}
                    onMouseEnter={e => { e.currentTarget.style.color = '#D4AF37'; e.currentTarget.style.transform = 'translateX(2px)'; }}
                    onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; e.currentTarget.style.transform = 'translateX(0)'; }}
                  >{l}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Follow Us */}
          <div>
            <h4 style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#D4AF37', marginBottom: '20px' }}>Follow Us</h4>
            <div style={{ display: 'flex', gap: '12px' }}>
              {[FiInstagram, FiFacebook, FiTwitter].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  style={{ width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.6)', transition: 'all 0.3s ease' }}
                  onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#D4AF37'; e.currentTarget.style.color = '#1E3A3A'; e.currentTarget.style.borderColor = '#D4AF37'; e.currentTarget.style.transform = 'scale(1.1)'; }}
                  onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; e.currentTarget.style.transform = 'scale(1)'; }}
                  aria-label="Social"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Bottom bar — constrained, centered */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '20px 32px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
          <p style={{ fontSize: '12px', fontWeight: 500, color: 'rgba(255,255,255,0.4)', margin: 0 }}>
            © {new Date().getFullYear()} Boomcart. All rights reserved.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>
            <span>Secure payments via</span>
            {['Razorpay','UPI','VISA','AMEX'].map(p => (
              <span key={p} style={{ fontWeight: 700, letterSpacing: '0.06em', color: 'rgba(255,255,255,0.7)' }}>{p}</span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
