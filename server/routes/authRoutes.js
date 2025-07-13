const express = require('express');
const router = express.Router();

const {
  adminLogin,
  adminRegister,
  login,
  register,
} = require('../controllers/authController');

router.post('/admin/login', adminLogin);
router.post('/admin/register', adminRegister);

// ✅ These must now be working
router.post('/login', login);
router.post('/register', register);

module.exports = router;
