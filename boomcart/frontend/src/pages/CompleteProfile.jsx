import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { addAddress } from '../services/userService';
import toast from 'react-hot-toast';
import { Helmet } from 'react-helmet-async';

const STATES = ['Jammu & Kashmir','Delhi','Maharashtra','Karnataka','Tamil Nadu','Rajasthan','Uttar Pradesh','Gujarat','West Bengal','Punjab','Haryana','Kerala','Madhya Pradesh','Bihar','Assam','Himachal Pradesh','Other'];

export default function CompleteProfile() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [addrForm, setAddrForm] = useState({ 
    fullName: user?.name || '', 
    phone: '', 
    addressLine1: '', 
    addressLine2: '', 
    city: '', 
    state: '', 
    pincode: '', 
    isDefault: true 
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!/^\d{10}$/.test(addrForm.phone)) { toast.error('Enter valid 10-digit phone'); return; }
    if (!/^\d{6}$/.test(addrForm.pincode)) { toast.error('Enter valid 6-digit pincode'); return; }
    
    setLoading(true);
    try {
      const { data } = await addAddress(addrForm);
      updateUser({ addresses: data.data, profileCompleted: data.profileCompleted });
      toast.success('Profile completed successfully!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to complete profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Helmet><title>Complete Your Profile — Boomcart</title></Helmet>
      
      <div className="card" style={{ maxWidth: 500, width: '100%', padding: '40px 32px' }}>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 26, color: 'var(--navy)', marginBottom: 8, textAlign: 'center' }}>
          Welcome, {user?.name?.split(' ')[0]}!
        </h1>
        <p style={{ color: 'var(--gray-500)', fontSize: 15, marginBottom: 28, textAlign: 'center', lineHeight: 1.5 }}>
          Before you start shopping, please provide your contact details and default shipping address.
        </p>
        
        <form onSubmit={handleSubmit} style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
          {[{n:'fullName',l:'Full Name',col:'1/-1'},
            {n:'phone',l:'Phone Number',col:'1/-1'},
            {n:'addressLine1',l:'Address Line 1',col:'1/-1'},
            {n:'addressLine2',l:'Address Line 2 (optional)',col:'1/-1'},
            {n:'city',l:'City'},
            {n:'pincode',l:'Pincode'}
          ].map(f => (
            <div key={f.n} className="form-group" style={{ gridColumn:f.col||'auto' }}>
              <label style={{ fontSize:13 }}>{f.l}</label>
              <input 
                className="form-input" 
                value={addrForm[f.n]} 
                onChange={e => setAddrForm({...addrForm, [f.n]: e.target.value})} 
                required={f.n !== 'addressLine2'} 
              />
            </div>
          ))}
          <div className="form-group">
            <label style={{ fontSize:13 }}>State</label>
            <select className="form-input" value={addrForm.state} onChange={e => setAddrForm({...addrForm, state: e.target.value})} required>
              <option value="">Select state</option>
              {STATES.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          
          <button className="btn btn-primary btn-block btn-lg" type="submit" disabled={loading} style={{ gridColumn: '1/-1', marginTop: 16 }}>
            {loading ? 'Saving...' : 'Complete Profile & Start Shopping'}
          </button>
        </form>
      </div>
    </div>
  );
}
