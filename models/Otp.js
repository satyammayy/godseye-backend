// models/Otp.js
const mongoose = require('mongoose');

const OtpSchema = new mongoose.Schema({
  email:      { type: String, required: true },
  otp:        { type: String, required: true },
  type:       { type: String, enum: ['register','login'], default: 'register' },
  expiresAt:  { type: Date, required: true },
});

OtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Otp', OtpSchema);
