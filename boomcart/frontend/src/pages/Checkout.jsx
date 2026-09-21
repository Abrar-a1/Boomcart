import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiCheck } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { createOrder } from '../services/orderService';
import { createRazorpayOrder, verifyPayment } from '../services/paymentService';
import { addAddress } from '../services/userService';
import toast from 'react-hot-toast';
import { Helmet } from 'react-helmet-async';
import PageContainer from '../components/common/PageContainer';
import Input from '../components/common/Input';

const STATES = ['Jammu & Kashmir','Delhi','Maharashtra','Karnataka','Tamil Nadu','Rajasthan','Uttar Pradesh','Gujarat','West Bengal','Punjab','Haryana','Kerala','Madhya Pradesh','Bihar','Assam','Himachal Pradesh','Other'];

export default function Checkout() {
  const location = useLocation();
  const buyNowItem = location.state?.buyNowItem;
  const { items: cartItems, itemsPrice: cartItemsPrice, shippingPrice: cartShipping, taxPrice: cartTax, totalPrice: cartTotal, clearCart } = useCart();
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  // If Buy Now item exists, use it instead of cart
  const items = buyNowItem ? [buyNowItem] : cartItems;
  const itemsPrice = buyNowItem ? buyNowItem.price * buyNowItem.quantity : cartItemsPrice;
  const shippingPrice = buyNowItem ? (itemsPrice > 999 ? 0 : 99) : cartShipping;
  const taxPrice = buyNowItem ? Math.round(itemsPrice * 0.05) : cartTax;
  const totalPrice = buyNowItem ? (itemsPrice + shippingPrice + taxPrice) : cartTotal;


  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [payMethod, setPayMethod] = useState('razorpay');
  const [idempotencyKey] = useState(() => {
    if (window.crypto && window.crypto.randomUUID) {
      return window.crypto.randomUUID();
    }
    throw new Error('Secure randomUUID generation is not supported in this browser context.');
  });

  useEffect(() => { if (items.length === 0) navigate('/cart', { replace: true }); }, [items.length, navigate]);

  const [addr, setAddr] = useState({
    fullName: user?.name || '', phone: '', addressLine1: '',
    addressLine2: '', city: '', state: '', pincode: '',
  });
  const [saveAddress, setSaveAddress] = useState(false);

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

    try {
      if (saveAddress && user) {
        try {
          const { data } = await addAddress({ ...addr, isDefault: true });
          updateUser({ addresses: data.data, profileCompleted: data.profileCompleted });
        } catch (err) {
          console.error("Failed to save address to profile:", err);
        }
      }

      const orderData = {
        orderItems: items.map(i => ({ product: i.product, name: i.name, image: i.image || '/images/product-placeholder.svg', price: i.price, quantity: i.quantity, size: i.size, color: i.color })),
        shippingAddress: addr, paymentMethod: payMethod,
        idempotencyKey,
      };

      if (payMethod === 'cod') {
        const { data } = await createOrder(orderData);
        if (!buyNowItem) clearCart();
        navigate(`/order-success/${data.data._id}`);
        return;
      }

      const { data: dbData } = await createOrder(orderData);
      const dbOrder = dbData.data;

      if (dbData.message === 'Order already processed' && dbOrder.isPaid) {
        if (!buyNowItem) clearCart();
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

      if (!buyNowItem) clearCart();
      navigate(`/order-success/${dbOrder._id}`);
    } catch (err) {
      let errorMsg = 'Something went wrong. Please try again.';
      if (err.message === 'Network Error') {
        errorMsg = 'Unable to connect to the server. Please check your connection and try again.';
      } else if (err.response?.status === 400) {
        errorMsg = err.response.data?.message || 'Please check your checkout details.';
      } else if (err.response?.data?.message) {
        errorMsg = err.response.data.message;
      }
      toast.error(errorMsg);
    } finally { setLoading(false); }
  };

  return (
    <div className="w-full min-h-screen bg-background pt-12 pb-24">
      <Helmet><title>Secure Checkout | Boomcart</title></Helmet>
      <PageContainer variant="functional" className="animate-smooth-reveal">
        <h1 className="font-heading text-4xl lg:text-5xl font-bold text-primary mb-12">Checkout</h1>

        {/* ── STEP INDICATOR ── */}
        <div className="flex items-center mb-16 max-w-[600px]">
          {[{n:1,l:'Delivery'},{n:2,l:'Payment'}].map((s, idx) => (
            <div key={s.n} className="flex items-center flex-1">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-body text-xs font-bold transition-colors ${
                  step > s.n ? 'bg-primary text-white' : step === s.n ? 'bg-cta text-white' : 'bg-white border border-border text-text-muted'
                }`}>
                  {step > s.n ? <FiCheck size={14}/> : s.n}
                </div>
                <span className={`font-body text-xs font-bold uppercase tracking-widest ${
                  step >= s.n ? 'text-primary' : 'text-text-muted'
                }`}>{s.l}</span>
              </div>
              {idx === 0 && <div className={`flex-1 h-[1px] mx-6 transition-colors ${step > 1 ? 'bg-primary' : 'bg-border-light'}`} />}
            </div>
          ))}
        </div>

        <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 items-start">

          {/* ── LEFT FORMS ── */}
          <div className="w-full lg:w-[60%] flex flex-col gap-8 order-last lg:order-first">

            {step === 1 && (
              <div className="bg-transparent border border-border rounded-sm p-8 bg-white">
                <h3 className="font-heading text-2xl font-bold text-primary mb-8">Shipping Address</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Full Name"
                    name="fullName"
                    value={addr.fullName}
                    onChange={handleAddr}
                    placeholder="John Doe"
                    required
                    className="md:col-span-2"
                  />
                  <Input
                    label="Phone Number"
                    name="phone"
                    value={addr.phone}
                    onChange={handleAddr}
                    placeholder="10-digit mobile"
                    required
                  />
                  <Input
                    label="Pincode"
                    name="pincode"
                    value={addr.pincode}
                    onChange={handleAddr}
                    placeholder="6-digit"
                    required
                  />
                  <Input
                    label="Address Line 1"
                    name="addressLine1"
                    value={addr.addressLine1}
                    onChange={handleAddr}
                    placeholder="House no, Street"
                    required
                    className="md:col-span-2"
                  />
                  <Input
                    label="Address Line 2 (optional)"
                    name="addressLine2"
                    value={addr.addressLine2}
                    onChange={handleAddr}
                    placeholder="Landmark, Area"
                    className="md:col-span-2"
                  />
                  <Input
                    label="City"
                    name="city"
                    value={addr.city}
                    onChange={handleAddr}
                    required
                  />

                  <div className="flex flex-col gap-1 w-full">
                    <label className="font-body text-xs font-bold uppercase tracking-widest text-text">State *</label>
                    <select
                      name="state"
                      value={addr.state}
                      onChange={handleAddr}
                      className="w-full px-4 py-3 min-h-[48px] bg-white border border-border rounded-sm font-body text-sm text-text transition-colors focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                      required
                    >
                      <option value="">Select state</option>
                      {STATES.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                </div>

                {user && (
                  <label className="mt-6 flex items-center gap-3 cursor-pointer group w-max">
                    <div className={`w-5 h-5 flex items-center justify-center border rounded-sm transition-colors ${saveAddress ? 'bg-primary border-primary text-white' : 'border-border bg-transparent group-hover:border-primary'}`}>
                      {saveAddress && <FiCheck size={14} />}
                    </div>
                    <input type="checkbox" className="hidden" checked={saveAddress} onChange={e => setSaveAddress(e.target.checked)} />
                    <span className="font-body text-sm text-text-muted group-hover:text-text transition-colors">Save this address as my default</span>
                  </label>
                )}

                <button
                  onClick={() => { if (validateAddr()) setStep(2); }}
                  className="mt-10 w-full md:w-auto px-10 py-4 bg-primary text-white font-body text-sm font-bold uppercase tracking-widest rounded-sm transition-all hover:bg-black focus-visible:outline"
                >
                  Continue to Payment
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="bg-transparent border border-border rounded-sm p-8 bg-white animate-smooth-reveal">
                <h3 className="font-heading text-2xl font-bold text-primary mb-8">Payment Method</h3>

                <div className="flex flex-col gap-4">
                  {[{v:'razorpay',l:'Pay Online',sub:'Credit/Debit Card, UPI, Net Banking'},{v:'cod',l:'Cash on Delivery',sub:'Pay when your order arrives'}].map(opt => (
                    <label
                      key={opt.v}
                      className={`flex items-start gap-4 p-5 border rounded-sm cursor-pointer transition-all ${
                        payMethod === opt.v ? 'border-primary bg-background' : 'border-border bg-white hover:border-primary/50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="pay"
                        value={opt.v}
                        checked={payMethod === opt.v}
                        onChange={() => setPayMethod(opt.v)}
                        className="mt-1 w-4 h-4 text-primary focus:ring-primary"
                      />
                      <div>
                        <p className="font-heading text-lg font-bold text-primary leading-none mb-1.5">{opt.l}</p>
                        <p className="font-body text-xs text-text-muted">{opt.sub}</p>
                      </div>
                    </label>
                  ))}
                </div>

                <div className="flex gap-4 mt-10">
                  <button
                    onClick={() => setStep(1)}
                    className="px-6 py-4 bg-transparent text-text-muted font-body text-sm font-bold uppercase tracking-widest hover:text-primary transition-colors focus-visible:outline"
                  >
                    Back
                  </button>
                  <button
                    onClick={placeOrder}
                    disabled={loading}
                    className="flex-1 py-4 bg-cta text-white font-body text-sm font-bold uppercase tracking-widest rounded-sm transition-all hover:opacity-90 shadow-[0_4px_14px_rgba(194,90,60,0.3)] disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline"
                  >
                    {loading ? 'Processing...' : payMethod === 'cod' ? 'Confirm Order' : 'Pay Securely'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ── RIGHT ORDER SUMMARY (Always on top for mobile) ── */}
          <div className="w-full lg:w-[40%] lg:sticky lg:top-28 order-first lg:order-last mb-2 lg:mb-0">
            <div className="bg-white border border-border rounded-sm p-8 shadow-sm">
              <h4 className="font-heading text-2xl font-bold text-primary border-b border-border-light pb-4 mb-6">
                Your Order
              </h4>

              <div className="flex flex-col gap-6 mb-8 max-h-[300px] overflow-y-auto pr-2">
                {items.map(i => (
                  <div key={i._key} className="flex gap-4 items-center">
                    <div className="w-16 h-20 bg-border-light rounded-sm overflow-hidden flex-shrink-0">
                      <img 
                        src={i.image} 
                        alt={i.name} 
                        className="w-full h-full object-cover" 
                        onError={(e) => { e.target.onerror = null; e.target.src = '/images/product-placeholder.svg'; }}
                      />
                    </div>
                    <div className="flex-1">
                      <p className="font-heading text-sm font-bold text-primary leading-tight mb-1">{i.name}</p>
                      {i.size && <p className="font-body text-xs font-bold uppercase tracking-widest text-text-muted mb-1">Size: {i.size}</p>}
                      <p className="font-body text-xs font-bold text-text">₹{(i.price).toLocaleString()} <span className="font-normal text-text-muted ml-1">× {i.quantity}</span></p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-border-light pt-6 flex flex-col gap-3">
                <div className="flex justify-between font-body text-sm text-text-muted">
                  <span>Subtotal</span><span>₹{itemsPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-body text-sm text-text-muted">
                  <span>Delivery</span><span className="font-bold text-accent-dark uppercase text-xs tracking-widest mt-0.5">{shippingPrice === 0 ? 'Complimentary' : `₹${shippingPrice}`}</span>
                </div>
                {taxPrice > 0 && (
                  <div className="flex justify-between font-body text-sm text-text-muted">
                    <span>Tax</span><span>₹{taxPrice}</span>
                  </div>
                )}
              </div>

              <div className="border-t border-border-light pt-6 mt-6 flex justify-between items-end">
                <span className="font-heading text-xl font-bold text-primary">Total</span>
                <span className="font-body text-2xl font-bold text-cta">₹{totalPrice.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </PageContainer>
    </div>
  );
}
