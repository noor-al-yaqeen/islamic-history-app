const express = require('express');
const router = express.Router();
const Story = require('../models/Story');

router.get('/', async (req, res) => {
  try {
    const { category, active } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (active === 'true') filter.isActive = true;
    const stories = await Story.find(filter).populate('category', 'name slug').sort({ order: 1, createdAt: -1 });
    res.json({ success: true, data: stories, count: stories.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const story = await Story.findById(req.params.id).populate('category', 'name slug icon color');
    if (!story) return res.status(404).json({ success: false, message: 'القصة غير موجودة' });
    res.json({ success: true, data: story });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const story = new Story(req.body);
    await story.save();
    const populated = await Story.findById(story._id).populate('category', 'name slug');
    res.status(201).json({ success: true, data: populated, message: '✓ تم إضافة القصة بنجاح' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const story = await Story.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).populate('category', 'name slug');
    if (!story) return res.status(404).json({ success: false, message: 'القصة غير موجودة' });
    res.json({ success: true, data: story, message: '✓ تم تحديث القصة بنجاح' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const story = await Story.findByIdAndDelete(req.params.id);
    if (!story) return res.status(404).json({ success: false, message: 'القصة غير موجودة' });
    res.json({ success: true, message: '✓ تم حذف القصة بنجاح' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;