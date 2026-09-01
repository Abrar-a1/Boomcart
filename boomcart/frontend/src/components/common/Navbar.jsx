import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { FiShoppingCart, FiHeart, FiUser, FiSearch, FiMenu, FiX, FiLogOut, FiPackage, FiShield } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { useStore } from '../../store/useStore';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const cart = useStore((state) => state.cart);
  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const navigate = useNavigate();
  const [, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const dropRef = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) { 
      navigate('/'); 
      setSearchParams({ keyword: query.trim() }); 
      setMenuOpen(false);
      setSearchOpen(false);
    }
  };

  const NAV_LINKS = [
    ['All', '/'],
    ['Bridal', '/bridal'],
    ['Men', '/?category=men'],
    ['Women', '/?category=women'],
    ['Kids', '/kids'],
    ['Sale', '/?isFeatured=true'],
  ];

  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 50, backgroundColor: '#1E3A3A', boxShadow: '0 1px 4px rgba(0,0,0,0.1)', marginBottom: '24px' }}>
      {/* Container — constrained max-width, centered */}
      <div style={{ maxWidth: '1100px', margin: '0 auto', paddingLeft: '24px', paddingRight: '24px' }}>
        {/* Main row — flexbox with items vertically centered */}
        <div style={{ display: 'flex', alignItems: 'center', height: '72px' }}>
          
          {/* ── Left: Logo ── */}
          <div style={{ flexShrink: 0 }}>
            <Link to="/" className="font-heading" 
              style={{ fontSize: '28px', fontWeight: 700, letterSpacing: '-0.02em', color: '#ffffff', transition: 'color 0.3s ease' }}
              onMouseEnter={e => { e.currentTarget.style.color = '#D4AF37'; }}
              onMouseLeave={e => { e.currentTarget.style.color = '#ffffff'; }}
            >
              Boomcart
            </Link>
          </div>

          {/* ── Center: Navigation — box model: each link has its own padding ── */}
          <nav className="hidden md:flex" style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            {NAV_LINKS.map(([label, href]) => (
              <Link key={label} to={href}
                style={{ 
                  display: 'inline-block',
                  padding: '8px 16px',
                  margin: '0 4px',
                  fontSize: '13px', 
                  fontWeight: 600, 
                  letterSpacing: '0.06em', 
                  textTransform: 'uppercase', 
                  color: 'rgba(255,255,255,0.85)',
                  whiteSpace: 'nowrap',
                  transition: 'color 0.3s ease',
                }}
                onMouseEnter={e => { e.currentTarget.style.color = '#D4AF37'; }}
                onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.85)'; }}
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* ── Right: Actions — box model: each icon has its own margin ── */}
          <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>
            
            {/* Search — single button, no duplicates */}
            <div style={{ position: 'relative', marginRight: '16px' }}>
              {!searchOpen ? (
                <button 
                  onClick={() => setSearchOpen(true)}
                  style={{ alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '999px', fontSize: '13px', fontWeight: 500, color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.15)', backgroundColor: 'transparent', cursor: 'pointer', transition: 'all 0.3s ease', display: 'inline-flex' }}
                  aria-label="Search"
                >
                  <FiSearch size={16} />
                  <span className="hidden sm:inline">Search...</span>
                </button>
              ) : (
                <form onSubmit={handleSearch} className="animate-fade-in w-[220px] sm:w-[320px]" style={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center', backgroundColor: '#fff', borderRadius: '999px', overflow: 'hidden', boxShadow: '0 8px 24px rgba(0,0,0,0.15)', border: '2px solid #D4AF37' }}>
                  <input
                    autoFocus
                    type="text"
                    placeholder="Search products..."
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    style={{ flex: 1, padding: '10px 20px', fontSize: '14px', outline: 'none', border: 'none', color: '#2C3E2F' }}
                  />
                  <button type="submit" style={{ padding: '10px 16px', backgroundColor: '#FDF7F0', border: 'none', cursor: 'pointer', color: '#1E3A3A', transition: 'background-color 0.3s' }}>
                    <FiSearch size={18} />
                  </button>
                  <button type="button" onClick={() => setSearchOpen(false)} style={{ padding: '10px 12px', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', color: '#2C3E2F', transition: 'color 0.3s' }}>
                    <FiX size={18} />
                  </button>
                </form>
              )}
            </div>

            {/* Wishlist */}
            {user && (
              <Link to="/wishlist" className="hidden sm:flex"
                style={{ width: '40px', height: '40px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', color: 'rgba(255,255,255,0.85)', marginRight: '12px', transition: 'color 0.3s ease' }}
                onMouseEnter={e => { e.currentTarget.style.color = '#D4AF37'; }}
                onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.85)'; }}
                aria-label="Wishlist"
              >
                <FiHeart size={22} />
              </Link>
            )}

            {/* Cart */}
            <Link to="/cart" 
              style={{ position: 'relative', width: '40px', height: '40px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', color: 'rgba(255,255,255,0.85)', marginRight: '12px', transition: 'color 0.3s ease' }}
              onMouseEnter={e => { e.currentTarget.style.color = '#D4AF37'; }}
              onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.85)'; }}
              aria-label="Cart"
            >
              <FiShoppingCart size={22} />
              {cartCount > 0 && (
                <span style={{ position: 'absolute', top: '-4px', right: '-4px', minWidth: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', fontSize: '11px', fontWeight: 700, padding: '0 6px', backgroundColor: '#C25A3C', color: '#fff', boxShadow: '0 2px 4px rgba(0,0,0,0.15)' }}>
                  {cartCount}
                </span>
              )}
            </Link>

            {/* User Account / Login */}
            {user ? (
              <div style={{ position: 'relative' }} className="hidden sm:block" ref={dropRef}>
                <button onClick={() => setDropOpen(!dropOpen)}
                  style={{ width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '14px', backgroundColor: '#D4AF37', color: '#1E3A3A', border: 'none', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', transition: 'transform 0.2s' }}
                  aria-label="Account"
                >
                  {user.name?.[0]?.toUpperCase()}
                </button>
                {dropOpen && (
                  <div className="animate-slide-down" style={{ position: 'absolute', right: 0, top: '100%', marginTop: '16px', width: '240px', backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 8px 32px rgba(0,0,0,0.12)', overflow: 'hidden', zIndex: 50, border: '1px solid #E5D9C5' }}>
                    <div style={{ padding: '16px 20px', backgroundColor: '#FDF7F0', borderBottom: '1px solid #E5D9C5' }}>
                      <p style={{ fontWeight: 600, fontSize: '14px', color: '#1E3A3A', marginBottom: '4px' }}>{user.name}</p>
                      <p style={{ fontSize: '12px', color: '#6b7c6e', margin: 0 }}>{user.email}</p>
                    </div>
                    <div style={{ padding: '8px 0' }}>
                      <Link to="/profile" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 20px', fontSize: '14px', fontWeight: 500, color: '#2C3E2F', transition: 'background-color 0.2s' }} onClick={() => setDropOpen(false)} className="hover:bg-[#FDF7F0]">
                        <FiUser size={16}/> My Profile
                      </Link>
                      <Link to="/profile?tab=orders" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 20px', fontSize: '14px', fontWeight: 500, color: '#2C3E2F', transition: 'background-color 0.2s' }} onClick={() => setDropOpen(false)} className="hover:bg-[#FDF7F0]">
                        <FiPackage size={16}/> My Orders
                      </Link>
                      {isAdmin && (
                        <Link to="/admin" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 20px', fontSize: '14px', fontWeight: 700, color: '#D4AF37', transition: 'background-color 0.2s' }} onClick={() => setDropOpen(false)} className="hover:bg-[#FDF7F0]">
                          <FiShield size={16}/> Admin Panel
                        </Link>
                      )}
                    </div>
                    <div style={{ borderTop: '1px solid #E5D9C5', padding: '8px 0' }}>
                      <button style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 20px', fontSize: '14px', fontWeight: 500, color: '#C25A3C', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', transition: 'background-color 0.2s' }}
                        onClick={() => { logout(); setDropOpen(false); navigate('/'); }} className="hover:bg-[#fde8e4]">
                        <FiLogOut size={16}/> Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="hidden sm:inline-flex"
                style={{ display: 'inline-flex', justifyContent: 'center', alignItems: 'center', padding: '10px 24px', marginLeft: '8px', minHeight: '40px', fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', borderRadius: '999px', border: '1.5px solid #D4AF37', color: '#D4AF37', backgroundColor: 'transparent', transition: 'all 0.3s ease' }}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#D4AF37'; e.currentTarget.style.color = '#1E3A3A'; }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#D4AF37'; }}
              >
                Login
              </Link>
            )}

            {/* Mobile Menu Toggle */}
            <button className="md:hidden"
              style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: '8px', border: 'none', backgroundColor: 'transparent', color: 'rgba(255,255,255,0.85)', cursor: 'pointer', transition: 'color 0.3s' }}
              onMouseEnter={e => { e.currentTarget.style.color = '#D4AF37'; }}
              onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.85)'; }}
              onClick={() => setMenuOpen(true)} aria-label="Menu"
            >
              <FiMenu size={24} />
            </button>
            
          </div>
        </div>
      </div>

      {/* ── Mobile Drawer ── */}
      {menuOpen && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 200, backgroundColor: 'rgba(30,58,58,0.6)', backdropFilter: 'blur(4px)', transition: 'opacity 0.3s' }} onClick={() => setMenuOpen(false)} />
          <div className="animate-slide-in" style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: '320px', maxWidth: '85vw', backgroundColor: '#FDF7F0', zIndex: 201, boxShadow: '-8px 0 32px rgba(0,0,0,0.15)', display: 'flex', flexDirection: 'column' }}>
            {/* Drawer header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', backgroundColor: '#1E3A3A' }}>
              <span className="font-heading" style={{ fontSize: '24px', fontWeight: 700, letterSpacing: '-0.02em', color: '#fff' }}>Menu</span>
              <button onClick={() => setMenuOpen(false)}
                style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', border: 'none', backgroundColor: 'rgba(255,255,255,0.1)', color: '#fff', cursor: 'pointer', transition: 'background-color 0.2s' }} aria-label="Close"
              >
                <FiX size={22} />
              </button>
            </div>

            {/* Drawer content — box model: each item has its own padding/margin */}
            <div style={{ padding: '24px', flex: 1, overflowY: 'auto' }}>
              {/* Search */}
              <form onSubmit={handleSearch} style={{ display: 'flex', borderRadius: '999px', overflow: 'hidden', border: '1px solid #E5D9C5', backgroundColor: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', marginBottom: '32px' }}>
                <input type="text" placeholder="Search products..." value={query} onChange={e => setQuery(e.target.value)}
                  style={{ flex: 1, padding: '12px 20px', fontSize: '14px', backgroundColor: 'transparent', outline: 'none', border: 'none', color: '#2C3E2F' }} />
                <button type="submit" style={{ padding: '12px 20px', color: '#fff', backgroundColor: '#1E3A3A', border: 'none', cursor: 'pointer', transition: 'opacity 0.3s' }}><FiSearch size={18}/></button>
              </form>

              {/* Categories */}
              <div style={{ marginBottom: '32px' }}>
                <span style={{ display: 'block', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#9eaa9f', marginBottom: '12px' }}>Categories</span>
                {NAV_LINKS.map(([label, href]) => (
                  <Link key={label} to={href} 
                    style={{ display: 'block', padding: '12px 16px', marginBottom: '4px', fontSize: '15px', fontWeight: 600, color: '#1E3A3A', borderRadius: '12px', transition: 'background-color 0.2s' }} 
                    className="hover:bg-white hover:shadow-sm"
                    onClick={() => setMenuOpen(false)}
                  >
                    {label}
                  </Link>
                ))}
              </div>

              {/* Account links */}
              <div style={{ paddingTop: '24px', borderTop: '1px solid #E5D9C5' }}>
                <span style={{ display: 'block', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#9eaa9f', marginBottom: '12px' }}>Account</span>
                <Link to="/cart" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '12px 16px', marginBottom: '4px', fontSize: '15px', fontWeight: 500, color: '#2C3E2F', borderRadius: '12px', transition: 'background-color 0.2s' }} className="hover:bg-white hover:shadow-sm" onClick={() => setMenuOpen(false)}>
                  <div style={{ position: 'relative' }}>
                    <FiShoppingCart size={20}/>
                    {cartCount > 0 && <span style={{ position: 'absolute', top: '-6px', right: '-8px', backgroundColor: '#C25A3C', color: '#fff', fontSize: '10px', fontWeight: 700, width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }}>{cartCount}</span>}
                  </div>
                  Shopping Cart
                </Link>
                {user && <Link to="/wishlist" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '12px 16px', marginBottom: '4px', fontSize: '15px', fontWeight: 500, color: '#2C3E2F', borderRadius: '12px', transition: 'background-color 0.2s' }} className="hover:bg-white hover:shadow-sm" onClick={() => setMenuOpen(false)}><FiHeart size={20}/> Wishlist</Link>}
                {user && <Link to="/profile" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '12px 16px', marginBottom: '4px', fontSize: '15px', fontWeight: 500, color: '#2C3E2F', borderRadius: '12px', transition: 'background-color 0.2s' }} className="hover:bg-white hover:shadow-sm" onClick={() => setMenuOpen(false)}><FiUser size={20}/> My Profile</Link>}
                {isAdmin && <Link to="/admin" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '12px 16px', marginBottom: '4px', fontSize: '15px', fontWeight: 700, color: '#D4AF37', borderRadius: '12px', transition: 'background-color 0.2s' }} className="hover:bg-white hover:shadow-sm" onClick={() => setMenuOpen(false)}><FiShield size={20}/> Admin Panel</Link>}
              </div>
            </div>

            {/* Drawer footer */}
            <div style={{ padding: '24px', backgroundColor: '#fff', borderTop: '1px solid #E5D9C5' }}>
              {user ? (
                <button 
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '14px 24px', fontSize: '14px', fontWeight: 700, borderRadius: '999px', border: 'none', cursor: 'pointer', backgroundColor: '#C25A3C', color: '#fff', boxShadow: '0 4px 12px rgba(194,90,60,0.3)', transition: 'all 0.3s' }}
                  onClick={() => { logout(); setMenuOpen(false); navigate('/'); }}>
                  <FiLogOut size={18}/> Sign Out
                </button>
              ) : (
                <Link to="/login" 
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '14px 24px', fontSize: '14px', fontWeight: 700, borderRadius: '999px', backgroundColor: '#D4AF37', color: '#1E3A3A', boxShadow: '0 4px 12px rgba(212,175,55,0.3)', transition: 'all 0.3s' }} 
                  onClick={() => setMenuOpen(false)}>
                  <FiUser size={18}/> Login / Register
                </Link>
              )}
            </div>
          </div>
        </>
      )}
    </header>
  );
}
