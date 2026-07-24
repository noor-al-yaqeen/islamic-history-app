const mongoose = require('mongoose');

const storySchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  subtitle: { type: String, trim: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  content: { type: String, default: '' },
  summary: { type: String, trim: true },
  icon: { type: String, default: '📖' },
  imageUrl: { type: String, trim: true },
  tags: [{ type: String, trim: true }],
  highlights: [{ type: String, trim: true }],
  quote: { type: String, trim: true },
  conversation: [{
    speaker: { type: String, enum: ['حكيم', 'سائل'], default: 'حكيم' },
    text: { type: String, default: '' }
  }],
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

storySchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Story', storySchema);