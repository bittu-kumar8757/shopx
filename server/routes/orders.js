import express from 'express';
import { getAllOrders, createOrder, updateOrderStatus, deleteOrder } from '../controllers/orderController.js';
import { verifyAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', verifyAdmin, getAllOrders);
router.post('/', createOrder);
router.patch('/:id', verifyAdmin, updateOrderStatus);
router.delete('/:id', verifyAdmin, deleteOrder);

export default router;
