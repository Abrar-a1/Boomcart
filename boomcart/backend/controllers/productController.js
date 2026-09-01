const asyncHandler = require('express-async-handler');
const Product = require('../models/Product');
const { cloudinary } = require('../config/cloudinary');
const ApiFeatures = require('../utils/apiFeatures');

const safeParse = (val, fallback) => {
  if (Array.isArray(val)) return val;
  try { return JSON.parse(val); } catch { return fallback; }
};

// GET /api/products
const getProducts = asyncHandler(async (req, res) => {
  const features = new ApiFeatures(Product.find({ isActive: true }).select('-__v'), req.query)
    .search().filter().sort().paginate();
  const products = await features.query;
  // Count with same filters so totalProducts & totalPages are accurate
  const total = await Product.countDocuments({ isActive: true, ...features.countFilter });
  res.json({ success: true, totalProducts: total, resultsPerPage: features.resultsPerPage, currentPage: features.currentPage, totalPages: Math.ceil(total / features.resultsPerPage), data: products });
});

// GET /api/products/featured
const getFeaturedProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({ isFeatured: true, isActive: true }).limit(8);
  res.json({ success: true, data: products });
});

// GET /api/products/admin/all
const getAdminProducts = asyncHandler(async (req, res) => {
  // Use ApiFeatures to bring pagination, sorting, and search to the admin panel
  const features = new ApiFeatures(Product.find(), req.query).search().filter().sort().paginate();
  const products = await features.query;
  const total = await Product.countDocuments(features.countFilter);
  res.json({ success: true, totalProducts: total, resultsPerPage: features.resultsPerPage, currentPage: features.currentPage, totalPages: Math.ceil(total / features.resultsPerPage), data: products });
});

// GET /api/products/:id
const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id).populate('createdBy', 'name');
  if (!product || !product.isActive) { res.status(404); throw new Error('Product not found'); }
  res.json({ success: true, data: product });
});

// POST /api/products
const createProduct = asyncHandler(async (req, res) => {
  const { name, description, price, discountPrice, category, subCategory, sizes, colors, stock, tags, isFeatured } = req.body;
  const images = req.files?.images?.map(f => ({ url: f.path, publicId: f.filename })) || [];
  if (!images.length) { res.status(400); throw new Error('At least one image required'); }
  const video = req.file ? { url: req.file.path, publicId: req.file.filename } : { url: '', publicId: '' };
  const product = await Product.create({
    name, description, price: Number(price), discountPrice: Number(discountPrice) || 0,
    category, subCategory,
    sizes: safeParse(sizes, []), colors: safeParse(colors, []),
    stock: Number(stock), tags: safeParse(tags, []),
    isFeatured: isFeatured === 'true', images, video,
    createdBy: req.user._id,
  });
  res.status(201).json({ success: true, data: product });
});

// PUT /api/products/:id
const updateProduct = asyncHandler(async (req, res) => {
  let product = await Product.findById(req.params.id);
  if (!product) { res.status(404); throw new Error('Product not found'); }
  if (req.files?.images?.length) {
    for (const img of product.images) { if (img.publicId) await cloudinary.uploader.destroy(img.publicId); }
    req.body.images = req.files.images.map(f => ({ url: f.path, publicId: f.filename }));
  }
  if (req.file) {
    if (product.video?.publicId) await cloudinary.uploader.destroy(product.video.publicId, { resource_type: 'video' });
    req.body.video = { url: req.file.path, publicId: req.file.filename };
  }
  if (req.body.sizes)  req.body.sizes  = safeParse(req.body.sizes, product.sizes);
  if (req.body.colors) req.body.colors = safeParse(req.body.colors, product.colors);
  if (req.body.tags)   req.body.tags   = safeParse(req.body.tags, product.tags);
  if (req.body.price)  req.body.price  = Number(req.body.price);
  if (req.body.discountPrice !== undefined) req.body.discountPrice = Number(req.body.discountPrice);
  product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  res.json({ success: true, data: product });
});

// DELETE /api/products/:id
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) { res.status(404); throw new Error('Product not found'); }
  for (const img of product.images) { if (img.publicId) await cloudinary.uploader.destroy(img.publicId); }
  if (product.video?.publicId) await cloudinary.uploader.destroy(product.video.publicId, { resource_type: 'video' });
  await product.deleteOne();
  res.json({ success: true, message: 'Product deleted' });
});


// PATCH /api/products/:id/toggle — Admin toggle isActive
const toggleProductStatus = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) { res.status(404); throw new Error('Product not found'); }
  product.isActive = !product.isActive;
  await product.save();
  res.json({ success: true, data: product, message: `Product ${product.isActive ? 'activated' : 'deactivated'}` });
});

module.exports = { getProducts, getFeaturedProducts, getAdminProducts, getProductById, createProduct, updateProduct, deleteProduct, toggleProductStatus };
