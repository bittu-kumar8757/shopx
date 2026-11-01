import nodemailer from 'nodemailer';

let ordersList = [];

export const createOrder = async (req, res) => {
  try {
    const orderData = req.body;

    if (!orderData.id) {
      orderData.id = `SX${Math.floor(10000 + Math.random() * 90000)}`;
    }
    if (!orderData.status) orderData.status = 'Pending';
    if (!orderData.createdAt) orderData.createdAt = new Date().toISOString();

    // 1. Order immediately store karein
    ordersList.unshift(orderData);

    // 2. Client ko Instant Response send karein (Processing button instantly solve ho jayega)
    res.status(201).json({ success: true, data: orderData });

    // 3. Email Background Trigger (Response ke baad asynchronous mail send hoga)
    const gmailUser = process.env.GMAIL_USER || 'bittukumar865758@gmail.com';
    const gmailPass = process.env.GMAIL_PASS || 'tkfjmttvivuvblip';

    if (gmailUser && gmailPass) {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: gmailUser,
          pass: gmailPass
        }
      });

      const itemsHtml = (orderData.items || []).map(item => `
        <li style="margin-bottom: 6px;">
          <strong>${item.name || 'Product'}</strong> — Qty: ${item.quantity || item.qty || 1} | Size: ${item.size || 'N/A'} | Price: ₹${item.price}
        </li>
      `).join('');

      const mailOptions = {
        from: `"ShopX Alert" <${gmailUser}>`,
        to: gmailUser,
        subject: `🚨 New Order Received! #${orderData.id}`,
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; background: #f9f9f9; color: #333;">
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

      transporter.sendMail(mailOptions)
        .then(info => console.log(`✅ Mail Sent: ${info.messageId}`))
        .catch(err => console.error('❌ Mail Error:', err.message));
    }

  } catch (error) {
    console.error('Error in createOrder:', error);
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
};

export const getAllOrders = async (req, res) => {
  res.status(200).json({ success: true, data: ordersList });
};

export const updateOrderStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const index = ordersList.findIndex(o => String(o.id) === String(id));
  if (index !== -1) ordersList[index].status = status || 'Delivered';
  res.status(200).json({ success: true, data: ordersList[index] });
};

export const deleteOrder = async (req, res) => {
  const { id } = req.params;
  ordersList = ordersList.filter(o => String(o.id) !== String(id));
  res.status(200).json({ success: true, message: 'Deleted' });
};