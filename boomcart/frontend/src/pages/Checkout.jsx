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

  const [step, setStep]     = useState(1);
  const [loading, setLoading] = useState(false);
  const [payMethod, setPayMethod] = useState('razorpay');
  // Redirect to cart if it becomes empty mid-checkout
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
      itemsPrice, shippingPrice, taxPrice, totalPrice,
    };

    try {
      if (payMethod === 'cod') {
        const { data } = await createOrder(orderData);
        clearCart();
        navigate(`/order-success/${data.data._id}`);
        return;
      }

      // Razorpay flow
      const { data: dbData } = await createOrder(orderData);
      const dbOrder = dbData.data;
      const { data: rpData } = await createRazorpayOrder({ amount: totalPrice, orderId: dbOrder._id });
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
          prefill: { name: user.name, email: user.email, contact: addr.phone },
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
    <div className="page">
      <Helmet><title>Checkout — Boomcart</title></Helmet>
      <div className="container" style={{ maxWidth: 860 }}>
        <h1 className="section-title" style={{ marginBottom: 28 }}>Checkout</h1>

        {/* Step indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 36 }}>
          {[{n:1,l:'Delivery Address',icon:FiMapPin},{n:2,l:'Payment',icon:FiCreditCard}].map((s, idx) => (
            <div key={s.n} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14,
                  background: step > s.n ? 'var(--green)' : step === s.n ? 'var(--primary)' : 'var(--gray-100)',
                  color: step >= s.n ? 'var(--white)' : 'var(--text-light)' }}>
                  {step > s.n ? <FiCheck size={16}/> : s.n}
                </div>
                <span style={{ fontSize: 14, fontWeight: 600, color: step >= s.n ? 'var(--primary)' : 'var(--text-light)' }}>{s.l}</span>
              </div>
              {idx === 0 && <div style={{ flex: 1, height: 2, background: step > 1 ? 'var(--primary)' : 'var(--border)', margin: '0 12px' }} />}
            </div>
          ))}
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 320px', gap: 24, alignItems: 'start' }}>
          <div>
            {/* Step 1: Address */}
            {step === 1 && (
              <div className="card" style={{ padding: 28 }}>
                <h3 style={{ marginBottom: 20, fontFamily: 'var(--font-serif)', fontSize: 20, color: 'var(--primary)' }}>Delivery Address</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  {[{n:'fullName',l:'Full Name',p:'John Doe',col:'1/-1'},{n:'phone',l:'Phone Number',p:'10-digit mobile'},{n:'addressLine1',l:'Address Line 1',p:'House no, Street',col:'1/-1'},{n:'addressLine2',l:'Address Line 2 (optional)',p:'Landmark, Area',col:'1/-1'},{n:'city',l:'City'},{n:'pincode',l:'Pincode',p:'6-digit'}].map(f => (
                    <div key={f.n} className="form-group" style={{ gridColumn: f.col || 'auto' }}>
                      <label>{f.l}</label>
                      <input name={f.n} className="form-input" value={addr[f.n]} onChange={handleAddr} placeholder={f.p || ''} />
                    </div>
                  ))}
                  <div className="form-group">
                    <label>State</label>
                    <select name="state" className="form-input" value={addr.state} onChange={handleAddr}>
                      <option value="">Select state</option>
                      {STATES.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                <button className="btn btn-primary btn-lg" style={{ marginTop: 22 }} onClick={() => { if (validateAddr()) setStep(2); }}>
                  Continue to Payment →
                </button>
              </div>
            )}

            {/* Step 2: Payment */}
            {step === 2 && (
              <div className="card" style={{ padding: 28 }}>
                <h3 style={{ marginBottom: 20, fontFamily: 'var(--font-serif)', fontSize: 20, color: 'var(--primary)' }}>Payment Method</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {[{v:'razorpay',l:'Pay Online (Razorpay)',sub:'Credit/Debit Card, UPI, Net Banking'},{v:'cod',l:'Cash on Delivery',sub:'Pay when your order arrives'}].map(opt => (
                    <label key={opt.v} style={{ display: 'flex', alignItems: 'flex-start', gap: 14, padding: '16px 18px', border: `2px solid ${payMethod===opt.v?'var(--primary)':'var(--border)'}`, borderRadius: 'var(--radius-lg)', cursor: 'pointer', background: payMethod===opt.v?'var(--cream)':'var(--white)', transition: 'all .15s' }}>
                      <input type="radio" name="pay" value={opt.v} checked={payMethod===opt.v} onChange={() => setPayMethod(opt.v)} style={{ marginTop: 3 }} />
                      <div>
                        <p style={{ fontWeight: 700, color: 'var(--primary)', fontSize: 15 }}>{opt.l}</p>
                        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>{opt.sub}</p>
                      </div>
                    </label>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
                  <button className="btn btn-outline" onClick={() => setStep(1)}>← Back</button>
                  <button className="btn btn-primary btn-lg" style={{ flex: 1 }} onClick={placeOrder} disabled={loading}>
                    {loading ? 'Processing…' : payMethod === 'cod' ? 'Place Order' : 'Pay Now'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Order summary */}
          <div className="card" style={{ padding: 22, position: 'sticky', top: 100 }}>
            <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: 18, color: 'var(--primary)', marginBottom: 16 }}>Your Order</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
              {items.map(i => (
                <div key={i._key} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <img src={i.image} alt={i.name} style={{ width: 44, height: 54, objectFit: 'cover', borderRadius: 6, flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', lineHeight: 1.3 }}>{i.name}</p>
                    {i.size && <p style={{ fontSize: 11, color: 'var(--text-light)' }}>Size: {i.size}</p>}
                    <p style={{ fontSize: 12, color: 'var(--primary)', fontWeight: 700 }}>₹{(i.price*i.quantity).toLocaleString()} ×{i.quantity}</p>
                  </div>
                </div>
              ))}
            </div>
            <hr className="divider" />
            {[['Subtotal', `₹${itemsPrice.toLocaleString()}`],['Shipping', shippingPrice===0?'FREE':`₹${shippingPrice}`],['Tax','₹'+taxPrice]].map(([l,v]) => (
              <div key={l} style={{ display:'flex', justifyContent:'space-between', fontSize:13, color:'var(--text-muted)', marginBottom:8 }}>
                <span>{l}</span><span style={{ color: v==='FREE'?'var(--green)':undefined }}>{v}</span>
              </div>
            ))}
            <div style={{ display:'flex', justifyContent:'space-between', fontWeight:700, fontSize:17, color:'var(--primary)', borderTop:'2px solid var(--primary)', paddingTop:10, marginTop:4 }}>
              <span>Total</span><span>₹{totalPrice.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
