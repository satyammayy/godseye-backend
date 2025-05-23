// models/User.js
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name:      { type: String, required: true },
  email:     { type: String, required: true, unique: true },
  gender:    { type: String, required: true },
  college:   { type: String, required: true },
  imageUrl:  { type: String },
});

module.exports = mongoose.model('User', UserSchema);
