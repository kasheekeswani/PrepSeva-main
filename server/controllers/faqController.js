// controllers/faqController.js
const FAQ = require('../models/FAQ');

// Get all FAQs (admin)
exports.getAllFAQs = async (req, res) => {
  try {
    const faqs = await FAQ.find()
      .populate('createdBy', 'username email')
      .sort({ priority: -1, createdAt: -1 });
    res.json(faqs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get active FAQs (public)
exports.getActiveFAQs = async (req, res) => {
  try {
    const { category, limit = 10 } = req.query;
    const query = { isActive: true };

    if (category && category !== 'all') {
      query.category = category;
    }

    const faqs = await FAQ.find(query)
      .sort({ priority: -1, viewCount: -1 })
      .limit(parseInt(limit));

    res.json(faqs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Search FAQs (public)
exports.searchFAQs = async (req, res) => {
  try {
    const { q, category } = req.query;

    if (!q) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const query = {
      isActive: true,
      $or: [
        { question: { $regex: q, $options: 'i' } },
        { answer: { $regex: q, $options: 'i' } },
        { keywords: { $in: [new RegExp(q, 'i')] } }
      ]
    };

    if (category && category !== 'all') {
      query.category = category;
    }

    const faqs = await FAQ.find(query)
      .sort({ priority: -1, viewCount: -1 })
      .limit(10);

    res.json(faqs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get FAQ by ID (and increment view)
exports.getFAQById = async (req, res) => {
  try {
    const faq = await FAQ.findByIdAndUpdate(
      req.params.id,
      { $inc: { viewCount: 1 } },
      { new: true }
    ).populate('createdBy', 'username email');

    if (!faq) {
      return res.status(404).json({ error: 'FAQ not found' });
    }

    res.json(faq);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create new FAQ
exports.createFAQ = async (req, res) => {
  try {
    const { question, answer, keywords, category, priority } = req.body;

    const faq = new FAQ({
      question,
      answer,
      keywords: keywords ? keywords.split(',').map(k => k.trim()) : [],
      category,
      priority: priority || 0,
      createdBy: req.user.id
    });

    await faq.save();
    await faq.populate('createdBy', 'username email');

    res.status(201).json(faq);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update FAQ
exports.updateFAQ = async (req, res) => {
  try {
    const { question, answer, keywords, category, priority, isActive } = req.body;

    const updateData = {
      question,
      answer,
      keywords: keywords ? keywords.split(',').map(k => k.trim()) : [],
      category,
      priority,
      isActive
    };

    const faq = await FAQ.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate('createdBy', 'username email');

    if (!faq) {
      return res.status(404).json({ error: 'FAQ not found' });
    }

    res.json(faq);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete FAQ
exports.deleteFAQ = async (req, res) => {
  try {
    const faq = await FAQ.findByIdAndDelete(req.params.id);

    if (!faq) {
      return res.status(404).json({ error: 'FAQ not found' });
    }

    res.json({ message: 'FAQ deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get categories
exports.getFAQCategories = async (req, res) => {
  try {
    const categories = await FAQ.distinct('category', { isActive: true });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Stats for admin
exports.getFAQStats = async (req, res) => {
  try {
    const stats = await FAQ.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          totalViews: { $sum: '$viewCount' },
          activeCount: { $sum: { $cond: ['$isActive', 1, 0] } }
        }
      },
      { $sort: { count: -1 } }
    ]);

    const totalFAQs = await FAQ.countDocuments();
    const activeFAQs = await FAQ.countDocuments({ isActive: true });

    res.json({ totalFAQs, activeFAQs, categoryStats: stats });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
