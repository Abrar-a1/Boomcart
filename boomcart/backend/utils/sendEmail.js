const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: Number(process.env.EMAIL_PORT) || 587,
  secure: false,
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

const sendEmail = async ({ to, subject, html }) => {
  await transporter.sendMail({ from: process.env.EMAIL_FROM, to, subject, html });
};

const orderConfirmationEmail = (order, user) => `
<!DOCTYPE html><html><head><meta charset="UTF-8">
<style>body{font-family:Arial,sans-serif;background:#f4f4f4;margin:0;padding:0}
.wrap{max-width:600px;margin:30px auto;background:#fff;border-radius:8px;overflow:hidden}
.hdr{background:#1a1a2e;padding:24px 32px}.hdr h1{color:#e8c547;margin:0;font-size:22px}
.body{padding:32px}.item{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #eee}
.tot{margin-top:16px;text-align:right}.tr{display:flex;justify-content:space-between;padding:5px 0;font-size:14px}
.grand{font-weight:bold;font-size:16px;color:#1a1a2e;border-top:2px solid #1a1a2e;padding-top:8px;margin-top:4px}
.ftr{background:#f9f9f9;padding:14px 32px;text-align:center;font-size:12px;color:#888}</style></head>
<body><div class="wrap">
<div class="hdr"><h1>🛍️ Order Confirmed — Boomcart!</h1></div>
<div class="body">
<p>Hi <strong>${user.name}</strong>, your order has been placed!</p>
<p style="color:#888;font-size:13px">Order #<strong>${order._id.toString().slice(-8).toUpperCase()}</strong></p>
<hr/>
${order.orderItems.map(i => `<div class="item"><span>${i.name} ×${i.quantity}${i.size?` (${i.size})`:''}</span><span>₹${(i.price*i.quantity).toLocaleString()}</span></div>`).join('')}
<div class="tot">
<div class="tr"><span>Subtotal</span><span>₹${order.itemsPrice.toLocaleString()}</span></div>
<div class="tr"><span>Shipping</span><span>${order.shippingPrice===0?'FREE':'₹'+order.shippingPrice}</span></div>
<div class="tr"><span>Tax (5%)</span><span>₹${order.taxPrice.toLocaleString()}</span></div>
<div class="tr grand"><span>Total</span><span>₹${order.totalPrice.toLocaleString()}</span></div>
</div>
<hr/>
<h3>Shipping to</h3>
<p style="font-size:14px;line-height:1.7;color:#444">
${order.shippingAddress.fullName}<br/>
${order.shippingAddress.addressLine1}${order.shippingAddress.addressLine2?', '+order.shippingAddress.addressLine2:''}<br/>
${order.shippingAddress.city}, ${order.shippingAddress.state} — ${order.shippingAddress.pincode}<br/>
📞 ${order.shippingAddress.phone}
</p>
<p style="font-size:14px;color:#555;margin-top:20px">Estimated delivery: <strong>5–7 business days</strong></p>
</div>
<div class="ftr">© ${new Date().getFullYear()} Boomcart. All rights reserved.</div>
</div></body></html>`;

module.exports = { sendEmail, orderConfirmationEmail };
