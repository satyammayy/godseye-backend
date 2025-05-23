// routes/auth.js
const express  = require('express');
const router   = express.Router();
const Otp      = require('../models/Otp');
const User     = require('../models/User');
const { sendOtpEmail } = require('../utils/email');
const jwt      = require('jsonwebtoken');

// POST /auth/request-otp
router.post('/request-otp', async (req, res) => {
  const { email, type } = req.body; // type: 'register' or 'login'
  if (!email || !['register','login'].includes(type)) {
    return res.status(400).json({ message: 'Email and type required' });
  }
  const otp = Math.floor(100000 + Math.random()*900000).toString();
  await Otp.create({
    email,
    otp,
    type,
    expiresAt: new Date(Date.now() + 5*60*1000),  // 5 min
  });
  await sendOtpEmail(email, otp);
  res.json({ message: 'OTP sent' });
});

// POST /auth/register
router.post('/register', async (req, res) => {
  const { name, email, gender, college, otp } = req.body;
  if (!name||!email||!gender||!college||!otp) {
    return res.status(400).json({ message: 'All fields + otp required' });
  }
  const record = await Otp.findOne({ email, otp, type:'register' });
  if (!record) return res.status(400).json({ message: 'Invalid or expired OTP' });

  let user = await User.findOne({ email });
  if (user) return res.status(400).json({ message: 'Already registered' });

  user = await User.create({ name, email, gender, college });
  res.status(200).json({ message: 'Registered' });
});

// POST /auth/login
router.post('/login', async (req, res) => {
    const { email, otp } = req.body;
    if (!email || !otp) 
      return res.status(400).json({ message: 'Email + otp required' });
  
    const record = await Otp.findOne({ email, otp, type: 'login' });
    if (!record) 
      return res.status(400).json({ message: 'Invalid or expired OTP' });
  
    const user = await User.findOne({ email });
    if (!user) 
      return res.status(404).json({ message: 'User not found' });
  
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
  
    res.json({
      token,
      user: {
        id:       user._id,
        name:     user.name,
        email:    user.email,
        gender:   user.gender,
        college:  user.college,
        imageUrl: user.imageUrl || null
      }
    });
  });



module.exports = router;
