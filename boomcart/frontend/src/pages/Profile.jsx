import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { FiUser, FiPackage, FiLock, FiEye, FiMapPin, FiHeart, FiTrash2, FiPlus, FiShield } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { getMyOrders } from '../services/orderService';
import { updateProfile, changePassword } from '../services/authService';
import { addAddress, deleteAddress, getWishlist, toggleWishlist } from '../services/userService';
import { useCart } from '../context/CartContext';
import Loader from '../components/common/Loader';
import toast from 'react-hot-toast';
import { Helmet } from 'react-helmet-async';

const STATUS_BADGE = { pending:'badge-orange', confirmed:'badge-blue', processing:'badge-blue', shipped:'badge-blue', delivered:'badge-green', cancelled:'badge-red', refunded:'badge-gray' };
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
    <div className="page">
      <Helmet><title>My Profile — Boomcart</title></Helmet>
      
      {/* ── Duplicate className FIXED here ── */}
      <div className="container responsive-2col" style={{ display:'grid', gridTemplateColumns:'220px 1fr', gap:28, alignItems:'start' }}>

        {/* Sidebar */}
        <div className="card" style={{ padding:0, overflow:'hidden' }}>
          <div style={{ padding:'24px 20px', background:'var(--navy)', textAlign:'center' }}>
            <div style={{ width:64, height:64, borderRadius:'50%', background:'var(--gold)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 12px', fontSize:26, fontWeight:700, color:'var(--navy)' }}>
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <p style={{ color:'var(--white)', fontWeight:700, fontSize:15 }}>{user?.name}</p>
            <p style={{ color:'rgba(255,255,255,.5)', fontSize:12, marginTop:2 }}>{user?.email}</p>
            {user?.role === 'admin' && (
              <span style={{ display:'inline-flex', alignItems:'center', gap:4, marginTop:8, background:'rgba(232,197,71,.2)', color:'var(--gold)', fontSize:11, fontWeight:700, padding:'3px 10px', borderRadius:99, letterSpacing:'.5px' }}>
                <FiShield size={10}/> ADMIN
              </span>
            )}
          </div>
          {TABS.map(({ id, label, Icon }) => (
            <button key={id} onClick={() => setTab(id)}
              style={{ display:'flex', alignItems:'center', gap:10, width:'100%', padding:'13px 20px', background:tab===id?'var(--cream)':'transparent', color:tab===id?'var(--navy)':'var(--gray-500)', fontWeight:tab===id?700:400, fontSize:14, borderLeft:tab===id?'3px solid var(--navy)':'3px solid transparent', border:'none', cursor:'pointer', transition:'all .15s', textAlign:'left' }}>
              <Icon size={16}/> {label}
            </button>
          ))}
        </div>

        {/* Content panel */}
        <div>

          {/* ── Profile ── */}
          {tab === 'profile' && (
            <div className="card" style={{ padding:28 }}>
              <h2 style={{ fontFamily:'var(--font-serif)', fontSize:20, color:'var(--navy)', marginBottom:24 }}>Personal Information</h2>
              <form onSubmit={saveProfile} style={{ display:'flex', flexDirection:'column', gap:16, maxWidth:480 }}>
                {[{n:'name',l:'Full Name',t:'text'},{n:'email',l:'Email Address',t:'email'}].map(f => (
                  <div key={f.n} className="form-group">
                    <label>{f.l}</label>
                    <input type={f.t} className="form-input" value={profileForm[f.n]} onChange={e => setProfileForm({...profileForm,[f.n]:e.target.value})} />
                  </div>
                ))}
                <div className="form-group">
                  <label>Role</label>
                  <input className="form-input" value={user?.role} disabled style={{ background:'var(--gray-50)', color:'var(--gray-400)' }} />
                </div>
                <button className="btn btn-primary" type="submit" disabled={saving} style={{ alignSelf:'flex-start' }}>
                  {saving ? 'Saving…' : 'Save Changes'}
                </button>
              </form>
            </div>
          )}

          {/* ── Orders ── */}
          {tab === 'orders' && (
            <div className="card" style={{ padding:28 }}>
              <h2 style={{ fontFamily:'var(--font-serif)', fontSize:20, color:'var(--navy)', marginBottom:24 }}>My Orders</h2>
              {ordersLoading ? <Loader /> : orders.length === 0 ? (
                <div className="empty-state">
                  <FiPackage size={48} style={{ margin:'0 auto 16px', display:'block', opacity:.2 }} />
                  <h3>No orders yet</h3>
                  <Link to="/" className="btn btn-primary" style={{ marginTop:16 }}>Shop Now</Link>
                </div>
              ) : (
                <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                  {orders.map(o => (
                    <div key={o._id} style={{ border:'1px solid var(--gray-100)', borderRadius:'var(--radius-lg)', padding:'16px 20px' }}>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:10, marginBottom:12 }}>
                        <div>
                          <p style={{ fontSize:13, fontWeight:700, color:'var(--navy)' }}>#{o._id.slice(-8).toUpperCase()}</p>
                          <p style={{ fontSize:12, color:'var(--gray-400)' }}>{new Date(o.createdAt).toLocaleDateString('en-IN')}</p>
                        </div>
                        <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                          <span className={`badge ${STATUS_BADGE[o.orderStatus]||'badge-gray'}`}>{o.orderStatus.toUpperCase()}</span>
                          <Link to={`/order/${o._id}`} className="btn btn-outline btn-sm"><FiEye size={13}/> Track</Link>
                        </div>
                      </div>
                      <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:10 }}>
                        {o.orderItems.slice(0,4).map(item => (
                          <img key={item._id} src={item.image} alt={item.name} style={{ width:48, height:58, objectFit:'cover', borderRadius:6 }} />
                        ))}
                        {o.orderItems.length > 4 && <div style={{ width:48, height:58, borderRadius:6, background:'var(--gray-100)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:700, color:'var(--gray-500)' }}>+{o.orderItems.length-4}</div>}
                      </div>
                      <p style={{ fontWeight:700, color:'var(--navy)', fontSize:15 }}>Total: ₹{o.totalPrice?.toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── Addresses ── */}
          {tab === 'addresses' && (
            <div className="card" style={{ padding:28 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
                <h2 style={{ fontFamily:'var(--font-serif)', fontSize:20, color:'var(--navy)' }}>Saved Addresses</h2>
                <button className="btn btn-primary btn-sm" onClick={() => setShowAddrForm(!showAddrForm)}>
                  <FiPlus size={14}/> {showAddrForm ? 'Cancel' : 'Add New'}
                </button>
              </div>

              {showAddrForm && (
                <form onSubmit={saveAddress} style={{ background:'var(--cream)', borderRadius:'var(--radius-lg)', padding:20, marginBottom:24 }}>
                  <h4 style={{ color:'var(--navy)', marginBottom:16, fontWeight:700 }}>New Address</h4>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                    {[{n:'fullName',l:'Full Name',col:'1/-1'},{n:'phone',l:'Phone'},{n:'addressLine1',l:'Address Line 1',col:'1/-1'},{n:'addressLine2',l:'Address Line 2 (optional)',col:'1/-1'},{n:'city',l:'City'},{n:'pincode',l:'Pincode'}].map(f => (
                      <div key={f.n} className="form-group" style={{ gridColumn:f.col||'auto' }}>
                        <label style={{ fontSize:12 }}>{f.l}</label>
                        <input className="form-input" style={{ fontSize:13 }} value={addrForm[f.n]} onChange={e => setAddrForm({...addrForm,[f.n]:e.target.value})} required={f.n!=='addressLine2'} />
                      </div>
                    ))}
                    <div className="form-group">
                      <label style={{ fontSize:12 }}>State</label>
                      <select className="form-input" style={{ fontSize:13 }} value={addrForm.state} onChange={e => setAddrForm({...addrForm,state:e.target.value})} required>
                        <option value="">Select state</option>
                        {STATES.map(s => <option key={s}>{s}</option>)}
                      </select>
                    </div>
                    <div style={{ display:'flex', alignItems:'center', gap:8, gridColumn:'1/-1' }}>
                      <input type="checkbox" id="isDefault" checked={addrForm.isDefault} onChange={e => setAddrForm({...addrForm,isDefault:e.target.checked})} />
                      <label htmlFor="isDefault" style={{ fontSize:13 }}>Set as default address</label>
                    </div>
                  </div>
                  <button className="btn btn-primary btn-sm" type="submit" disabled={savingAddr} style={{ marginTop:12 }}>
                    {savingAddr ? 'Saving…' : 'Save Address'}
                  </button>
                </form>
              )}

              {addresses.length === 0 ? (
                <div className="empty-state" style={{ padding:'30px 0' }}>
                  <FiMapPin size={40} style={{ margin:'0 auto 12px', display:'block', opacity:.2 }} />
                  <p style={{ color:'var(--gray-400)' }}>No saved addresses yet.</p>
                </div>
              ) : (
                <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                  {addresses.map(a => (
                    <div key={a._id} style={{ border:'1px solid var(--gray-100)', borderRadius:'var(--radius-lg)', padding:'16px 20px', position:'relative' }}>
                      {a.isDefault && <span className="badge badge-navy" style={{ position:'absolute', top:12, right:52, fontSize:10 }}>Default</span>}
                      <button onClick={() => removeAddress(a._id)} style={{ position:'absolute', top:10, right:14, background:'none', border:'none', color:'var(--red)', cursor:'pointer', padding:4 }} title="Remove">
                        <FiTrash2 size={15}/>
                      </button>
                      <p style={{ fontWeight:700, color:'var(--navy)', fontSize:14 }}>{a.fullName}</p>
                      <p style={{ fontSize:13, color:'var(--gray-600)', lineHeight:1.7, marginTop:4 }}>
                        {a.addressLine1}{a.addressLine2?`, ${a.addressLine2}`:''}<br/>
                        {a.city}, {a.state} — {a.pincode}<br/>
                        📞 {a.phone}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── Wishlist ── */}
          {tab === 'wishlist' && (
            <div className="card" style={{ padding:28 }}>
              <h2 style={{ fontFamily:'var(--font-serif)', fontSize:20, color:'var(--navy)', marginBottom:24 }}>My Wishlist</h2>
              {wishLoading ? <Loader /> : wishItems.length === 0 ? (
                <div className="empty-state" style={{ padding:'30px 0' }}>
                  <FiHeart size={40} style={{ margin:'0 auto 12px', display:'block', opacity:.2 }} />
                  <p style={{ color:'var(--gray-400)' }}>Your wishlist is empty.</p>
                  <Link to="/" className="btn btn-primary btn-sm" style={{ marginTop:12 }}>Browse Products</Link>
                </div>
              ) : (
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))', gap:14 }}>
                  {wishItems.map(item => {
                    const price = item.discountPrice > 0 ? item.discountPrice : item.price;
                    return (
                      <div key={item._id} style={{ border:'1px solid var(--gray-100)', borderRadius:'var(--radius-lg)', overflow:'hidden', position:'relative' }}>
                        <button onClick={() => removeWish(item._id)} style={{ position:'absolute', top:6, right:6, zIndex:2, width:28, height:28, borderRadius:'50%', background:'rgba(255,255,255,.9)', border:'none', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:'var(--red)' }}>
                          <FiTrash2 size={13}/>
                        </button>
                        <Link to={`/product/${item._id}`}>
                          <img src={item.images[0]?.url} alt={item.name} style={{ width:'100%', aspectRatio:'3/4', objectFit:'cover' }} />
                        </Link>
                        <div style={{ padding:'10px 12px' }}>
                          <Link to={`/product/${item._id}`} style={{ fontSize:13, fontWeight:600, color:'var(--navy)', display:'block', marginBottom:6, lineHeight:1.3 }}>{item.name}</Link>
                          <p style={{ fontWeight:700, color:'var(--navy)', fontSize:14, marginBottom:8 }}>₹{price.toLocaleString()}</p>
                          <button className="btn btn-primary btn-block btn-sm" style={{ fontSize:12 }}
                            onClick={() => addToCart(item, 1, item.sizes?.[0]||'', item.colors?.[0]||'')}>
                            Add to Cart
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── Security ── */}
          {tab === 'security' && (
            <div className="card" style={{ padding:28 }}>
              <h2 style={{ fontFamily:'var(--font-serif)', fontSize:20, color:'var(--navy)', marginBottom:24 }}>Change Password</h2>
              <form onSubmit={savePassword} style={{ display:'flex', flexDirection:'column', gap:16, maxWidth:480 }}>
                {[{n:'currentPassword',l:'Current Password'},{n:'newPassword',l:'New Password'},{n:'confirm',l:'Confirm New Password'}].map(f => (
                  <div key={f.n} className="form-group">
                    <label>{f.l}</label>
                    <input type="password" className="form-input" value={pwForm[f.n]} onChange={e => setPwForm({...pwForm,[f.n]:e.target.value})} placeholder="••••••••" />
                  </div>
                ))}
                <button className="btn btn-primary" type="submit" disabled={saving} style={{ alignSelf:'flex-start' }}>
                  {saving ? 'Updating…' : 'Update Password'}
                </button>
              </form>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}