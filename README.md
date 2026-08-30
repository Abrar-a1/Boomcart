# Boomcoart — Fashion E-commerce

A full-stack fashion e-commerce platform built with React, Node.js, MongoDB, Cloudinary and Razorpay.

---

## Tech Stack

| Layer     | Technology                          |
|-----------|-------------------------------------|
| Frontend  | React 18 + Vite, React Router v6    |
| Backend   | Node.js + Express.js                |
| Database  | MongoDB + Mongoose                  |
| Media     | Cloudinary (images + videos)        |
| Payments  | Razorpay (test & live modes)        |
| Auth      | JWT (Bearer token)                  |
| Email     | Nodemailer (order confirmation)     |
| Styling   | Plain CSS with CSS Variables        |

---

## Quick Start

### 1. Clone & install

```bash
git clone https://github.com/Abrar-a1/Boomcoart.git
cd Boomcoart/boomcoart
npm install          # installs concurrently at root
npm run install-all  # installs backend + frontend deps
```

### 2. Configure backend environment

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env`:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/boomcoart
JWT_SECRET=your_super_secret_key_change_this_in_production
JWT_EXPIRE=7d
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_secret
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your@gmail.com
EMAIL_PASS=your_gmail_app_password
EMAIL_FROM=Boomcoart <noreply@boomcoart.com>
CLIENT_URL=http://localhost:5173
```

### 3. Configure frontend environment

```bash
cp frontend/.env.example frontend/.env
```

Edit `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000/api
VITE_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
```

### 4. Run both servers

```bash
npm run dev
```

- Backend:  http://localhost:5000
- Frontend: http://localhost:5173

---

## Creating your first Admin

1. Register a normal account at http://localhost:5173/register
2. Open MongoDB Atlas or Compass
3. Find your user in the `users` collection
4. Change `"role": "user"` → `"role": "admin"`
5. Log out and log back in — the Admin Panel link will appear

---

## Project Structure

```
boomcoart/
├── backend/
│   ├── config/         # DB + Cloudinary setup
│   ├── controllers/    # All route logic
│   ├── middleware/     # Auth + error handling
│   ├── models/         # Mongoose schemas
│   ├── routes/         # Express route definitions
│   ├── utils/          # Token, email, API features
│   └── server.js
└── frontend/
    └── src/
        ├── components/ # Navbar, Footer, ProductCard, Filters
        ├── context/    # Auth + Cart global state
        ├── pages/      # All page components
        │   ├── admin/  # Dashboard, Products, Orders, Users
        │   └── auth/   # Login, Register
        └── services/   # Axios API calls (one file per domain)
```

---

## API Routes

| Method | Route                    | Access  | Description              |
|--------|--------------------------|---------|--------------------------|
| POST   | /api/auth/register       | Public  | Register new user        |
| POST   | /api/auth/login          | Public  | Login                    |
| GET    | /api/auth/me             | Private | Get current user         |
| GET    | /api/products            | Public  | List + search + filter   |
| GET    | /api/products/:id        | Public  | Single product           |
| POST   | /api/products            | Admin   | Create product           |
| PUT    | /api/products/:id        | Admin   | Update product           |
| DELETE | /api/products/:id        | Admin   | Delete product           |
| POST   | /api/orders              | Private | Place order              |
| GET    | /api/orders/my-orders    | Private | User's orders            |
| GET    | /api/orders/:id          | Private | Single order             |
| GET    | /api/orders/admin/stats  | Admin   | Dashboard stats          |
| GET    | /api/orders/admin/all    | Admin   | All orders               |
| PUT    | /api/orders/:id/status   | Admin   | Update order status      |
| POST   | /api/payments/create-order | Private | Razorpay order         |
| POST   | /api/payments/verify     | Private | Verify payment signature |
| POST   | /api/users/wishlist/:id  | Private | Toggle wishlist          |
| GET    | /api/reviews/:productId  | Public  | Get reviews              |
| POST   | /api/reviews             | Private | Submit review            |

---

## Deployment

### Frontend → Vercel
```bash
cd frontend && npm run build
# Push to GitHub → connect to Vercel
# Add VITE_API_URL=https://your-backend.onrender.com/api
# Add VITE_RAZORPAY_KEY_ID=rzp_live_xxxx
```

### Backend → Render
1. Connect your GitHub repo
2. Root directory: `backend`
3. Build command: `npm install`
4. Start command: `npm start`
5. Add all environment variables from `.env.example`

### Database → MongoDB Atlas
1. Create a free M0 cluster
2. Add your Render server IP to the IP whitelist (or use 0.0.0.0/0 for all)
3. Copy the connection string into `MONGO_URI`

---

## Key Features

- ✅ Fully responsive (mobile, tablet, desktop)
- ✅ JWT authentication with protected routes
- ✅ Admin panel (products, orders, users)
- ✅ Cloudinary image upload with auto-optimization
- ✅ Razorpay payment + COD
- ✅ Order confirmation email (Nodemailer)
- ✅ Product search, filter, sort, pagination
- ✅ Wishlist with toggle
- ✅ Product reviews with verified purchase badge
- ✅ Order tracking with status timeline
- ✅ Cart persisted in localStorage
- ✅ Rate limiting + helmet security headers
