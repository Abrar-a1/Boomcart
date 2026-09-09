import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';

const CATEGORIES   = ['men','women','bridal','kids'];
const SUB_CATS     = ['shirts','pants','kurta','saree','lehenga','dress','jeans','jacket','suit','sherwani','tops','skirts','ethnic','western','accessories'];
const PRICE_RANGES = [['Under ₹500','0','500'],['₹500–₹1500','500','1500'],['₹1500–₹3000','1500','3000'],['₹3000–₹8000','3000','8000'],['Above ₹8000','8000','']];
const SORT_OPTIONS = [['Newest','-createdAt'],['Price: Low→High','price'],['Price: High→Low','-price'],['Top Rated','-ratings']];

export default function ProductFilters({ onClose }) {
  const [params, setParams] = useSearchParams();
  const [expanded, setExpanded] = useState({
    category: true,
    subCategory: true,
    price: true,
    sort: true
  });

  const toggleSection = (section) => {
    setExpanded(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const set = (key, val) => {
    const next = new URLSearchParams(params);
    if (val) { next.set(key, val); } else { next.delete(key); }
    next.delete('page');
    setParams(next);
  };

  const clearAll = () => { setParams({}); onClose?.(); };
  const active = (key, val) => params.get(key) === val;

  return (
    <div className="flex flex-col h-full lg:h-auto">
      {/* ── Header ── */}
      <div className="flex items-center justify-between pb-6 mb-8 border-b border-[var(--color-border-main)]">
        <h3 className="font-heading text-2xl font-bold text-[var(--color-primary)]">Filters</h3>
        <button 
          onClick={clearAll}
          className="font-body text-[10px] font-bold uppercase tracking-widest text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors"
        >
          Clear All
        </button>
      </div>

      <div className="flex-1 overflow-y-auto lg:overflow-visible">
        {/* ── Sort Section ── */}
        <div className="mb-8">
          <button
            onClick={() => toggleSection('sort')}
            className="w-full flex items-center justify-between py-2 group focus-visible:outline"
          >
            <h4 className="font-body text-xs font-bold uppercase tracking-[0.1em] text-[var(--color-primary)]">Sort By</h4>
            <span className="text-[var(--color-text-light)] group-hover:text-[var(--color-primary)] transition-colors">
              {expanded.sort ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
            </span>
          </button>
          {expanded.sort && (
            <div className="mt-4 flex flex-col gap-3 animate-slide-down">
              {SORT_OPTIONS.map(([label, val]) => (
                <label key={val} className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative w-4 h-4 rounded-full border border-[var(--color-border-main)] flex items-center justify-center shrink-0 transition-colors group-hover:border-[var(--color-primary)]">
                    <input
                      type="radio"
                      name="sortBy"
                      className="peer absolute inset-0 opacity-0 cursor-pointer"
                      checked={active('sort', val)}
                      onChange={() => set('sort', active('sort', val) ? '' : val)}
                    />
                    <div className={`w-2 h-2 rounded-full bg-[var(--color-primary)] transition-opacity ${active('sort', val) ? 'opacity-100' : 'opacity-0'}`} />
                  </div>
                  <span className={`font-body text-sm transition-colors ${active('sort', val) ? 'font-semibold text-[var(--color-primary)]' : 'text-[var(--color-text)] opacity-90'}`}>
                    {label}
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* ── Category Section ── */}
        <div className="mb-8">
          <button
            onClick={() => toggleSection('category')}
            className="w-full flex items-center justify-between py-2 group focus-visible:outline"
          >
            <h4 className="font-body text-xs font-bold uppercase tracking-[0.1em] text-[var(--color-primary)]">Category</h4>
            <span className="text-[var(--color-text-light)] group-hover:text-[var(--color-primary)] transition-colors">
              {expanded.category ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
            </span>
          </button>
          {expanded.category && (
            <div className="mt-4 flex flex-col gap-3 animate-slide-down">
              {CATEGORIES.map(c => (
                <label key={c} className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative w-4 h-4 rounded-sm border border-[var(--color-border-main)] flex items-center justify-center shrink-0 transition-colors group-hover:border-[var(--color-primary)]">
                    <input
                      type="checkbox"
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      checked={active('category', c)}
                      onChange={() => set('category', active('category', c) ? '' : c)}
                    />
                    <div className={`w-2 h-2 bg-[var(--color-primary)] rounded-[1px] transition-opacity ${active('category', c) ? 'opacity-100' : 'opacity-0'}`} />
                  </div>
                  <span className={`font-body text-sm transition-colors ${active('category', c) ? 'font-semibold text-[var(--color-primary)]' : 'text-[var(--color-text)] opacity-90'}`}>
                    {c.charAt(0).toUpperCase() + c.slice(1)}
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* ── Product Type Section ── */}
        <div className="mb-8">
          <button
            onClick={() => toggleSection('subCategory')}
            className="w-full flex items-center justify-between py-2 group focus-visible:outline"
          >
            <h4 className="font-body text-xs font-bold uppercase tracking-[0.1em] text-[var(--color-primary)]">Product Type</h4>
            <span className="text-[var(--color-text-light)] group-hover:text-[var(--color-primary)] transition-colors">
              {expanded.subCategory ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
            </span>
          </button>
          {expanded.subCategory && (
            <div className="mt-4 grid grid-cols-2 gap-y-3 gap-x-2 animate-slide-down">
              {SUB_CATS.map(s => (
                <label key={s} className="flex items-center gap-2 cursor-pointer group">
                  <div className="relative w-3.5 h-3.5 rounded-sm border border-[var(--color-border-main)] flex items-center justify-center shrink-0 transition-colors group-hover:border-[var(--color-primary)]">
                    <input
                      type="checkbox"
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      checked={active('subCategory', s)}
                      onChange={() => set('subCategory', active('subCategory', s) ? '' : s)}
                    />
                    <div className={`w-1.5 h-1.5 bg-[var(--color-primary)] rounded-[1px] transition-opacity ${active('subCategory', s) ? 'opacity-100' : 'opacity-0'}`} />
                  </div>
                  <span className={`font-body text-xs transition-colors truncate ${active('subCategory', s) ? 'font-semibold text-[var(--color-primary)]' : 'text-[var(--color-text)] opacity-90'}`}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* ── Price Range Section ── */}
        <div className="mb-8">
          <button
            onClick={() => toggleSection('price')}
            className="w-full flex items-center justify-between py-2 group focus-visible:outline"
          >
            <h4 className="font-body text-xs font-bold uppercase tracking-[0.1em] text-[var(--color-primary)]">Price Range</h4>
            <span className="text-[var(--color-text-light)] group-hover:text-[var(--color-primary)] transition-colors">
              {expanded.price ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
            </span>
          </button>
          {expanded.price && (
            <div className="mt-4 flex flex-col gap-3 animate-slide-down">
              {PRICE_RANGES.map(([label, min, max]) => {
                const isActive = params.get('minPrice') === min && params.get('maxPrice') === max;
                return (
                  <label key={label} className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative w-4 h-4 rounded-full border border-[var(--color-border-main)] flex items-center justify-center shrink-0 transition-colors group-hover:border-[var(--color-primary)]">
                      <input
                        type="radio"
                        name="priceRange"
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        checked={isActive}
                        onChange={() => {
                          const next = new URLSearchParams(params);
                          if (isActive) { next.delete('minPrice'); next.delete('maxPrice'); }
                          else { 
                            if (min) next.set('minPrice', min); else next.delete('minPrice'); 
                            if (max) next.set('maxPrice', max); else next.delete('maxPrice'); 
                          }
                          next.delete('page'); setParams(next);
                        }}
                      />
                      <div className={`w-2 h-2 rounded-full bg-[var(--color-primary)] transition-opacity ${isActive ? 'opacity-100' : 'opacity-0'}`} />
                    </div>
                    <span className={`font-body text-sm transition-colors ${isActive ? 'font-semibold text-[var(--color-primary)]' : 'text-[var(--color-text)] opacity-90'}`}>
                      {label}
                    </span>
                  </label>
                );
              })}
            </div>
          )}
        </div>

        {/* Featured Items Only */}
        <div className="pt-6 border-t border-[var(--color-border-main)]">
          <label className="flex items-center gap-3 cursor-pointer group py-2">
            <div className="relative w-4 h-4 rounded-sm border border-[var(--color-border-main)] flex items-center justify-center shrink-0 transition-colors group-hover:border-[var(--color-primary)]">
              <input
                type="checkbox"
                className="absolute inset-0 opacity-0 cursor-pointer"
                checked={params.get('isFeatured') === 'true'}
                onChange={() => set('isFeatured', params.get('isFeatured') === 'true' ? '' : 'true')}
              />
              <div className={`w-2 h-2 bg-[var(--color-accent)] rounded-[1px] transition-opacity ${params.get('isFeatured') === 'true' ? 'opacity-100' : 'opacity-0'}`} />
            </div>
            <span className={`font-body text-sm transition-colors flex-1 ${params.get('isFeatured') === 'true' ? 'font-semibold text-[var(--color-primary)]' : 'text-[var(--color-text)] opacity-90'}`}>
              Show Featured Only
            </span>
          </label>
        </div>
      </div>
      
      {/* Mobile close button */}
      <div className="lg:hidden mt-6 pb-6 pt-4 border-t border-[var(--color-border-light)] mt-auto shrink-0">
        <button 
          onClick={() => onClose?.()}
          className="w-full h-12 bg-[var(--color-primary)] text-white font-body text-xs font-bold uppercase tracking-widest rounded-sm hover:bg-black transition-colors focus-visible:outline"
        >
          View Results
        </button>
      </div>
    </div>
  );
}
