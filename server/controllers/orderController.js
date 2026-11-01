import nodemailer from 'nodemailer';

// Temporary in-memory / fallback store (agar aap DB use nahi kar rahe)
let ordersList = [];

// Email Transporter Config
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER, // Aapka Gmail ID
    pass: process.env.GMAIL_PASS  // Google se mila 16-digit App Password
  }
});

// 1. Create New Order & Send Email Notification
export const createOrder = async (req, res) => {
  try {
    const orderData = req.body;

    // Generate Order ID if missing
    if (!orderData.id) {
      orderData.id = `SX${Math.floor(10000 + Math.random() * 90000)}`;
    }
    if (!orderData.status) {
      orderData.status = 'Pending';
    }
    if (!orderData.createdAt) {
      orderData.createdAt = new Date().toISOString();
    }

    // Save order in memory list
    ordersList.unshift(orderData);

    // Email HTML Format
    const itemsHtml = (orderData.items || []).map(item => `
      <li style="margin-bottom: 6px;">
        <strong>${item.name || 'Product'}</strong> — Qty: ${item.quantity || item.qty || 1} | Size: ${item.size || 'N/A'} | Price: ₹${item.price}
      </li>
    `).join('');

    const mailOptions = {
      from: `"ShopX Store" <${process.env.GMAIL_USER}>`,
      to: process.env.GMAIL_USER, // 👈 Notification aapke Gmail inbox par jayega
      subject: `🚨 New Order Received! #${orderData.id}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4;">
          <div style="max-width: 600px; margin: 0 auto; background: #ffffff; padding: 24px; border-radius: 8px; border: 1px solid #ddd;">
            <h2 style="color: #e2b963; margin-top: 0;">🎉 New Order Received on ShopX!</h2>
            <hr style="border: 0; border-top: 1px solid #eee;" />
            <p><strong>Order ID:</strong> #${orderData.id}</p>
            <p><strong>Customer:</strong> ${orderData.customer || 'Guest'}</p>
            <p><strong>Email:</strong> ${orderData.email || 'N/A'}</p>
            <p><strong>Phone:</strong> ${orderData.phone || 'N/A'}</p>
            <p><strong>Address:</strong> ${orderData.address || ''}, ${orderData.city || ''} ${orderData.pincode || ''}</p>
            <hr style="border: 0; border-top: 1px solid #eee;" />
            <h3>Ordered Items:</h3>
            <ul>${itemsHtml}</ul>
            <hr style="border: 0; border-top: 1px solid #eee;" />
            <h3 style="color: #2ea44f;">Total Amount: ₹${orderData.totalAmount || orderData.total || 0}</h3>
            <p><strong>Payment Mode:</strong> ${(orderData.payment || 'COD').toUpperCase()}</p>
          </div>
        </div>
      `
    };

    // Send Email via Nodemailer
    try {
      if (process.env.GMAIL_USER && process.env.GMAIL_PASS) {
        await transporter.sendMail(mailOptions);
        console.log(`✅ Order notification email sent for #${orderData.id}`);
      } else {
        console.log('⚠️ GMAIL_USER or GMAIL_PASS not found in environment variables.');
      }
    } catch (mailErr) {
      console.error('❌ Email sending failed:', mailErr.message);
    }

    res.status(201).json({ success: true, data: orderData });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// 2. Get All Orders (Admin Panel ke liye)
export const getAllOrders = async (req, res) => {
  try {
    res.status(200).json({ success: true, data: ordersList });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 3. Update Order Status (Deliver Button ke liye)
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const orderIndex = ordersList.findIndex(o => String(o.id) === String(id));
    if (orderIndex !== -1) {
      ordersList[orderIndex].status = status || 'Delivered';
      return res.status(200).json({ success: true, data: ordersList[orderIndex] });
    }

    res.status(200).json({ success: true, message: 'Status updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 4. Delete Order (Trash Button ke liye)
export const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;
    ordersList = ordersList.filter(o => String(o.id) !== String(id));
    res.status(200).json({ success: true, message: 'Order deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};