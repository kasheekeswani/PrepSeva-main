const express = require('express');
const router = express.Router();
const {
  createCourse,
  getCourses,
  getCourseById,
  updateCourse
} = require('../controllers/courseController');
const auth = require('../middleware/auth');
const upload = require('../middleware/multer'); // handles 'thumbnail'

router.get('/', getCourses); // Public
router.get('/:id', getCourseById); // Public

router.post('/', auth.admin, upload.single('thumbnail'), createCourse);
router.put('/:id', auth.admin, upload.single('thumbnail'), updateCourse); // Admin only

module.exports = router;
