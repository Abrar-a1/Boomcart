import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { FiShoppingCart, FiHeart, FiUser, FiSearch, FiMenu, FiX, FiLogOut, FiPackage, FiShield, FiArrowRight } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import PageContainer from './PageContainer';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('keyword') || '');
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const dropRef = useRef(null);
  
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handler = (e) => { if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (menuOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const handleSearch = (e, explicitQuery = null) => {
    if (e) e.preventDefault();
    const finalQuery = explicitQuery || query.trim();
    if (finalQuery) { 
      navigate('/'); 
      setSearchParams({ keyword: finalQuery }); 
      setMenuOpen(false);
      setSearchOpen(false);
    }
  };

  const NAV_LINKS = [
    ['WOMEN', '/?category=women'],
    ['MEN', '/?category=men'],
    ['KIDS', '/kids'],
    ['BRIDAL', '/bridal'],
    ['NEW IN', '/?isFeatured=true'],
  ];

  const currentPath = location.pathname + location.search;
  const isActive = (href) => {
    if (href === '/') return location.pathname === '/' && location.search === '';
    return currentPath === href;
  };

  return (
    <header className={`sticky top-0 z-50 transition-all duration-500 ease-in-out bg-[var(--color-primary)] text-[var(--color-background)] ${scrolled ? 'shadow-sm py-4' : 'py-5'}`}>
      <PageContainer>
        <div className="flex items-center justify-between w-full">
          
          {/* ── Mobile Left: Hamburger ── */}
          <div className="flex lg:hidden flex-1 justify-start">
            <button 
              aria-label="Open mobile menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen(true)}
              className="hover:text-[var(--color-accent)] transition-colors p-2 focus-visible:outline"
            >
              <FiMenu size={24} />
            </button>
          </div>

          {/* ── Desktop Left / Mobile Center: Wordmark ── */}
          <div className="flex-1 flex justify-center lg:justify-start shrink-0">
            <Link to="/" className="font-heading text-2xl lg:text-[26px] tracking-[0.08em] transition-colors hover:text-[var(--color-accent)] focus-visible:outline">
              BOOMCART
            </Link>
          </div>

          {/* ── Center: Desktop Navigation ── */}
          <nav className="hidden lg:flex flex-none justify-center items-center gap-8">
            {NAV_LINKS.map(([label, href]) => {
              const active = isActive(href);
              return (
                <Link 
                  key={label} 
                  to={href}
                  className={`relative font-body text-xs tracking-[0.15em] transition-colors duration-300 pb-1 group focus-visible:outline ${
                    active ? 'text-[var(--color-accent)] font-bold' : 'text-white/80 hover:text-[var(--color-accent)]'
                  }`}
                >
                  {label}
                  <span className={`absolute bottom-0 left-0 w-full h-[1px] bg-[var(--color-accent)] transition-transform duration-300 origin-left ${
                    active ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                  }`} />
                </Link>
              );
            })}
          </nav>

          {/* ── Right: Actions ── */}
          <div className="flex-1 flex justify-end items-center gap-6 shrink-0">
            
            {/* Desktop Search */}
            <div className="hidden lg:block relative">
              <button 
                onClick={() => setSearchOpen(true)}
                className="hover:text-[var(--color-accent)] transition-colors flex items-center gap-2 focus-visible:outline"
                aria-label="Search"
              >
                <FiSearch size={18} />
                <span className="font-body text-[10px] font-bold tracking-[0.1em] uppercase">Search</span>
              </button>
              
              {/* Expandable Search Panel */}
              {searchOpen && (
                <>
                  <div className="fixed inset-0 z-[60]" onClick={() => setSearchOpen(false)} />
                  <div className="absolute top-1/2 -translate-y-1/2 right-0 flex items-center bg-white border border-[var(--color-border)] rounded-sm shadow-xl z-[70] overflow-hidden min-w-[320px] transition-all duration-300 focus-within:border-[var(--color-primary)] focus-within:ring-1 focus-within:ring-[var(--color-primary)]/30">
                    <form onSubmit={e => handleSearch(e)} className="flex items-center w-full">
                      <input
                        autoFocus
                        type="text"
                        placeholder="Search for elegant pieces..."
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        className="flex-1 px-4 py-2.5 font-body text-sm bg-transparent outline-none text-[var(--color-text)] placeholder:text-[var(--color-text-muted)]"
                      />
                      <button type="submit" className="px-3 text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors">
                        <FiArrowRight size={18} />
                      </button>
                      <button type="button" onClick={() => setSearchOpen(false)} className="px-3 py-3 border-l border-[var(--color-border-light)] text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors">
                        <FiX size={16} />
                      </button>
                    </form>
                  </div>
                </>
              )}
            </div>

            {/* Mobile Search (Hidden in desktop panel) */}
            <button 
              aria-label="Open search"
              onClick={() => setMenuOpen(true)}
              className="lg:hidden hover:text-[var(--color-accent)] transition-colors p-2 focus-visible:outline"
            >
              <FiSearch size={20} />
            </button>

            {/* Wishlist */}
            <Link 
              to="/wishlist"
              aria-label="Wishlist"
              className="hover:text-[var(--color-accent)] transition-colors hidden sm:block focus-visible:outline"
            >
              <FiHeart size={18} />
            </Link>

            {/* User Account */}
            <div className="relative hidden lg:block" ref={dropRef}>
              {user ? (
                <button 
                  onClick={() => setDropOpen(!dropOpen)}
                  aria-expanded={dropOpen}
                  aria-haspopup="true"
                  className="flex items-center justify-center w-8 h-8 text-[11px] font-bold text-[var(--color-primary)] bg-[var(--color-accent)] hover:opacity-90 transition-opacity rounded-full focus-visible:outline"
                  aria-label="Account Menu"
                >
                  {user.name?.[0]?.toUpperCase()}
                </button>
              ) : (
                <Link to="/login" className="hover:text-[var(--color-accent)] transition-colors flex items-center gap-2 focus-visible:outline">
                  <FiUser size={18} />
                  <span className="font-body text-[10px] font-bold tracking-[0.1em] uppercase">Account</span>
                </Link>
              )}
              
              {dropOpen && user && (
                <div className="absolute right-0 top-full mt-4 w-64 bg-[var(--color-background)] border border-[var(--color-border-light)] rounded-md shadow-xl z-50 animate-slide-down text-[var(--color-text)]">
                  <div className="px-6 py-5 border-b border-[var(--color-border-light)] bg-white">
                    <p className="font-heading text-lg font-bold text-[var(--color-primary)] truncate">{user.name}</p>
                    <p className="font-body text-xs text-[var(--color-text-muted)] truncate mt-1">{user.email}</p>
                  </div>
                  <div className="py-2 bg-white">
                    <Link to="/profile" className="flex items-center gap-4 px-6 py-3 font-body text-xs uppercase tracking-widest text-[var(--color-text)] hover:bg-black/5 transition-colors" onClick={() => setDropOpen(false)}>
                      <FiUser size={14} /> My Profile
                    </Link>
                    <Link to="/profile?tab=orders" className="flex items-center gap-4 px-6 py-3 font-body text-xs uppercase tracking-widest text-[var(--color-text)] hover:bg-black/5 transition-colors" onClick={() => setDropOpen(false)}>
                      <FiPackage size={14} /> My Orders
                    </Link>
                    {isAdmin && (
                      <Link to="/admin" className="flex items-center gap-4 px-6 py-3 font-body text-xs font-bold uppercase tracking-widest text-[var(--color-accent-dark)] hover:bg-black/5 transition-colors" onClick={() => setDropOpen(false)}>
                        <FiShield size={14} /> Admin Panel
                      </Link>
                    )}
                  </div>
                  <div className="border-t border-[var(--color-border-light)] py-2 bg-white rounded-b-md">
                    <button 
                      className="w-full flex items-center gap-4 px-6 py-3 font-body text-xs uppercase tracking-widest text-[var(--color-cta)] hover:bg-black/5 transition-colors text-left"
                      onClick={() => { logout(); setDropOpen(false); navigate('/'); }}
                    >
                      <FiLogOut size={14} /> Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Cart */}
            <Link 
              to="/cart"
              className="hover:text-[var(--color-accent)] transition-colors flex items-center gap-2 relative focus-visible:outline"
              aria-label={`Bag, ${cartCount} items`}
            >
              <div className="relative flex items-center justify-center p-1">
                <FiShoppingCart size={18} />
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 flex items-center justify-center w-[16px] h-[16px] text-[8px] font-bold text-[var(--color-background)] bg-[var(--color-cta)] rounded-full shadow-sm">
                    {cartCount}
                  </span>
                )}
              </div>
              <span className="hidden lg:block font-body text-[10px] font-bold tracking-[0.1em] uppercase">Bag</span>
            </Link>
            
          </div>
        </div>
      </PageContainer>

      {/* ── Mobile Drawer ── */}
      {menuOpen && (
        <div className="lg:hidden">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm transition-opacity duration-500"
            onClick={() => setMenuOpen(false)}
          />
          
          {/* Drawer */}
          <div 
            className="fixed inset-y-0 left-0 z-[110] w-[85vw] max-w-[400px] bg-[var(--color-background)] shadow-2xl flex flex-col animate-slide-in-left"
            style={{ animation: 'slideInLeft 0.5s cubic-bezier(0.2, 0.8, 0.2, 1) forwards' }}
          >
            <div className="flex items-center justify-between p-6 border-b border-[var(--color-border-light)]">
              <span className="font-heading text-2xl font-bold tracking-tight text-[var(--color-primary)]">BOOMCART</span>
              <button 
                aria-label="Close menu"
                onClick={() => setMenuOpen(false)}
                className="text-[var(--color-primary)] hover:opacity-70 transition-opacity p-2"
              >
                <FiX size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-hide">
              {/* Search */}
              <div className="p-6 border-b border-[var(--color-border-light)]">
                <form onSubmit={e => handleSearch(e)} className="flex items-center bg-white border border-[var(--color-border)] rounded-sm py-2.5 px-4 transition-all duration-300 focus-within:border-[var(--color-primary)] focus-within:ring-1 focus-within:ring-[var(--color-primary)]/30">
                  <FiSearch size={18} className="text-[var(--color-text-muted)] mr-3 shrink-0" />
                  <input 
                    type="text" 
                    placeholder="Search..." 
                    value={query} 
                    onChange={e => setQuery(e.target.value)}
                    className="flex-1 bg-transparent border-none outline-none font-body text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] w-full"
                  />
                  {query && (
                    <button type="submit" className="text-[var(--color-primary)] shrink-0 ml-2">
                      <FiArrowRight size={18} />
                    </button>
                  )}
                </form>
              </div>

              {/* Navigation Links */}
              <nav className="p-6 flex flex-col space-y-8 border-b border-[var(--color-border-light)]">
                {NAV_LINKS.map(([label, href]) => (
                  <Link 
                    key={label} 
                    to={href} 
                    className="font-heading text-3xl font-bold text-[var(--color-primary)] hover:text-[var(--color-accent)] transition-colors"
                    onClick={() => setMenuOpen(false)}
                  >
                    {label}
                  </Link>
                ))}
              </nav>

              {/* Account / Utilities */}
              <div className="p-6 flex flex-col space-y-6">
                {user ? (
                  <>
                    <Link to="/profile" onClick={() => setMenuOpen(false)} className="flex items-center gap-4 font-body text-xs font-bold uppercase tracking-widest text-[var(--color-text)]">
                      <FiUser size={18} /> My Account
                    </Link>
                    <Link to="/wishlist" onClick={() => setMenuOpen(false)} className="flex items-center gap-4 font-body text-xs font-bold uppercase tracking-widest text-[var(--color-text)]">
                      <FiHeart size={18} /> Wishlist
                    </Link>
                    <button onClick={() => { logout(); setMenuOpen(false); navigate('/'); }} className="flex items-center gap-4 font-body text-xs font-bold uppercase tracking-widest text-[var(--color-cta)] text-left">
                      <FiLogOut size={18} /> Sign Out
                    </button>
                  </>
                ) : (
                  <Link to="/login" onClick={() => setMenuOpen(false)} className="flex items-center gap-4 font-body text-xs font-bold uppercase tracking-widest text-[var(--color-text)]">
                    <FiUser size={18} /> Login / Register
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      
      <style>{`
        @keyframes slideInLeft {
          from { transform: translateX(-100%); }
          to   { transform: translateX(0); }
        }
      `}</style>
    </header>
  );
}
