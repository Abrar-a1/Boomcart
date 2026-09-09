import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { FiShoppingCart, FiHeart, FiUser, FiSearch, FiMenu, FiX, FiLogOut, FiPackage, FiShield, FiArrowRight } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { useStore } from '../../store/useStore';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const cart = useStore((state) => state.cart);
  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
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
    <header className={`sticky top-0 z-50 transition-all duration-700 ease-in-out ${scrolled ? 'bg-[var(--color-background)] shadow-sm py-4' : 'bg-[var(--color-background)] py-6'}`}>
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
        <div className="flex items-center justify-between">
          
          {/* ── Mobile Left: Hamburger ── */}
          <div className="flex lg:hidden flex-1 justify-start">
            <button 
              aria-label="Open mobile menu"
              onClick={() => setMenuOpen(true)}
              className="text-[var(--color-primary)] hover:opacity-80 transition-opacity p-2 -ml-2"
            >
              <FiMenu size={24} />
            </button>
          </div>

          {/* ── Desktop Left / Mobile Center: Wordmark ── */}
          <div className="flex-shrink-0 flex justify-center lg:justify-start lg:w-1/4">
            <Link to="/" className="font-heading text-2xl lg:text-3xl font-bold tracking-[0.05em] text-[var(--color-primary)] transition-opacity hover:opacity-80">
              BOOMCART
            </Link>
          </div>

          {/* ── Center: Desktop Navigation ── */}
          <nav className="hidden lg:flex flex-1 justify-center items-center gap-8 xl:gap-12">
            {NAV_LINKS.map(([label, href]) => {
              const active = isActive(href);
              return (
                <Link 
                  key={label} 
                  to={href}
                  className={`font-body text-[11px] font-bold uppercase tracking-[0.15em] transition-colors duration-300 underline-hover ${
                    active ? 'text-[var(--color-primary)]' : 'text-[var(--color-text)] hover:text-[var(--color-primary)] opacity-80 hover:opacity-100'
                  }`}
                >
                  {label}
                </Link>
              );
            })}
          </nav>

          {/* ── Right: Actions ── */}
          <div className="flex flex-1 justify-end items-center space-x-6 sm:space-x-8">
            
            {/* Desktop Search */}
            <div className="hidden lg:block relative">
              <button 
                onClick={() => setSearchOpen(true)}
                className="text-[var(--color-primary)] hover:opacity-70 transition-opacity p-2 flex items-center gap-2"
              >
                <FiSearch size={20} />
                <span className="font-body text-[11px] font-bold uppercase tracking-[0.1em]">Search</span>
              </button>
              
              {/* Expandable Search Panel */}
              {searchOpen && (
                <>
                  <div className="fixed inset-0 bg-black/20 z-[60] backdrop-blur-sm transition-opacity" onClick={() => setSearchOpen(false)} />
                  <div className="absolute top-0 right-0 w-[min(450px,calc(100vw-3rem))] bg-[var(--color-background)] border border-[var(--color-border-light)] shadow-xl z-[70] animate-slide-down rounded-sm overflow-hidden">
                    <form onSubmit={e => handleSearch(e)} className="flex items-center border-b border-[var(--color-border-light)] p-2">
                      <input
                        autoFocus
                        type="text"
                        placeholder="Search for elegant pieces..."
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        className="flex-1 px-4 py-4 font-body text-sm bg-transparent outline-none text-[var(--color-primary)] placeholder:text-[var(--color-text-light)]"
                      />
                      <button type="submit" className="p-4 text-[var(--color-primary)] hover:opacity-70 transition-opacity">
                        <FiArrowRight size={20} />
                      </button>
                    </form>
                    <div className="p-8">
                      <h4 className="font-body text-[10px] font-bold uppercase tracking-widest text-[var(--color-text-muted)] mb-4">Trending Now</h4>
                      <div className="flex flex-wrap gap-2">
                        {['Bridal Lehengas', 'Mens Sherwani', 'Velvet', 'Festive Collection'].map(term => (
                          <button 
                            key={term} 
                            onClick={() => { setQuery(term); handleSearch(null, term); }}
                            className="px-4 py-2 border border-[var(--color-border-light)] rounded-sm font-body text-xs text-[var(--color-text)] hover:border-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white transition-colors"
                          >
                            {term}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Mobile Search (Hidden in desktop panel) */}
            <button 
              aria-label="Open search"
              onClick={() => setMenuOpen(true)}
              className="lg:hidden text-[var(--color-primary)] hover:opacity-70 transition-opacity p-2"
            >
              <FiSearch size={20} />
            </button>

            {/* Wishlist */}
            <Link 
              to="/wishlist"
              aria-label="Wishlist"
              className="text-[var(--color-primary)] hover:opacity-70 transition-opacity p-2 hidden sm:block"
            >
              <FiHeart size={20} />
            </Link>

            {/* User Account */}
            <div className="relative hidden lg:block" ref={dropRef}>
              {user ? (
                <button 
                  onClick={() => setDropOpen(!dropOpen)}
                  className="flex items-center justify-center w-8 h-8 text-[10px] font-bold text-[var(--color-background)] bg-[var(--color-primary)] hover:opacity-80 transition-opacity rounded-full"
                >
                  {user.name?.[0]?.toUpperCase()}
                </button>
              ) : (
                <Link to="/login" className="text-[var(--color-primary)] hover:opacity-70 transition-opacity p-2 flex items-center gap-2">
                  <FiUser size={20} />
                  <span className="font-body text-[11px] font-bold uppercase tracking-[0.1em]">Account</span>
                </Link>
              )}
              
              {dropOpen && user && (
                <div className="absolute right-0 top-full mt-4 w-64 bg-[var(--color-background)] border border-[var(--color-border-light)] rounded-sm shadow-xl z-50 animate-slide-down">
                  <div className="px-6 py-5 border-b border-[var(--color-border-light)] bg-white/50">
                    <p className="font-heading text-lg font-bold text-[var(--color-primary)] truncate">{user.name}</p>
                    <p className="font-body text-xs text-[var(--color-text-muted)] truncate mt-1">{user.email}</p>
                  </div>
                  <div className="py-2">
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
                  <div className="border-t border-[var(--color-border-light)] py-2">
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
              className="relative text-[var(--color-primary)] hover:opacity-70 transition-opacity p-2 flex items-center gap-2"
            >
              <FiShoppingCart size={20} />
              <span className="hidden lg:block font-body text-[11px] font-bold uppercase tracking-[0.1em]">Bag</span>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 lg:top-0 lg:-right-3 flex items-center justify-center w-[18px] h-[18px] text-[9px] font-bold text-white bg-[var(--color-cta)] rounded-full shadow-sm">
                  {cartCount}
                </span>
              )}
            </Link>
            
          </div>
        </div>
      </div>

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
                <form onSubmit={e => handleSearch(e)} className="flex items-center border-b border-[var(--color-border-main)] py-2">
                  <FiSearch size={20} className="text-[var(--color-text-light)] mr-4" />
                  <input 
                    type="text" 
                    placeholder="Search..." 
                    value={query} 
                    onChange={e => setQuery(e.target.value)}
                    className="flex-1 bg-transparent border-none outline-none font-body text-sm text-[var(--color-primary)] placeholder:text-[var(--color-text-light)]"
                  />
                  {query && (
                    <button type="submit" className="text-[var(--color-primary)]">
                      <FiArrowRight size={20} />
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
