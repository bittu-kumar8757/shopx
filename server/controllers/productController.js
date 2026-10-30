import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_PATH = path.join(__dirname, '../data/products.json');

const readProducts = () => JSON.parse(fs.readFileSync(DATA_PATH, 'utf-8'));
const writeProducts = (data) => fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));

// GET /api/products
export const getAllProducts = (req, res) => {
  try {
    const products = readProducts();
    res.json({ success: true, data: products });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to load products' });
  }
};

// GET /api/products/:id
export const getProductById = (req, res) => {
  try {
    const products = readProducts();
    const product = products.find(p => p.id === parseInt(req.params.id));
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, data: product });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// POST /api/products  (Admin only)
export const createProduct = (req, res) => {
  try {
    const products = readProducts();
    const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
    const catLabels = { men: "Men's Collection", women: "Women's Collection", unisex: 'Unisex' };
    const tagLabels = { new: 'New', hot: 'Hot', sale: 'Sale' };
    const { name, category, description, price, originalPrice, tag, rating, material, fit, care, sizes, outOfStock, image, featured } = req.body;

    const newProduct = {
      id: newId,
      name, category,
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
      description, material, fit,
      care: care || 'Machine wash cold',
      featured: featured || false,
    };

    products.push(newProduct);
    writeProducts(products);
    res.status(201).json({ success: true, data: newProduct, message: 'Product added successfully!' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to create product' });
  }
};

// PUT /api/products/:id  (Admin only)
export const updateProduct = (req, res) => {
  try {
    const products = readProducts();
    const idx = products.findIndex(p => p.id === parseInt(req.params.id));
    if (idx === -1) return res.status(404).json({ success: false, message: 'Product not found' });

    const catLabels = { men: "Men's Collection", women: "Women's Collection", unisex: 'Unisex' };
    const tagLabels = { new: 'New', hot: 'Hot', sale: 'Sale' };
    const updates = req.body;

    products[idx] = {
      ...products[idx],
      ...updates,
      categoryLabel: catLabels[updates.category] || products[idx].categoryLabel,
      tagLabel: updates.tag ? tagLabels[updates.tag] : null,
      price: parseFloat(updates.price || products[idx].price),
      originalPrice: updates.originalPrice ? parseFloat(updates.originalPrice) : products[idx].originalPrice,
    };

    writeProducts(products);
    res.json({ success: true, data: products[idx], message: 'Product updated!' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update product' });
  }
};

// DELETE /api/products/:id  (Admin only)
export const deleteProduct = (req, res) => {
  try {
    let products = readProducts();
    const exists = products.find(p => p.id === parseInt(req.params.id));
    if (!exists) return res.status(404).json({ success: false, message: 'Product not found' });

    products = products.filter(p => p.id !== parseInt(req.params.id));
    writeProducts(products);
    res.json({ success: true, message: 'Product deleted!' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete product' });
  }
};
