const mongoose = require('mongoose');

const appSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  version: {
    type: String,
    required: true,
    default: '1.0.0'
  },
  icon: {
    type: String,
    default: ''
  },
  packageUrl: {
    type: String,
    required: true
  },
  packageSize: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  developer: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['工具', '社交', '游戏', '教育', '娱乐', '生活', '其他']
  },
  downloadCount: {
    type: Number,
    default: 0
  },
  manifest: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

appSchema.index({ status: 1, category: 1 });
appSchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('App', appSchema);
