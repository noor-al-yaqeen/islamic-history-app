const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  nameEn: { type: String, trim: true },
  slug: { type: String, required: true, unique: true, trim: true },
  description: { type: String, trim: true },
  icon: { type: String, default: '📖' },
  color: { type: String, default: '#2E7D32' },
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

categorySchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Category', categorySchema);