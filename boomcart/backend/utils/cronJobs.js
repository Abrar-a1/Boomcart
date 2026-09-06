const cron = require('node-cron');
const mongoose = require('mongoose');
const Order = require('../models/Order');
const productService = require('../services/productService');

// Run every 5 minutes
const initCronJobs = () => {
  cron.schedule('*/5 * * * *', async () => {
    try {
      const staleOrders = await Order.find({
        isPaid: false,
        orderStatus: 'pending',
        expiresAt: { $lt: new Date() },
      });
      
      let cleaned = 0;
      for (const order of staleOrders) {
        const session = await mongoose.startSession();
        session.startTransaction();
        try {
          // Find and lock the order atomically to prevent concurrent processing
          const lockedOrder = await Order.findOneAndUpdate(
            { _id: order._id, orderStatus: 'pending', isPaid: false, expiresAt: { $lt: new Date() } },
            { $set: { orderStatus: 'cancelled' }, $unset: { expiresAt: 1 } },
            { session, new: true }
          );
          
          if (lockedOrder) {
            // Restore stock
            for (const item of lockedOrder.orderItems) {
              await productService.restoreStock(item.product, item.size, item.quantity, session);
            }
            await session.commitTransaction();
            cleaned++;
          } else {
            // Order might have been processed by another worker or paid right before lock
            await session.abortTransaction();
          }
        } catch (err) {
          console.error(`Cron cleanup failed for order ${order._id}:`, err);
          await session.abortTransaction();
        } finally {
          session.endSession();
        }
      }
      if (cleaned > 0) {
        console.log(`🧹 Cron: Cleaned ${cleaned} stale unpaid orders`);
      }
    } catch (err) {
      console.error('Cron job error:', err);
    }
  });
};

module.exports = initCronJobs;
