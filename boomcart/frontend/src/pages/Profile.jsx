import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { FiUser, FiPackage, FiLock, FiMapPin, FiHeart, FiTrash2, FiPlus, FiShield, FiEye } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { getMyOrders } from '../services/orderService';
import { updateProfile, changePassword } from '../services/authService';
import { addAddress, deleteAddress, getWishlist, toggleWishlist } from '../services/userService';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';
import { Helmet } from 'react-helmet-async';
import PageContainer from '../components/common/PageContainer';

const STATUS_BADGE = { pending:'bg-orange-100 text-orange-800', confirmed:'bg-blue-100 text-blue-800', processing:'bg-blue-100 text-blue-800', shipped:'bg-blue-100 text-blue-800', delivered:'bg-green-100 text-green-800', cancelled:'bg-red-100 text-red-800', refunded:'bg-gray-100 text-gray-800' };
const STATES = ['Jammu & Kashmir','Delhi','Maharashtra','Karnataka','Tamil Nadu','Rajasthan','Uttar Pradesh','Gujarat','West Bengal','Punjab','Haryana','Kerala','Madhya Pradesh','Bihar','Assam','Himachal Pradesh','Other'];

export default function Profile() {
  const { user, updateUser } = useAuth();
  const { addToCart } = useCart();
  const [params] = useSearchParams();
  const [tab, setTab]           = useState(params.get('tab') || 'profile');
  const [orders, setOrders]     = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [wishItems, setWishItems] = useState([]);
  const [wishLoading, setWishLoading] = useState(false);
  const [addresses, setAddresses] = useState(user?.addresses || []);
  const [showAddrForm, setShowAddrForm] = useState(false);
  const [addrForm, setAddrForm] = useState({ fullName:'', phone:'', addressLine1:'', addressLine2:'', city:'', state:'', pincode:'', isDefault:false });
  const [profileForm, setProfileForm] = useState({ name: user?.name||'', email: user?.email||'' });
  const [pwForm, setPwForm]     = useState({ currentPassword:'', newPassword:'', confirm:'' });
  const [saving, setSaving]     = useState(false);
  const [savingAddr, setSavingAddr] = useState(false);

  useEffect(() => {
    if (tab === 'orders') {
      setOrdersLoading(true);
      getMyOrders().then(({ data }) => setOrders(data.data)).catch(console.error).finally(() => setOrdersLoading(false));
    }
    if (tab === 'wishlist') {
      setWishLoading(true);
      getWishlist().then(({ data }) => setWishItems(data.data)).catch(console.error).finally(() => setWishLoading(false));
    }
  }, [tab]);

  const saveProfile = async (e) => {
    e.preventDefault(); setSaving(true);
    try { const { data } = await updateProfile(profileForm); updateUser(data.data); toast.success('Profile updated!'); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const savePassword = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirm) { toast.error('Passwords do not match'); return; }
    setSaving(true);
    try {
      const { data } = await changePassword({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      updateUser({ token: data.data.token });
      toast.success('Password updated! Please log in again on other devices.');
      setPwForm({ currentPassword:'', newPassword:'', confirm:'' });
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const saveAddress = async (e) => {
    e.preventDefault(); setSavingAddr(true);
    try {
      const { data } = await addAddress(addrForm);
      setAddresses(data.data);
      updateUser({ addresses: data.data });
      setShowAddrForm(false);
      setAddrForm({ fullName:'', phone:'', addressLine1:'', addressLine2:'', city:'', state:'', pincode:'', isDefault:false });
      toast.success('Address saved!');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSavingAddr(false); }
  };

  const removeAddress = async (id) => {
    if (!window.confirm('Remove this address?')) return;
    try {
      const { data } = await deleteAddress(id);
      setAddresses(data.data);
      updateUser({ addresses: data.data });
      toast.success('Address removed');
    } catch { toast.error('Failed'); }
  };

  const removeWish = async (id) => {
    try { await toggleWishlist(id); setWishItems(prev => prev.filter(i => i._id !== id)); toast.success('Removed'); }
    catch { toast.error('Failed'); }
  };

  const TABS = [
    { id:'profile',   label:'Profile',    Icon: FiUser },
    { id:'orders',    label:'My Orders',  Icon: FiPackage },
    { id:'addresses', label:'Addresses',  Icon: FiMapPin },
    { id:'wishlist',  label:'Wishlist',   Icon: FiHeart },
    { id:'security',  label:'Security',   Icon: FiLock },
  ];

  return (
    <div className="w-full min-h-screen bg-[var(--color-background)] py-12 lg:py-20">
      <Helmet><title>My Profile — Boomcart</title></Helmet>
      
      <PageContainer variant="functional" className="flex flex-col lg:flex-row gap-10 lg:gap-16 items-start animate-smooth-reveal">

        {/* ── SIDEBAR ── */}
        <div className="w-full lg:w-[280px] shrink-0 bg-white border border-[var(--color-border)] rounded-sm overflow-hidden flex flex-col">
          <div className="p-8 bg-[var(--color-primary)] text-center">
            <div className="w-16 h-16 rounded-full bg-[var(--color-accent)] mx-auto mb-4 flex items-center justify-center font-heading text-3xl font-bold text-[var(--color-primary)]">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <p className="font-heading text-xl font-bold text-white mb-1">{user?.name}</p>
            <p className="font-body text-xs text-white/60 mb-2">{user?.email}</p>
            {user?.role === 'admin' && (
              <span className="inline-flex items-center gap-1.5 mt-2 bg-[var(--color-accent)]/20 text-[var(--color-accent)] font-body text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-sm">
                <FiShield size={12}/> ADMIN
              </span>
            )}
          </div>
          <div className="flex flex-col py-2">
            {TABS.map(({ id, label, Icon }) => (
              <button 
                key={id} 
                onClick={() => setTab(id)}
                className={`flex items-center gap-3 px-6 py-4 font-body text-sm text-left transition-colors focus-visible:outline ${
                  tab === id 
                    ? 'bg-[var(--color-background)] text-[var(--color-primary)] font-bold border-l-4 border-[var(--color-primary)]' 
                    : 'text-[var(--color-text-muted)] hover:bg-[var(--color-background)]/50 border-l-4 border-transparent'
                }`}
              >
                <Icon size={16}/> {label}
              </button>
            ))}
          </div>
        </div>

        {/* ── CONTENT PANEL ── */}
        <div className="flex-1 w-full min-w-0">

          {/* PROFILE */}
          {tab === 'profile' && (
            <div className="bg-white border border-[var(--color-border)] rounded-sm p-8 lg:p-12 animate-fade-in">
              <h2 className="font-heading text-3xl font-bold text-[var(--color-primary)] mb-10">Personal Information</h2>
              <form onSubmit={saveProfile} className="flex flex-col gap-6 max-w-[500px]">
                {[{n:'name',l:'Full Name',t:'text'},{n:'email',l:'Email Address',t:'email'}].map(f => (
                  <div key={f.n} className="flex flex-col gap-2">
                    <label className="font-body text-xs font-bold uppercase tracking-widest text-[var(--color-text-muted)]">{f.l}</label>
                    <input 
                      type={f.t} 
                      className="w-full px-4 py-3 bg-white border border-[var(--color-border)] rounded-sm font-body text-sm text-[var(--color-text)] focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-colors" 
                      value={profileForm[f.n]} 
                      onChange={e => setProfileForm({...profileForm,[f.n]:e.target.value})} 
                    />
                  </div>
                ))}
                <div className="flex flex-col gap-2">
                  <label className="font-body text-xs font-bold uppercase tracking-widest text-[var(--color-text-muted)]">Role</label>
                  <input className="w-full px-4 py-3 bg-[var(--color-background)] border border-[var(--color-border-light)] rounded-sm font-body text-sm text-[var(--color-text-muted)] cursor-not-allowed" value={user?.role} disabled />
                </div>
                <button 
                  className="mt-4 self-start px-8 py-3 bg-[var(--color-primary)] text-white font-body text-sm font-bold uppercase tracking-widest rounded-sm transition-all hover:bg-black focus-visible:outline disabled:opacity-50 disabled:cursor-not-allowed" 
                  type="submit" 
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </form>
            </div>
          )}

          {/* ORDERS */}
          {tab === 'orders' && (
            <div className="bg-white border border-[var(--color-border)] rounded-sm p-8 lg:p-12 animate-fade-in">
              <h2 className="font-heading text-3xl font-bold text-[var(--color-primary)] mb-10">My Orders</h2>
              {ordersLoading ? <div className="text-center text-[var(--color-text-muted)] py-10">Loading orders...</div> : orders.length === 0 ? (
                <div className="text-center py-16">
                  <FiPackage size={48} className="mx-auto text-[var(--color-text-light)] opacity-50 mb-6" />
                  <h3 className="font-heading text-2xl font-bold text-[var(--color-primary)] mb-4">No orders yet</h3>
                  <Link to="/" className="inline-flex items-center gap-2 px-8 py-3 bg-[var(--color-cta)] text-white font-body text-sm font-bold uppercase tracking-widest rounded-sm hover:opacity-90 transition-opacity">
                    Shop Now
                  </Link>
                </div>
              ) : (
                <div className="flex flex-col gap-6">
                  {orders.map(o => (
                    <div key={o._id} className="border border-[var(--color-border)] rounded-sm p-6 lg:p-8">
                      <div className="flex flex-wrap justify-between items-start gap-4 mb-6 pb-6 border-b border-[var(--color-border-light)]">
                        <div>
                          <p className="font-heading text-xl font-bold text-[var(--color-primary)]">#{o._id.slice(-8).toUpperCase()}</p>
                          <p className="font-body text-xs text-[var(--color-text-muted)] mt-1">{new Date(o.createdAt).toLocaleDateString('en-IN')}</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className={`font-body text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-sm ${STATUS_BADGE[o.orderStatus]||'bg-gray-100 text-gray-800'}`}>
                            {o.orderStatus}
                          </span>
                          <Link to={`/order/${o._id}`} className="inline-flex items-center gap-2 px-4 py-2 border border-[var(--color-primary)] text-[var(--color-primary)] font-body text-[10px] font-bold uppercase tracking-widest rounded-sm hover:bg-[var(--color-primary)] hover:text-white transition-colors">
                            <FiEye size={12}/> Track
                          </Link>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-4 mb-6">
                        {o.orderItems.slice(0,4).map(item => (
                          <div key={item._id} className="w-16 h-20 bg-[var(--color-border-light)] rounded-sm overflow-hidden flex-shrink-0 border border-[var(--color-border)]">
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                          </div>
                        ))}
                        {o.orderItems.length > 4 && (
                          <div className="w-16 h-20 bg-[var(--color-background)] border border-[var(--color-border-light)] rounded-sm flex items-center justify-center font-body text-xs font-bold text-[var(--color-text-muted)]">
                            +{o.orderItems.length-4}
                          </div>
                        )}
                      </div>
                      <div className="flex justify-between items-end">
                        <span className="font-body text-xs font-bold uppercase tracking-widest text-[var(--color-text-muted)]">Order Total</span>
                        <span className="font-heading text-xl font-bold text-[var(--color-primary)]">₹{o.totalPrice?.toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ADDRESSES */}
          {tab === 'addresses' && (
            <div className="bg-white border border-[var(--color-border)] rounded-sm p-8 lg:p-12 animate-fade-in">
              <div className="flex justify-between items-center mb-10">
                <h2 className="font-heading text-3xl font-bold text-[var(--color-primary)]">Saved Addresses</h2>
                <button 
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--color-primary)] text-white font-body text-[10px] font-bold uppercase tracking-widest rounded-sm hover:bg-black transition-colors" 
                  onClick={() => setShowAddrForm(!showAddrForm)}
                >
                  <FiPlus size={14}/> {showAddrForm ? 'Cancel' : 'Add New'}
                </button>
              </div>

              {showAddrForm && (
                <form onSubmit={saveAddress} className="bg-[var(--color-background)] border border-[var(--color-border)] rounded-sm p-8 mb-10">
                  <h4 className="font-heading text-xl font-bold text-[var(--color-primary)] mb-6">New Address</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    {[{n:'fullName',l:'Full Name',col:'md:col-span-2'},{n:'phone',l:'Phone'},{n:'pincode',l:'Pincode'},{n:'addressLine1',l:'Address Line 1',col:'md:col-span-2'},{n:'addressLine2',l:'Address Line 2 (optional)',col:'md:col-span-2'},{n:'city',l:'City'}].map(f => (
                      <div key={f.n} className={`flex flex-col gap-2 ${f.col || ''}`}>
                        <label className="font-body text-xs font-bold uppercase tracking-widest text-[var(--color-text-muted)]">{f.l}</label>
                        <input className="w-full px-4 py-3 bg-white border border-[var(--color-border)] rounded-sm font-body text-sm focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-colors" value={addrForm[f.n]} onChange={e => setAddrForm({...addrForm,[f.n]:e.target.value})} required={f.n!=='addressLine2'} />
                      </div>
                    ))}
                    <div className="flex flex-col gap-2">
                      <label className="font-body text-xs font-bold uppercase tracking-widest text-[var(--color-text-muted)]">State</label>
                      <select className="w-full px-4 py-3 bg-white border border-[var(--color-border)] rounded-sm font-body text-sm focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-colors" value={addrForm.state} onChange={e => setAddrForm({...addrForm,state:e.target.value})} required>
                        <option value="">Select state</option>
                        {STATES.map(s => <option key={s}>{s}</option>)}
                      </select>
                    </div>
                    <div className="flex items-center gap-3 md:col-span-2 mt-2">
                      <input type="checkbox" id="isDefault" checked={addrForm.isDefault} onChange={e => setAddrForm({...addrForm,isDefault:e.target.checked})} className="w-4 h-4 text-[var(--color-primary)] focus:ring-[var(--color-primary)]" />
                      <label htmlFor="isDefault" className="font-body text-sm text-[var(--color-text)]">Set as default address</label>
                    </div>
                  </div>
                  <button className="px-8 py-3 bg-[var(--color-primary)] text-white font-body text-xs font-bold uppercase tracking-widest rounded-sm hover:bg-black transition-colors" type="submit" disabled={savingAddr}>
                    {savingAddr ? 'Saving...' : 'Save Address'}
                  </button>
                </form>
              )}

              {addresses.length === 0 ? (
                <div className="text-center py-16">
                  <FiMapPin size={40} className="mx-auto text-[var(--color-text-light)] opacity-50 mb-6" />
                  <p className="font-body text-[var(--color-text-muted)]">No saved addresses yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {addresses.map(a => (
                    <div key={a._id} className="relative border border-[var(--color-border)] rounded-sm p-6 flex flex-col items-start gap-4 hover:border-[var(--color-primary)] transition-colors group">
                      {a.isDefault && <span className="absolute top-6 right-16 bg-[var(--color-background)] border border-[var(--color-border-light)] text-[var(--color-primary)] font-body text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-sm">Default</span>}
                      <button onClick={() => removeAddress(a._id)} className="absolute top-6 right-6 text-[var(--color-text-light)] hover:text-[var(--color-cta)] transition-colors" title="Remove">
                        <FiTrash2 size={18}/>
                      </button>
                      <p className="font-heading text-xl font-bold text-[var(--color-primary)] max-w-[80%] leading-tight">{a.fullName}</p>
                      <p className="font-body text-sm text-[var(--color-text-muted)] leading-relaxed">
                        {a.addressLine1}{a.addressLine2?`, ${a.addressLine2}`:''}<br/>
                        {a.city}, {a.state} — {a.pincode}<br/>
                        <span className="inline-block mt-2 font-medium">📞 {a.phone}</span>
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* WISHLIST */}
          {tab === 'wishlist' && (
            <div className="bg-white border border-[var(--color-border)] rounded-sm p-8 lg:p-12 animate-fade-in">
              <h2 className="font-heading text-3xl font-bold text-[var(--color-primary)] mb-10">My Wishlist</h2>
              {wishLoading ? <div className="text-center text-[var(--color-text-muted)] py-10">Loading wishlist...</div> : wishItems.length === 0 ? (
                <div className="text-center py-16">
                  <FiHeart size={40} className="mx-auto text-[var(--color-text-light)] opacity-50 mb-6" />
                  <p className="font-body text-[var(--color-text-muted)] mb-6">Your wishlist is empty.</p>
                  <Link to="/" className="inline-flex items-center gap-2 px-8 py-3 border border-[var(--color-primary)] text-[var(--color-primary)] font-body text-sm font-bold uppercase tracking-widest rounded-sm hover:bg-[var(--color-primary)] hover:text-white transition-colors">Browse Collection</Link>
                </div>
              ) : (
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                  {wishItems.map(item => {
                    const price = item.discountPrice > 0 ? item.discountPrice : item.price;
                    return (
                      <div key={item._id} className="group relative border border-[var(--color-border)] rounded-sm overflow-hidden bg-[var(--color-background)]">
                        <button onClick={() => removeWish(item._id)} className="absolute top-3 right-3 z-10 w-8 h-8 bg-white rounded-full flex items-center justify-center text-[var(--color-text-light)] hover:text-[var(--color-cta)] hover:scale-110 shadow-sm transition-all">
                          <FiTrash2 size={14}/>
                        </button>
                        <Link to={`/product/${item._id}`} className="block w-full aspect-[3/4] overflow-hidden">
                          <img src={item.images[0]?.url} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        </Link>
                        <div className="p-4 bg-white flex flex-col gap-2">
                          <Link to={`/product/${item._id}`} className="font-heading text-lg font-bold text-[var(--color-primary)] leading-tight group-hover:text-[var(--color-accent-dark)] transition-colors line-clamp-1">{item.name}</Link>
                          <p className="font-body text-[15px] font-bold text-[var(--color-text)] mb-2">₹{price.toLocaleString()}</p>
                          <button className="w-full py-2.5 bg-white border border-[var(--color-primary)] text-[var(--color-primary)] font-body text-[10px] font-bold uppercase tracking-widest rounded-sm hover:bg-[var(--color-primary)] hover:text-white transition-colors"
                            onClick={() => addToCart(item, 1, item.sizes?.[0]||'', item.colors?.[0]||'')}>
                            Add to Bag
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* SECURITY */}
          {tab === 'security' && (
            <div className="bg-white border border-[var(--color-border)] rounded-sm p-8 lg:p-12 animate-fade-in">
              <h2 className="font-heading text-3xl font-bold text-[var(--color-primary)] mb-10">Security Settings</h2>
              <form onSubmit={savePassword} className="flex flex-col gap-6 max-w-[500px]">
                {[{n:'currentPassword',l:'Current Password'},{n:'newPassword',l:'New Password'},{n:'confirm',l:'Confirm New Password'}].map(f => (
                  <div key={f.n} className="flex flex-col gap-2">
                    <label className="font-body text-xs font-bold uppercase tracking-widest text-[var(--color-text-muted)]">{f.l}</label>
                    <input type="password" placeholder="••••••••" className="w-full px-4 py-3 bg-white border border-[var(--color-border)] rounded-sm font-body text-sm focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-colors" value={pwForm[f.n]} onChange={e => setPwForm({...pwForm,[f.n]:e.target.value})} />
                  </div>
                ))}
                <button className="mt-4 self-start px-8 py-3 bg-[var(--color-primary)] text-white font-body text-sm font-bold uppercase tracking-widest rounded-sm transition-all hover:bg-black focus-visible:outline disabled:opacity-50 disabled:cursor-not-allowed" type="submit" disabled={saving}>
                  {saving ? 'Updating...' : 'Update Password'}
                </button>
              </form>
            </div>
          )}

        </div>
      </PageContainer>
    </div>
  );
}