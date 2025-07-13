// server/controllers/notificationController.js

const Notification = require('../models/Notification');

// Create Notification
exports.createNotification = async (req, res) => {
  const { title, message, link } = req.body;

  try {
    const notification = await Notification.create({ title, message, link });
    res.status(201).json(notification);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get All Notifications
exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find().sort({ createdAt: -1 });
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete Notification by ID
exports.deleteNotification = async (req, res) => {
  const { id } = req.params;

  try {
    const notification = await Notification.findByIdAndDelete(id);
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    res.json({ message: 'Notification deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update Notification by ID
exports.updateNotification = async (req, res) => {
  const { id } = req.params;
  const { title, message, link } = req.body;

  try {
    const notification = await Notification.findByIdAndUpdate(
      id,
      { title, message, link },
      { new: true, runValidators: true }
    );

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    res.json(notification);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
