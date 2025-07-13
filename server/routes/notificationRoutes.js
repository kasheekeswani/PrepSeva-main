// server/routes/notificationRoutes.js
const express = require('express');
const router = express.Router();
const {
  createNotification,
  getNotifications,
  updateNotification,
  deleteNotification 
} = require('../controllers/notificationController');

router.post('/', createNotification);
router.get('/', getNotifications);
router.put('/:id', updateNotification); 
router.delete('/:id', deleteNotification);

module.exports = router;


