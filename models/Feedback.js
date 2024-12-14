const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const feedbackSchema = new Schema({
  studentId: {
    type: String,
    required: true,
  },
  timeliness: {
    type: Number,
    required: true,
  },
  cleanliness: {
    type: Number,
    required: true,
  },
  quality: {
    type: Number,
    required: true,
  }
  ,
  hygiene: {
    type: Number,
    required: true,
  },
  service: {
    type: Number,
    required: true,
  },

  review: {
    type: String,
    required: true,
  },

});

module.exports = mongoose.model('Feedback', feedbackSchema);
