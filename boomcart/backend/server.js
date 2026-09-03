const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const dns = require('dns');

// Use Google DNS to resolve MongoDB Atlas hostnames (fixes router DNS issues)
dns.setServers(['8.8.8.8', '8.8.4.4']);

dotenv.config();

const connectDB = require('./config/db');
const { errorHandler, notFound } = require('./middleware/errorMiddleware');
const { scheduleCloudinaryCleanup } = require('./config/cloudinary');

const authRoutes    = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes   = require('./routes/orderRoutes');
const userRoutes    = require('./routes/userRoutes');
const reviewRoutes  = require('./routes/reviewRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');

connectDB();
scheduleCloudinaryCleanup(); // Auto-delete expired media daily

const app = express();

app.use(helmet());
// Support multiple comma-separated origins (e.g. "http://localhost:5173,https://boomcart.vercel.app")
const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173').split(',').map(s => s.trim());
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) cb(null, true);
    else cb(new Error('Blocked by CORS'));
  },
  credentials: true,
}));
// Webhook needs raw body for signature verification — must come BEFORE express.json()
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200 });
// Strict rate limit only on login/register to deter credential stuffing (max 30 requests per 15 minutes per IP)
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 30, message: 'Too many attempts, try again after 15 minutes' });
// Transaction limit for orders/payments to prevent abuse/spam
const transactionLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20, message: 'Too many transactions, please try again later' });
app.use('/api/', limiter);

app.get('/api/health', (req, res) => res.json({ status: 'OK', app: 'Boomcart API' }));
// Apply strict rate limit only to login & register, not /auth/me which fires on every page load
app.post('/api/auth/login', authLimiter);
app.post('/api/auth/register', authLimiter);
app.use('/api/auth',     authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders',   transactionLimiter, orderRoutes);
app.use('/api/users',    userRoutes);
app.use('/api/reviews',  reviewRoutes);
app.use('/api/payments', transactionLimiter, paymentRoutes);
app.use('/api/appointments', appointmentRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`\n🚀 Boomcart API running on port ${PORT} [${process.env.NODE_ENV}]`));
