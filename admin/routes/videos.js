const express = require('express');
const router = express.Router();
const Video = require('../models/Video');

router.get('/', async (req, res) => {
  try {
    const { category, active } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (active === 'true') filter.isActive = true;
    const videos = await Video.find(filter).populate('category', 'name slug').sort({ createdAt: -1 });
    res.json({ success: true, data: videos, count: videos.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const video = await Video.findById(req.params.id).populate('category', 'name slug');
    if (!video) return res.status(404).json({ success: false, message: 'الفيديو غير موجود' });
    res.json({ success: true, data: video });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const video = new Video(req.body);
    await video.save();
    const populated = await Video.findById(video._id).populate('category', 'name slug');
    res.status(201).json({ success: true, data: populated, message: '✓ تم إضافة الفيديو بنجاح' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const video = await Video.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).populate('category', 'name slug');
    if (!video) return res.status(404).json({ success: false, message: 'الفيديو غير موجود' });
    res.json({ success: true, data: video, message: '✓ تم تحديث الفيديو بنجاح' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const video = await Video.findByIdAndDelete(req.params.id);
    if (!video) return res.status(404).json({ success: false, message: 'الفيديو غير موجود' });
    res.json({ success: true, message: '✓ تم حذف الفيديو بنجاح' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;