const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ─── Expiry setting (change in .env as MEDIA_EXPIRY_DAYS) ─
const MEDIA_EXPIRY_DAYS = Number(process.env.MEDIA_EXPIRY_DAYS) || 25;

// Stamp each upload with a date tag e.g. "expires_2025-08-28"
const getExpiryTag = () => {
  const date = new Date();
  date.setDate(date.getDate() + MEDIA_EXPIRY_DAYS);
  return `expires_${date.toISOString().split('T')[0]}`;
};

// ─── Image storage ────────────────────────────────────────
const imageStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder: 'boomcart/products',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 800, height: 1000, crop: 'limit', quality: 'auto' }],
    tags: ['boomcart', 'product_image', getExpiryTag()],
    context: `uploaded_at=${new Date().toISOString()}|expires_days=${MEDIA_EXPIRY_DAYS}`,
  }),
});

// ─── Video storage ────────────────────────────────────────
const videoStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder: 'boomcart/videos',
    resource_type: 'video',
    allowed_formats: ['mp4', 'mov', 'avi', 'webm'],
    tags: ['boomcart', 'product_video', getExpiryTag()],
    context: `uploaded_at=${new Date().toISOString()}|expires_days=${MEDIA_EXPIRY_DAYS}`,
  }),
});

// ─── Multer instances ─────────────────────────────────────
const uploadProduct = multer({
  storage: imageStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) =>
    file.mimetype.startsWith('image/') ? cb(null, true) : cb(new Error('Images only'), false),
});

const uploadVideo = multer({
  storage: videoStorage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (req, file, cb) =>
    file.mimetype.startsWith('video/') ? cb(null, true) : cb(new Error('Videos only'), false),
});

// ─── Manual delete (called when admin deletes a product) ──
const deleteFromCloudinary = async (publicId, resourceType = 'image') => {
  try {
    return await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
      invalidate: true,
    });
  } catch (err) {
    console.error(`Cloudinary delete failed [${publicId}]:`, err.message);
  }
};

// ─── Daily cleanup scheduler ──────────────────────────────
// Runs every midnight — deletes all files tagged with today's expiry date
const scheduleCloudinaryCleanup = () => {
  const runCleanup = async () => {
    const tag = `expires_${new Date().toISOString().split('T')[0]}`;
    console.log(`🧹 [Cloudinary] Cleaning up resources tagged: ${tag}`);
    try {
      const [imgRes, vidRes] = await Promise.all([
        cloudinary.api.delete_resources_by_tag(tag, { resource_type: 'image' }),
        cloudinary.api.delete_resources_by_tag(tag, { resource_type: 'video' }),
      ]);
      const imgs = Object.keys(imgRes.deleted || {}).length;
      const vids = Object.keys(vidRes.deleted || {}).length;
      console.log(`✅ [Cloudinary] Deleted ${imgs} images + ${vids} videos with tag "${tag}"`);
    } catch (err) {
      console.error('❌ [Cloudinary] Cleanup error:', err.message);
    }
  };

  // Wait until next midnight, then run every 24 h
  const msUntilMidnight = () => {
    const midnight = new Date();
    midnight.setHours(24, 0, 0, 0);
    return midnight - Date.now();
  };

  setTimeout(() => {
    runCleanup();
    setInterval(runCleanup, 24 * 60 * 60 * 1000);
  }, msUntilMidnight());

  console.log(`🕐 [Cloudinary] Auto-cleanup scheduled (${MEDIA_EXPIRY_DAYS}-day expiry)`);
};

module.exports = { cloudinary, uploadProduct, uploadVideo, deleteFromCloudinary, scheduleCloudinaryCleanup };
