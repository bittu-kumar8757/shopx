import Product from '../models/Product.js';

const catLabels = { men: "Men's Collection", women: "Women's Collection", unisex: 'Unisex' };
const tagLabels = { new: 'New', hot: 'Hot', sale: 'Sale' };

// GET /api/products
export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find({}).sort({ createdAt: -1 });
    res.json({ success: true, data: products });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to load products' });
  }
};

// GET /api/products/:id
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const isMongoId = id.match(/^[0-9a-fA-F]{24}$/);
    const product = isMongoId 
      ? await Product.findById(id) 
      : await Product.findOne({ id: parseInt(id) });

    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, data: product });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// POST /api/products (Admin only)
export const createProduct = async (req, res) => {
  try {
    const { name, category, description, price, originalPrice, tag, rating, material, fit, care, sizes, outOfStock, image, featured } = req.body;

    const newProduct = new Product({
      name,
      category,
      categoryLabel: catLabels[category] || category,
      price: parseFloat(price),
      originalPrice: originalPrice ? parseFloat(originalPrice) : null,
      image: image || 'product_tshirt.jpg',
      images: [image || 'product_tshirt.jpg'],
      rating: parseFloat(rating) || 4.5,
      reviews: 0,
      tag: tag || null,
      tagLabel: tag ? tagLabels[tag] : null,
      sizes: sizes || ['S', 'M', 'L', 'XL'],
      outOfStock: outOfStock || [],
      colors: ['#f0f0e8', '#1a1a1a', '#2d4a3e', '#8b5e3c'],
      description: description || '',
      material: material || '',
      fit: fit || '',
      care: care || 'Machine wash cold',
      featured: featured || false,
    });

    const savedProduct = await newProduct.save();
    res.status(201).json({ success: true, data: savedProduct, message: 'Product added successfully!' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Failed to create product' });
  }
};

// PUT /api/products/:id (Admin only)
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (updates.category) {
      updates.categoryLabel = catLabels[updates.category] || updates.category;
    }
    if (updates.tag !== undefined) {
      updates.tagLabel = updates.tag ? tagLabels[updates.tag] : null;
    }

    const isMongoId = id.match(/^[0-9a-fA-F]{24}$/);
    const filter = isMongoId ? { _id: id } : { id: parseInt(id) };

    const updatedProduct = await Product.findOneAndUpdate(filter, updates, { new: true });

    if (!updatedProduct) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, data: updatedProduct, message: 'Product updated!' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update product' });
  }
};

// DELETE /api/products/:id (Admin only - PERMANENT DELETE)
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const isMongoId = id.match(/^[0-9a-fA-F]{24}$/);
    const filter = isMongoId ? { _id: id } : { id: parseInt(id) };

    const deletedProduct = await Product.findOneAndDelete(filter);

    if (!deletedProduct) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.json({ success: true, message: 'Product permanently deleted from database!' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete product' });
  }
};