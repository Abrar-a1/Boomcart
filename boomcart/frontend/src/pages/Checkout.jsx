import { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { FiMapPin, FiCreditCard, FiCheck } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { createOrder } from '../services/orderService';
import { createRazorpayOrder, verifyPayment } from '../services/paymentService';
import toast from 'react-hot-toast';
import { Helmet } from 'react-helmet-async';

const STATES = ['Jammu & Kashmir','Delhi','Maharashtra','Karnataka','Tamil Nadu','Rajasthan','Uttar Pradesh','Gujarat','West Bengal','Punjab','Haryana','Kerala','Madhya Pradesh','Bihar','Assam','Himachal Pradesh','Other'];

export default function Checkout() {
  const { items, itemsPrice, shippingPrice, taxPrice, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [payMethod, setPayMethod] = useState('razorpay');
  const [idempotencyKey] = useState(() => {
    if (window.crypto && window.crypto.randomUUID) {
      return window.crypto.randomUUID();
    }
    throw new Error('Secure randomUUID generation is not supported in this browser context.');
  });
  
  useEffect(() => { if (items.length === 0) navigate('/cart'); }, [items.length, navigate]);

  const [addr, setAddr] = useState({
    fullName: user?.name || '', phone: '', addressLine1: '',
    addressLine2: '', city: '', state: '', pincode: '',
  });

  const handleAddr = e => setAddr({ ...addr, [e.target.name]: e.target.value });

  const validateAddr = () => {
    for (const f of ['fullName','phone','addressLine1','city','state','pincode']) {
      if (!addr[f].trim()) { toast.error(`Please fill: ${f}`); return false; }
    }
    if (!/^\d{10}$/.test(addr.phone)) { toast.error('Enter valid 10-digit phone'); return false; }
    if (!/^\d{6}$/.test(addr.pincode)) { toast.error('Enter valid 6-digit pincode'); return false; }
    return true;
  };

  const placeOrder = async () => {
    if (!validateAddr()) return;
    setLoading(true);
    const orderData = {
      orderItems: items.map(i => ({ product: i.product, name: i.name, image: i.image, price: i.price, quantity: i.quantity, size: i.size, color: i.color })),
      shippingAddress: addr, paymentMethod: payMethod,
      idempotencyKey,
    };

    try {
      if (payMethod === 'cod') {
        const { data } = await createOrder(orderData);
        clearCart();
        navigate(`/order-success/${data.data._id}`);
        return;
      }

      const { data: dbData } = await createOrder(orderData);
      const dbOrder = dbData.data;
      
      if (dbData.message === 'Order already processed' && dbOrder.isPaid) {
        clearCart();
        navigate(`/order-success/${dbOrder._id}`);
        return;
      }

      const { data: rpData } = await createRazorpayOrder({ orderId: dbOrder._id });
      const rpOrder = rpData.data;

      await new Promise((resolve, reject) => {
        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID,
          amount: rpOrder.amount, currency: rpOrder.currency,
          name: 'Boomcart', description: 'Fashion Purchase',
          order_id: rpOrder.id,
          handler: async (response) => {
            try {
              await verifyPayment({
                razorpay_order_id:   response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature:  response.razorpay_signature,
                orderId: dbOrder._id,
              });
              resolve();
            } catch { reject(new Error('Payment verification failed')); }
          },
          prefill: { name: user?.name, email: user?.email, contact: addr.phone },
          theme: { color: '#1E3A3A' },
          modal: { ondismiss: () => reject(new Error('Payment cancelled')) },
        };
        const rzp = new window.Razorpay(options);
        rzp.open();
      });

      clearCart();
      navigate(`/order-success/${dbOrder._id}`);
    } catch (err) {
      toast.error(err.message || 'Order failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="w-full min-h-screen bg-[var(--color-background)] py-12 lg:py-20">
      <Helmet><title>Secure Checkout — Boomcart</title></Helmet>
      
      <div className="max-w-[1100px] mx-auto px-6 lg:px-12 animate-smooth-reveal">
        <h1 className="font-heading text-4xl lg:text-5xl font-bold text-[var(--color-primary)] mb-12">Checkout</h1>

        {/* ── STEP INDICATOR ── */}
        <div className="flex items-center mb-16 max-w-[600px]">
          {[{n:1,l:'Delivery'},{n:2,l:'Payment'}].map((s, idx) => (
            <div key={s.n} className="flex items-center flex-1">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-body text-xs font-bold transition-colors ${
                  step > s.n ? 'bg-[var(--color-primary)] text-white' : step === s.n ? 'bg-[var(--color-cta)] text-white' : 'bg-white border border-[var(--color-border-main)] text-[var(--color-text-muted)]'
                }`}>
                  {step > s.n ? <FiCheck size={14}/> : s.n}
                </div>
                <span className={`font-body text-xs font-bold uppercase tracking-widest ${
                  step >= s.n ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-muted)]'
                }`}>{s.l}</span>
              </div>
              {idx === 0 && <div className={`flex-1 h-[1px] mx-6 transition-colors ${step > 1 ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-border-main)]'}`} />}
            </div>
          ))}
        </div>

        <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 items-start">
          
          {/* ── LEFT FORMS ── */}
          <div className="w-full lg:w-[60%] flex flex-col gap-8">
            
            {step === 1 && (
              <div className="bg-transparent border border-[var(--color-border-main)] rounded-sm p-8 bg-white">
                <h3 className="font-heading text-2xl font-bold text-[var(--color-primary)] mb-8">Shipping Address</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[{n:'fullName',l:'Full Name',p:'John Doe',col:'md:col-span-2'},
                    {n:'phone',l:'Phone Number',p:'10-digit mobile'},
                    {n:'pincode',l:'Pincode',p:'6-digit'},
                    {n:'addressLine1',l:'Address Line 1',p:'House no, Street',col:'md:col-span-2'},
                    {n:'addressLine2',l:'Address Line 2 (optional)',p:'Landmark, Area',col:'md:col-span-2'},
                    {n:'city',l:'City'}].map(f => (
                    <div key={f.n} className={`flex flex-col gap-2 ${f.col || ''}`}>
                      <label className="font-body text-xs font-bold uppercase tracking-widest text-[var(--color-text-muted)]">{f.l}</label>
                      <input 
                        name={f.n} 
                        value={addr[f.n]} 
                        onChange={handleAddr} 
                        placeholder={f.p || ''} 
                        className="w-full px-4 py-3 bg-white border border-[var(--color-border-main)] rounded-sm font-body text-sm text-[var(--color-text)] transition-colors focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)]"
                      />
                    </div>
                  ))}
                  <div className="flex flex-col gap-2">
                    <label className="font-body text-xs font-bold uppercase tracking-widest text-[var(--color-text-muted)]">State</label>
                    <select 
                      name="state" 
                      value={addr.state} 
                      onChange={handleAddr}
                      className="w-full px-4 py-3 bg-white border border-[var(--color-border-main)] rounded-sm font-body text-sm text-[var(--color-text)] transition-colors focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)]"
                    >
                      <option value="">Select state</option>
                      {STATES.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                </div>

                <button 
                  onClick={() => { if (validateAddr()) setStep(2); }}
                  className="mt-10 w-full md:w-auto px-10 py-4 bg-[var(--color-primary)] text-white font-body text-sm font-bold uppercase tracking-widest rounded-sm transition-all hover:bg-black focus-visible:outline"
                >
                  Continue to Payment
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="bg-transparent border border-[var(--color-border-main)] rounded-sm p-8 bg-white animate-smooth-reveal">
                <h3 className="font-heading text-2xl font-bold text-[var(--color-primary)] mb-8">Payment Method</h3>
                
                <div className="flex flex-col gap-4">
                  {[{v:'razorpay',l:'Pay Online',sub:'Credit/Debit Card, UPI, Net Banking'},{v:'cod',l:'Cash on Delivery',sub:'Pay when your order arrives'}].map(opt => (
                    <label 
                      key={opt.v} 
                      className={`flex items-start gap-4 p-5 border rounded-sm cursor-pointer transition-all ${
                        payMethod === opt.v ? 'border-[var(--color-primary)] bg-[var(--color-background)]' : 'border-[var(--color-border-main)] bg-white hover:border-[var(--color-primary)]/50'
                      }`}
                    >
                      <input 
                        type="radio" 
                        name="pay" 
                        value={opt.v} 
                        checked={payMethod === opt.v} 
                        onChange={() => setPayMethod(opt.v)} 
                        className="mt-1 w-4 h-4 text-[var(--color-primary)] focus:ring-[var(--color-primary)]" 
                      />
                      <div>
                        <p className="font-heading text-lg font-bold text-[var(--color-primary)] leading-none mb-1.5">{opt.l}</p>
                        <p className="font-body text-xs text-[var(--color-text-muted)]">{opt.sub}</p>
                      </div>
                    </label>
                  ))}
                </div>

                <div className="flex gap-4 mt-10">
                  <button 
                    onClick={() => setStep(1)}
                    className="px-6 py-4 bg-transparent text-[var(--color-text-muted)] font-body text-sm font-bold uppercase tracking-widest hover:text-[var(--color-primary)] transition-colors focus-visible:outline"
                  >
                    Back
                  </button>
                  <button 
                    onClick={placeOrder} 
                    disabled={loading}
                    className="flex-1 py-4 bg-[var(--color-cta)] text-white font-body text-sm font-bold uppercase tracking-widest rounded-sm transition-all hover:opacity-90 shadow-[0_4px_14px_rgba(194,90,60,0.3)] disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline"
                  >
                    {loading ? 'Processing...' : payMethod === 'cod' ? 'Confirm Order' : 'Pay Securely'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ── RIGHT ORDER SUMMARY ── */}
          <div className="w-full lg:w-[40%] lg:sticky lg:top-28">
            <div className="bg-white border border-[var(--color-border-main)] rounded-sm p-8 shadow-sm">
              <h4 className="font-heading text-2xl font-bold text-[var(--color-primary)] border-b border-[var(--color-border-light)] pb-4 mb-6">
                Your Order
              </h4>
              
              <div className="flex flex-col gap-6 mb-8 max-h-[300px] overflow-y-auto pr-2">
                {items.map(i => (
                  <div key={i._key} className="flex gap-4 items-center">
                    <div className="w-16 h-20 bg-[var(--color-border-light)] rounded-sm overflow-hidden flex-shrink-0">
                      <img src={i.image} alt={i.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <p className="font-heading text-sm font-bold text-[var(--color-primary)] leading-tight mb-1">{i.name}</p>
                      {i.size && <p className="font-body text-[10px] font-bold uppercase tracking-widest text-[var(--color-text-muted)] mb-1">Size: {i.size}</p>}
                      <p className="font-body text-xs font-bold text-[var(--color-text)]">₹{(i.price).toLocaleString()} <span className="font-normal text-[var(--color-text-muted)] ml-1">× {i.quantity}</span></p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="border-t border-[var(--color-border-light)] pt-6 flex flex-col gap-3">
                <div className="flex justify-between font-body text-sm text-[var(--color-text-muted)]">
                  <span>Subtotal</span><span>₹{itemsPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-body text-sm text-[var(--color-text-muted)]">
                  <span>Delivery</span><span className="font-bold text-[var(--color-accent-dark)] uppercase text-[10px] tracking-widest mt-0.5">{shippingPrice === 0 ? 'Complimentary' : `₹${shippingPrice}`}</span>
                </div>
                {taxPrice > 0 && (
                  <div className="flex justify-between font-body text-sm text-[var(--color-text-muted)]">
                    <span>Tax</span><span>₹{taxPrice}</span>
                  </div>
                )}
              </div>
              
              <div className="border-t border-[var(--color-border-main)] pt-6 mt-6 flex justify-between items-end">
                <span className="font-heading text-xl font-bold text-[var(--color-primary)]">Total</span>
                <span className="font-body text-2xl font-bold text-[var(--color-cta)]">₹{totalPrice.toLocaleString()}</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
