import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { addAddress } from '../services/userService';
import toast from 'react-hot-toast';
import { Helmet } from 'react-helmet-async';
import PageContainer from '../components/common/PageContainer';
import Input from '../components/common/Input';
import Select from '../components/common/Select';
import Button from '../components/common/Button';

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
    <div className="w-full min-h-screen bg-background py-12 lg:py-20 flex items-center justify-center">
      <Helmet><title>Complete Your Profile — Boomcart</title></Helmet>
      
      <PageContainer variant="functional" className="max-w-2xl w-full">
        <div className="bg-white border border-border rounded-sm p-8 lg:p-12 shadow-sm animate-fade-in">
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-primary mb-2 text-center">
            Welcome, {user?.name?.split(' ')[0]}!
          </h1>
          <p className="font-body text-sm text-text-muted mb-10 text-center max-w-md mx-auto leading-relaxed">
            Before you start shopping, please provide your contact details and default shipping address.
          </p>
          
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input 
              label="Full Name"
              name="fullName"
              value={addrForm.fullName}
              onChange={e => setAddrForm({...addrForm, fullName: e.target.value})}
              required
              className="md:col-span-2"
            />
            <Input 
              label="Phone Number"
              name="phone"
              value={addrForm.phone}
              onChange={e => setAddrForm({...addrForm, phone: e.target.value})}
              required
              className="md:col-span-2"
            />
            <Input 
              label="Address Line 1"
              name="addressLine1"
              value={addrForm.addressLine1}
              onChange={e => setAddrForm({...addrForm, addressLine1: e.target.value})}
              required
              className="md:col-span-2"
            />
            <Input 
              label="Address Line 2 (optional)"
              name="addressLine2"
              value={addrForm.addressLine2}
              onChange={e => setAddrForm({...addrForm, addressLine2: e.target.value})}
              className="md:col-span-2"
            />
            <Input 
              label="City"
              name="city"
              value={addrForm.city}
              onChange={e => setAddrForm({...addrForm, city: e.target.value})}
              required
            />
            <Input 
              label="Pincode"
              name="pincode"
              value={addrForm.pincode}
              onChange={e => setAddrForm({...addrForm, pincode: e.target.value})}
              required
            />
            <Select
              label="State"
              value={addrForm.state}
              onChange={e => setAddrForm({...addrForm, state: e.target.value})}
              required
              className="md:col-span-2"
            >
              <option value="">Select state</option>
              {STATES.map(s => <option key={s}>{s}</option>)}
            </Select>
            
            <Button 
              variant="primary" 
              type="submit" 
              disabled={loading} 
              className="md:col-span-2 mt-4 font-bold uppercase tracking-widest py-4"
            >
              {loading ? 'Saving...' : 'Complete Profile & Start Shopping'}
            </Button>
          </form>
        </div>
      </PageContainer>
    </div>
  );
}
