import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { FiShoppingCart, FiHeart, FiUser, FiSearch, FiMenu, FiX, FiLogOut, FiPackage, FiShield } from 'react-icons/fi';
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
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
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

  const currentPath = location.pathname + location.search;
  const isActive = (href) => {
    if (href === '/') return location.pathname === '/' && location.search === '';
    return currentPath === href;
  };

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'bg-[var(--color-background)] shadow-sm' : 'bg-[var(--color-background)]'}`}>
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
        <div className="flex items-center justify-between h-20">
          
          {/* ── Left: Wordmark ── */}
          <div className="flex-shrink-0">
            <Link to="/" className="font-heading text-2xl lg:text-3xl font-bold tracking-tight text-[var(--color-primary)] hover:opacity-80 transition-opacity focus-visible:outline">
              BOOMCART
            </Link>
          </div>

          {/* ── Center: Desktop Navigation ── */}
          <nav className="hidden lg:flex flex-1 justify-center items-center space-x-8">
            {NAV_LINKS.map(([label, href]) => {
              const active = isActive(href);
              return (
                <Link 
                  key={label} 
                  to={href}
                  className={`font-body text-[13px] font-semibold uppercase tracking-[0.06em] transition-colors duration-200 focus-visible:outline ${
                    active 
                      ? 'text-[var(--color-primary)]' 
                      : 'text-[var(--color-text-muted)] hover:text-[var(--color-primary)]'
                  }`}
                >
                  {label}
                  {active && <span className="block h-[1px] w-full bg-[var(--color-primary)] mt-0.5" />}
                </Link>
              );
            })}
          </nav>

          {/* ── Right: Actions ── */}
          <div className="flex-shrink-0 flex items-center space-x-2 sm:space-x-4">
            
            {/* Search */}
            <div className="relative">
              {!searchOpen ? (
                <button 
                  onClick={() => setSearchOpen(true)}
                  aria-label="Open search"
                  className="flex items-center justify-center w-10 h-10 text-[var(--color-primary)] hover:bg-black/5 transition-colors duration-200 rounded-sm focus-visible:outline"
                >
                  <FiSearch size={20} />
                </button>
              ) : (
                <form 
                  onSubmit={handleSearch} 
                  className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center bg-white border border-[var(--color-border-light)] rounded-sm shadow-sm overflow-hidden w-[240px] sm:w-[300px] z-10 animate-slide-in"
                >
                  <input
                    autoFocus
                    type="text"
                    placeholder="Search products..."
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    className="flex-1 px-4 py-2 text-sm font-body text-[var(--color-text)] bg-transparent border-none outline-none"
                  />
                  <button type="submit" aria-label="Submit search" className="px-3 text-[var(--color-primary)] hover:opacity-80 transition-opacity">
                    <FiSearch size={18} />
                  </button>
                  <button type="button" onClick={() => setSearchOpen(false)} aria-label="Close search" className="px-3 border-l border-[var(--color-border-light)] text-[var(--color-text-muted)] hover:text-black transition-colors">
                    <FiX size={18} />
                  </button>
                </form>
              )}
            </div>

            {/* Wishlist */}
            {user && (
              <Link 
                to="/wishlist"
                aria-label="Wishlist"
                className="hidden sm:flex items-center justify-center w-10 h-10 text-[var(--color-primary)] hover:bg-black/5 transition-colors duration-200 rounded-sm focus-visible:outline"
              >
                <FiHeart size={20} />
              </Link>
            )}

            {/* Cart */}
            <Link 
              to="/cart"
              aria-label={`Cart with ${cartCount} items`}
              className="relative flex items-center justify-center w-10 h-10 text-[var(--color-primary)] hover:bg-black/5 transition-colors duration-200 rounded-sm focus-visible:outline"
            >
              <FiShoppingCart size={20} />
              {cartCount > 0 && (
                <span className="absolute top-1 right-0 flex items-center justify-center w-[18px] h-[18px] text-[10px] font-bold text-white bg-[var(--color-cta)] rounded-full">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* User Account */}
            {user ? (
              <div className="relative hidden sm:block" ref={dropRef}>
                <button 
                  onClick={() => setDropOpen(!dropOpen)}
                  aria-label="Account menu"
                  aria-expanded={dropOpen}
                  className="flex items-center justify-center w-10 h-10 text-sm font-bold text-[var(--color-background)] bg-[var(--color-primary)] hover:bg-black transition-colors duration-200 rounded-full focus-visible:outline"
                >
                  {user.name?.[0]?.toUpperCase()}
                </button>
                {dropOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-[var(--color-border-light)] rounded-sm shadow-md overflow-hidden z-50 animate-slide-down">
                    <div className="px-5 py-4 border-b border-[var(--color-border-light)] bg-black/5">
                      <p className="font-body text-sm font-semibold text-[var(--color-primary)] truncate">{user.name}</p>
                      <p className="font-body text-xs text-[var(--color-text-muted)] truncate mt-0.5">{user.email}</p>
                    </div>
                    <div className="py-2">
                      <Link to="/profile" className="flex items-center gap-3 px-5 py-2.5 font-body text-sm font-medium text-[var(--color-text)] hover:bg-black/5 transition-colors" onClick={() => setDropOpen(false)}>
                        <FiUser size={16} /> My Profile
                      </Link>
                      <Link to="/profile?tab=orders" className="flex items-center gap-3 px-5 py-2.5 font-body text-sm font-medium text-[var(--color-text)] hover:bg-black/5 transition-colors" onClick={() => setDropOpen(false)}>
                        <FiPackage size={16} /> My Orders
                      </Link>
                      {isAdmin && (
                        <Link to="/admin" className="flex items-center gap-3 px-5 py-2.5 font-body text-sm font-bold text-[var(--color-accent-dark)] hover:bg-black/5 transition-colors" onClick={() => setDropOpen(false)}>
                          <FiShield size={16} /> Admin Panel
                        </Link>
                      )}
                    </div>
                    <div className="border-t border-[var(--color-border-light)] py-2">
                      <button 
                        className="w-full flex items-center gap-3 px-5 py-2.5 font-body text-sm font-medium text-[var(--color-cta)] hover:bg-black/5 transition-colors text-left"
                        onClick={() => { logout(); setDropOpen(false); navigate('/'); }}
                      >
                        <FiLogOut size={16} /> Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link 
                to="/login"
                className="hidden sm:inline-flex items-center justify-center h-10 px-6 font-body text-xs font-bold uppercase tracking-widest text-[var(--color-primary)] border border-[var(--color-primary)] rounded-sm hover:bg-[var(--color-primary)] hover:text-[var(--color-background)] transition-colors duration-200 focus-visible:outline"
              >
                Login
              </Link>
            )}

            {/* Mobile Menu Trigger */}
            <button 
              aria-label="Open mobile menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen(true)}
              className="lg:hidden flex items-center justify-center w-10 h-10 text-[var(--color-primary)] hover:bg-black/5 transition-colors duration-200 rounded-sm focus-visible:outline"
            >
              <FiMenu size={24} />
            </button>
            
          </div>
        </div>
      </div>

      {/* ── Mobile Drawer ── */}
      {menuOpen && (
        <div className="lg:hidden">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-[100] bg-black/40 transition-opacity duration-300"
            onClick={() => setMenuOpen(false)}
            aria-hidden="true"
          />
          
          {/* Drawer */}
          <div 
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation"
            className="fixed inset-y-0 right-0 z-[110] w-[300px] max-w-[85vw] bg-[var(--color-background)] border-l border-[var(--color-border-light)] shadow-xl flex flex-col animate-slide-in"
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between px-6 h-20 border-b border-[var(--color-border-light)]">
              <span className="font-heading text-xl font-bold tracking-tight text-[var(--color-primary)]">Menu</span>
              <button 
                onClick={() => setMenuOpen(false)}
                aria-label="Close menu"
                className="flex items-center justify-center w-10 h-10 text-[var(--color-primary)] hover:bg-black/5 rounded-sm transition-colors duration-200 focus-visible:outline"
              >
                <FiX size={22} />
              </button>
            </div>

            {/* Drawer Content */}
            <div className="flex-1 overflow-y-auto py-6 px-6 scrollbar-hide">
              {/* Mobile Search */}
              <form onSubmit={handleSearch} className="flex items-center bg-white border border-[var(--color-border-light)] rounded-sm overflow-hidden mb-8 focus-within:border-[var(--color-primary)] transition-colors">
                <input 
                  type="text" 
                  placeholder="Search products..." 
                  value={query} 
                  onChange={e => setQuery(e.target.value)}
                  className="flex-1 px-4 py-3 text-sm font-body text-[var(--color-text)] bg-transparent outline-none"
                  aria-label="Search input"
                />
                <button type="submit" aria-label="Submit search" className="px-4 text-[var(--color-primary)] hover:opacity-80 transition-opacity">
                  <FiSearch size={18} />
                </button>
              </form>

              {/* Categories */}
              <div className="mb-8">
                <span className="block text-xs font-bold uppercase tracking-widest text-[var(--color-text-muted)] mb-4">Categories</span>
                <nav className="flex flex-col space-y-1">
                  {NAV_LINKS.map(([label, href]) => {
                    const active = isActive(href);
                    return (
                      <Link 
                        key={label} 
                        to={href} 
                        className={`block px-4 py-3 font-body text-sm font-semibold uppercase tracking-wider rounded-sm transition-colors focus-visible:outline ${
                          active ? 'text-[var(--color-primary)] bg-black/5' : 'text-[var(--color-text-muted)] hover:bg-black/5'
                        }`}
                        onClick={() => setMenuOpen(false)}
                      >
                        {label}
                      </Link>
                    );
                  })}
                </nav>
              </div>

              {/* Account Links */}
              <div className="pt-6 border-t border-[var(--color-border-light)]">
                <span className="block text-xs font-bold uppercase tracking-widest text-[var(--color-text-muted)] mb-4">Account</span>
                <nav className="flex flex-col space-y-1">
                  <Link to="/cart" onClick={() => setMenuOpen(false)} className="flex items-center gap-4 px-4 py-3 font-body text-base font-medium text-[var(--color-text)] rounded-sm hover:bg-black/5 transition-colors focus-visible:outline">
                    <div className="relative">
                      <FiShoppingCart size={20} />
                      {cartCount > 0 && <span className="absolute -top-1.5 -right-2 bg-[var(--color-cta)] text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">{cartCount}</span>}
                    </div>
                    Shopping Cart
                  </Link>
                  {user && (
                    <>
                      <Link to="/wishlist" onClick={() => setMenuOpen(false)} className="flex items-center gap-4 px-4 py-3 font-body text-base font-medium text-[var(--color-text)] rounded-sm hover:bg-black/5 transition-colors focus-visible:outline">
                        <FiHeart size={20} /> Wishlist
                      </Link>
                      <Link to="/profile" onClick={() => setMenuOpen(false)} className="flex items-center gap-4 px-4 py-3 font-body text-base font-medium text-[var(--color-text)] rounded-sm hover:bg-black/5 transition-colors focus-visible:outline">
                        <FiUser size={20} /> My Profile
                      </Link>
                    </>
                  )}
                  {isAdmin && (
                    <Link to="/admin" onClick={() => setMenuOpen(false)} className="flex items-center gap-4 px-4 py-3 font-body text-base font-bold text-[var(--color-accent-dark)] rounded-sm hover:bg-black/5 transition-colors focus-visible:outline">
                      <FiShield size={20} /> Admin Panel
                    </Link>
                  )}
                </nav>
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="p-6 border-t border-[var(--color-border-light)]">
              {user ? (
                <button 
                  className="w-full flex items-center justify-center gap-2 py-3 px-6 font-body text-sm font-bold text-[var(--color-background)] bg-[var(--color-primary)] hover:opacity-90 rounded-sm transition-opacity focus-visible:outline"
                  onClick={() => { logout(); setMenuOpen(false); navigate('/'); }}
                >
                  <FiLogOut size={18} /> Sign Out
                </button>
              ) : (
                <Link 
                  to="/login" 
                  className="w-full flex items-center justify-center gap-2 py-3 px-6 font-body text-sm font-bold uppercase tracking-widest text-[var(--color-background)] bg-[var(--color-primary)] hover:opacity-90 rounded-sm transition-opacity focus-visible:outline"
                  onClick={() => setMenuOpen(false)}
                >
                  <FiUser size={18} /> Login / Register
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
