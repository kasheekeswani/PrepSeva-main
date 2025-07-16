const Course = require('../models/Course');
const cloudinary = require('../config/cloudinary');

// ✅ Create a new course with thumbnail upload
exports.createCourse = async (req, res) => {
  try {
    const { title, description, price, affiliateCommission } = req.body;
    const file = req.file;

    if (!title || !description || !price) {
      return res.status(400).json({ message: 'Title, description, and price are required.' });
    }

    let uploadRes = { secure_url: null };
    if (file) {
      uploadRes = await cloudinary.uploader.upload(file.path);
    }

    const course = new Course({
      title,
      description,
      price,
      affiliateCommission: affiliateCommission || 0,
      thumbnail: uploadRes.secure_url,
      createdBy: req.user._id
    });

    await course.save();

    res.status(201).json({
      _id: course._id,
      title: course.title,
      description: course.description,
      price: course.price,
      affiliateCommission: course.affiliateCommission,
      thumbnail: course.thumbnail,
      createdBy: course.createdBy
    });
  } catch (error) {
    console.error('❌ Error in createCourse:', error);
    res.status(500).json({ message: error.message || 'Internal server error while creating course' });
  }
};

// ✅ Get all courses, returning price and affiliateCommission explicitly
exports.getCourses = async (req, res) => {
  try {
    const courses = await Course.find({}, 'title description price affiliateCommission thumbnail createdBy createdAt')
      .sort({ createdAt: -1 });

    res.status(200).json(courses);
  } catch (error) {
    console.error('❌ Error in getCourses:', error);
    res.status(500).json({ message: error.message || 'Internal server error while fetching courses' });
  }
};

// ✅ Get a course by ID with price and affiliateCommission
exports.getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id, 'title description price affiliateCommission thumbnail createdBy createdAt');
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    res.status(200).json(course);
  } catch (error) {
    console.error('❌ Error in getCourseById:', error);
    res.status(500).json({ message: error.message || 'Internal server error while fetching course' });
  }
};

// ✅ Update a course with optional thumbnail re-upload
exports.updateCourse = async (req, res) => {
  try {
    const { title, description, price, affiliateCommission } = req.body;
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (title) course.title = title;
    if (description) course.description = description;
    if (price) course.price = price;
    if (affiliateCommission) course.affiliateCommission = affiliateCommission;

    if (req.file) {
      const uploadRes = await cloudinary.uploader.upload(req.file.path);
      course.thumbnail = uploadRes.secure_url;
    }

    await course.save();

    res.status(200).json({
      _id: course._id,
      title: course.title,
      description: course.description,
      price: course.price,
      affiliateCommission: course.affiliateCommission,
      thumbnail: course.thumbnail,
      createdBy: course.createdBy
    });
  } catch (error) {
    console.error('❌ Error in updateCourse:', error);
    res.status(500).json({ message: error.message || 'Internal server error while updating course' });
  }
};


// ✅ Get the next course based on current course ID
exports.getNextCourse = async (req, res) => {
  try {
    const currentCourseId = req.params.id;
    const allCourses = await Course.find().sort({ createdAt: 1 }); // ascending

    const currentIndex = allCourses.findIndex(c => c._id.toString() === currentCourseId);

    if (currentIndex === -1) {
      return res.status(404).json({ message: 'Current course not found in list' });
    }

    const nextCourse = allCourses[currentIndex + 1];

    if (!nextCourse) {
      return res.status(204).json({ message: 'No more courses available' }); // No Content
    }

    res.status(200).json(nextCourse);
  } catch (error) {
    console.error('❌ Error in getNextCourse:', error);
    res.status(500).json({ message: error.message || 'Internal server error while fetching next course' });
  }
};

