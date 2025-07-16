const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
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
router.get('/next/:id', courseController.getNextCourse);

router.post('/', auth.admin, upload.single('thumbnail'), createCourse);
router.put('/:id', auth.admin, upload.single('thumbnail'), updateCourse); // Admin only

module.exports = router;
