const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  url: { type: String, required: true, trim: true },
  platform: { type: String, enum: ['youtube', 'facebook', 'other'], default: 'youtube' },
  videoId: { type: String, trim: true },
  thumbnail: { type: String, trim: true },
  duration: { type: String, trim: true },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

videoSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  if (this.url && this.platform === 'youtube') {
    const match = this.url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]+)/);
    if (match) this.videoId = match[1];
  }
  next();
});

module.exports = mongoose.model('Video', videoSchema);