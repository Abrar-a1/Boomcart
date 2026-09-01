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
    <div>
      {/* Header — box model */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '16px', marginBottom: '24px', borderBottom: '1px solid #E5D9C5' }}>
        <h3 className="font-heading" style={{ fontSize: '20px', color: '#1E3A3A', fontWeight: 700, margin: 0 }}>Filters</h3>
        <button style={{ fontSize: '11px', fontWeight: 700, color: '#C25A3C', textTransform: 'uppercase', letterSpacing: '0.08em', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', transition: 'color 0.3s' }} onClick={clearAll}>
          Clear All
        </button>
      </div>

      {/* ── Category Section ── */}
      <div style={{ paddingBottom: '24px', marginBottom: '24px', borderBottom: '1px solid #E5D9C5' }}>
        <button
          onClick={() => toggleSection('category')}
          style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', padding: 0 }}
        >
          <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#1E3A3A', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>Category</h4>
          <span style={{ color: '#9eaa9f' }}>{expanded.category ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}</span>
        </button>
        {expanded.category && (
          <div className="animate-slide-down">
            {CATEGORIES.map(c => (
              <label key={c} className="group" style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', padding: '10px 0' }}>
                <div style={{ position: 'relative', width: '20px', height: '20px', borderRadius: '4px', border: '1px solid #E5D9C5', backgroundColor: '#FDF7F0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'border-color 0.2s' }}>
                  <input
                    type="checkbox"
                    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', cursor: 'pointer', opacity: 0 }}
                    checked={active('category', c)}
                    onChange={() => set('category', active('category', c) ? '' : c)}
                  />
                  <div style={{ width: '12px', height: '12px', backgroundColor: '#1E3A3A', borderRadius: '2px', opacity: active('category', c) ? 1 : 0, transition: 'opacity 0.2s' }} />
                </div>
                <span style={{ fontSize: '14px', fontWeight: active('category', c) ? 700 : 500, color: active('category', c) ? '#1E3A3A' : '#2C3E2F', transition: 'color 0.2s' }}>
                  {c.charAt(0).toUpperCase() + c.slice(1)}
                </span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* ── Product Type Section ── */}
      <div style={{ paddingBottom: '24px', marginBottom: '24px', borderBottom: '1px solid #E5D9C5' }}>
        <button
          onClick={() => toggleSection('subCategory')}
          style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', padding: 0 }}
        >
          <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#1E3A3A', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>Product Type</h4>
          <span style={{ color: '#9eaa9f' }}>{expanded.subCategory ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}</span>
        </button>
        {expanded.subCategory && (
          <div className="animate-slide-down" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0' }}>
            {SUB_CATS.map(s => (
              <label key={s} className="group" style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '8px 0' }}>
                <div style={{ position: 'relative', width: '16px', height: '16px', borderRadius: '3px', border: '1px solid #E5D9C5', backgroundColor: '#FDF7F0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <input
                    type="checkbox"
                    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', cursor: 'pointer', opacity: 0 }}
                    checked={active('subCategory', s)}
                    onChange={() => set('subCategory', active('subCategory', s) ? '' : s)}
                  />
                  <div style={{ width: '10px', height: '10px', backgroundColor: '#1E3A3A', borderRadius: '2px', opacity: active('subCategory', s) ? 1 : 0, transition: 'opacity 0.2s' }} />
                </div>
                <span style={{ fontSize: '13px', fontWeight: active('subCategory', s) ? 700 : 500, color: active('subCategory', s) ? '#1E3A3A' : '#6b7c6e', transition: 'color 0.2s', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* ── Price Range Section ── */}
      <div style={{ paddingBottom: '24px', marginBottom: '24px', borderBottom: '1px solid #E5D9C5' }}>
        <button
          onClick={() => toggleSection('price')}
          style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', padding: 0 }}
        >
          <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#1E3A3A', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>Price Range</h4>
          <span style={{ color: '#9eaa9f' }}>{expanded.price ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}</span>
        </button>
        {expanded.price && (
          <div className="animate-slide-down">
            {PRICE_RANGES.map(([label, min, max]) => {
              const isActive = params.get('minPrice') === min && params.get('maxPrice') === max;
              return (
                <label key={label} className="group" style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', padding: '10px 0' }}>
                  <div style={{ position: 'relative', width: '20px', height: '20px', borderRadius: '50%', border: '1px solid #E5D9C5', backgroundColor: '#FDF7F0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <input
                      type="radio"
                      name="priceRange"
                      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', cursor: 'pointer', opacity: 0 }}
                      checked={isActive}
                      onChange={() => {
                        const next = new URLSearchParams(params);
                        if (isActive) { next.delete('minPrice'); next.delete('maxPrice'); }
                        else { if (min) next.set('minPrice', min); else next.delete('minPrice'); if (max) next.set('maxPrice', max); else next.delete('maxPrice'); }
                        next.delete('page'); setParams(next);
                      }}
                    />
                    <div style={{ width: '10px', height: '10px', backgroundColor: '#1E3A3A', borderRadius: '50%', opacity: isActive ? 1 : 0, transition: 'opacity 0.2s' }} />
                  </div>
                  <span style={{ fontSize: '14px', fontWeight: isActive ? 700 : 500, color: isActive ? '#1E3A3A' : '#2C3E2F', transition: 'color 0.2s' }}>
                    {label}
                  </span>
                </label>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Sort Section ── */}
      <div style={{ paddingBottom: '24px', marginBottom: '24px', borderBottom: '1px solid #E5D9C5' }}>
        <button
          onClick={() => toggleSection('sort')}
          style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', padding: 0 }}
        >
          <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#1E3A3A', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>Sort By</h4>
          <span style={{ color: '#9eaa9f' }}>{expanded.sort ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}</span>
        </button>
        {expanded.sort && (
          <div className="animate-slide-down">
            {SORT_OPTIONS.map(([label, val]) => (
              <label key={val} className="group" style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', padding: '10px 0' }}>
                <div style={{ position: 'relative', width: '20px', height: '20px', borderRadius: '50%', border: '1px solid #E5D9C5', backgroundColor: '#FDF7F0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <input
                    type="radio"
                    name="sortBy"
                    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', cursor: 'pointer', opacity: 0 }}
                    checked={active('sort', val)}
                    onChange={() => set('sort', active('sort', val) ? '' : val)}
                  />
                  <div style={{ width: '10px', height: '10px', backgroundColor: '#1E3A3A', borderRadius: '50%', opacity: active('sort', val) ? 1 : 0, transition: 'opacity 0.2s' }} />
                </div>
                <span style={{ fontSize: '14px', fontWeight: active('sort', val) ? 700 : 500, color: active('sort', val) ? '#1E3A3A' : '#2C3E2F', transition: 'color 0.2s' }}>
                  {label}
                </span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Featured Items Only — box model */}
      <div style={{ marginBottom: '24px' }}>
        <label className="group" style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', padding: '14px 16px', borderRadius: '12px', border: '1px solid #E5D9C5', backgroundColor: '#FDF7F0', boxShadow: '0 1px 4px rgba(0,0,0,0.03)', transition: 'border-color 0.3s' }}>
          <div style={{ position: 'relative', width: '20px', height: '20px', borderRadius: '4px', border: '1px solid #E5D9C5', backgroundColor: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <input
              type="checkbox"
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', cursor: 'pointer', opacity: 0 }}
              checked={params.get('isFeatured') === 'true'}
              onChange={() => set('isFeatured', params.get('isFeatured') === 'true' ? '' : 'true')}
            />
            <div style={{ width: '12px', height: '12px', backgroundColor: '#D4AF37', borderRadius: '2px', opacity: params.get('isFeatured') === 'true' ? 1 : 0, transition: 'opacity 0.2s' }} />
          </div>
          <span style={{ fontSize: '14px', fontWeight: params.get('isFeatured') === 'true' ? 700 : 500, color: '#1E3A3A', flex: 1 }}>
            Show Featured Only
          </span>
          <span style={{ fontSize: '18px', color: '#D4AF37' }}>⭐</span>
        </label>
      </div>
      
      {/* Mobile close button */}
      <div className="lg:hidden" style={{ paddingTop: '16px', paddingBottom: '24px' }}>
        <button 
          onClick={() => onClose?.()}
          style={{ width: '100%', minHeight: '48px', backgroundColor: '#1E3A3A', color: '#fff', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '13px', borderRadius: '999px', border: 'none', cursor: 'pointer', boxShadow: '0 4px 12px rgba(30,58,58,0.2)', transition: 'background-color 0.3s' }}
        >
          View Results
        </button>
      </div>
    </div>
  );
}
