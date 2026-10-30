import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_PATH = path.join(__dirname, '../data/orders.json');

const readOrders = () => JSON.parse(fs.readFileSync(DATA_PATH, 'utf-8'));
const writeOrders = (data) => fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));

// GET /api/orders  (Admin only)
export const getAllOrders = (req, res) => {
  try {
    const orders = readOrders();
    res.json({ success: true, data: orders });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to load orders' });
  }
};

// POST /api/orders  (Customer places order)
export const createOrder = (req, res) => {
  try {
    const orders = readOrders();
    const { customer, email, phone, address, city, pincode, payment, items, subtotal, discount, shipping, total } = req.body;

    const orderId = '#SX' + Math.floor(Math.random() * 90000 + 10000);
    const newOrder = {
      id: orderId,
      customer, email, phone, address, city, pincode,
      payment: payment || 'card',
      items: items || [],
      subtotal: parseFloat(subtotal) || 0,
      discount: parseFloat(discount) || 0,
      shipping: parseFloat(shipping) || 0,
      total: parseFloat(total) || 0,
      date: new Date().toISOString(),
      status: 'pending',
    };

    orders.push(newOrder);
    writeOrders(orders);
    res.status(201).json({ success: true, data: newOrder, message: 'Order placed successfully!' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to place order' });
  }
};

// PATCH /api/orders/:id  (Admin toggles delivery status)
export const updateOrderStatus = (req, res) => {
  try {
    const orders = readOrders();
    const order = orders.find(o => o.id === req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    const { status } = req.body;
    order.status = status || (order.status === 'pending' ? 'delivered' : 'pending');

    writeOrders(orders);
    res.json({ success: true, data: order, message: `Order marked as ${order.status}` });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update order' });
  }
};

// DELETE /api/orders/:id  (Admin only)
export const deleteOrder = (req, res) => {
  try {
    let orders = readOrders();
    const exists = orders.find(o => o.id === req.params.id);
    if (!exists) return res.status(404).json({ success: false, message: 'Order not found' });

    orders = orders.filter(o => o.id !== req.params.id);
    writeOrders(orders);
    res.json({ success: true, message: 'Order deleted!' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete order' });
  }
};
