const Course = require('../models/Course');
const cloudinary = require('../config/cloudinary');

exports.createCourse = async (req, res) => {
  try {
    const { title, description, price, affiliateCommission } = req.body;
    const file = req.file;

    const uploadRes = await cloudinary.uploader.upload(file.path);

    const course = new Course({
      title,
      description,
      price,
      affiliateCommission,
      thumbnail: uploadRes.secure_url,
      createdBy: req.user._id
    });

    await course.save();
    res.status(201).json(course);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getCourses = async (req, res) => {
  const courses = await Course.find().sort({ createdAt: -1 });
  res.json(courses);
};

exports.getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ error: 'Course not found' });
    res.json(course);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateCourse = async (req, res) => {
  try {
    const { title, description, price, affiliateCommission } = req.body;

    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ error: 'Course not found' });

    course.title = title || course.title;
    course.description = description || course.description;
    course.price = price || course.price;
    course.affiliateCommission = affiliateCommission || course.affiliateCommission;

    // If new thumbnail uploaded
    if (req.file) {
      const uploadRes = await cloudinary.uploader.upload(req.file.path);
      course.thumbnail = uploadRes.secure_url;
    }

    await course.save();
    res.json(course);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
