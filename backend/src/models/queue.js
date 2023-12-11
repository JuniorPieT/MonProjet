const mongoose = require('mongoose');

const queueSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  socketId: {
    type: String,
    default: null,
  },
  categories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true,
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Queue = mongoose.model('Queue', queueSchema);

module.exports = Queue;