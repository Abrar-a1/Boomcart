const crypto = require('crypto');

// Generate and attach a stateless CSRF token cookie to responses
const setCsrfCookie = (req, res, next) => {
  // We attach it to GET requests or whenever specifically called
  // The frontend Axios will automatically read XSRF-TOKEN and send X-XSRF-TOKEN
  if (!req.cookies['XSRF-TOKEN']) {
    const csrfToken = crypto.randomBytes(32).toString('hex');
    res.cookie('XSRF-TOKEN', csrfToken, {
      httpOnly: false, // Must be readable by frontend JS (Axios)
      secure: process.env.NODE_ENV !== 'development',
      sameSite: process.env.NODE_ENV !== 'development' ? 'none' : 'strict',
      path: '/',
    });
  }
  next();
};

// Validate the CSRF token on state-changing requests
const validateCsrf = (req, res, next) => {
  // Skip for GET, HEAD, OPTIONS
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  // Webhooks are server-to-server and rely on HMAC signatures, not CSRF
  if (req.originalUrl.startsWith('/api/payments/webhook')) {
    return next();
  }

  const cookieToken = req.cookies['XSRF-TOKEN'];
  const headerToken = req.headers['x-xsrf-token'] || req.headers['x-csrf-token'];

  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    res.status(403);
    return next(new Error('CSRF token validation failed'));
  }

  next();
};

module.exports = { setCsrfCookie, validateCsrf };
