// utils/email.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host:    process.env.SMTP_HOST,
  port:    +process.env.SMTP_PORT,
  secure:  false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function sendOtpEmail(email, otp) {
  await transporter.sendMail({
    from:    `"No-Reply" <${process.env.SMTP_USER}>`,
    to:      email,
    subject: 'Your OTP Code',
    text:    `Your OTP is ${otp}. It expires in 5 minutes.`,
  });
}

module.exports = { sendOtpEmail };
