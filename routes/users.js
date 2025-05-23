// routes/users.js
const express      = require('express');
const router       = express.Router();
const multer       = require('multer');
const sharp        = require('sharp');
const streamifier  = require('streamifier');
const cloudinary   = require('../config/cloudinary');
const User         = require('../models/User');
const auth         = require('../middleware/auth');

// switch multer to memory storage so we get a buffer
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed'));
    }
    cb(null, true);
  }
});

router.post('/:id/image', auth, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // 1) compress & resize the buffer
    const compressedBuffer = await sharp(req.file.buffer)
      .resize({ width: 800 })          // max width 800px
      .jpeg({ quality: 75 })           // compress to 75% quality
      .toBuffer();

    // 2) stream to Cloudinary
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: 'user_images' },
      async (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          return res.status(500).json({ message: 'Image upload failed' });
        }

        // 3) save URL on user
        const user = await User.findByIdAndUpdate(
          req.params.id,
          { imageUrl: result.secure_url },
          { new: true }
        );
        if (!user) return res.status(404).json({ message: 'User not found' });

        res.json({ imageUrl: user.imageUrl });
      }
    );

    // pipe the compressed buffer into Cloudinary
    streamifier.createReadStream(compressedBuffer).pipe(uploadStream);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
