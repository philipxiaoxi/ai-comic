const express = require('express');
const router = express.Router();
const appController = require('../controllers/appController');
const multer = require('multer');
const path = require('path');
const { auth } = require('../middleware/auth');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = file.fieldname === 'icon'
      ? path.join(__dirname, '../../uploads/icons')
      : path.join(__dirname, '../../uploads/packages');
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'package') {
      if (file.mimetype === 'application/zip' || file.mimetype === 'application/x-zip-compressed') {
        cb(null, true);
      } else {
        cb(new Error('应用包必须是ZIP格式'));
      }
    } else if (file.fieldname === 'icon') {
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('图标必须是图片格式'));
      }
    } else {
      cb(null, true);
    }
  }
});

// Public routes
router.get('/', appController.getApps);
router.get('/:id', appController.getAppById);
router.get('/:id/download', appController.downloadApp);

// Protected routes (require auth)
router.post('/', auth, upload.fields([
  { name: 'package', maxCount: 1 },
  { name: 'icon', maxCount: 1 }
]), appController.createApp);

router.put('/:id', auth, upload.fields([
  { name: 'package', maxCount: 1 },
  { name: 'icon', maxCount: 1 }
]), appController.updateApp);

router.delete('/:id', auth, appController.deleteApp);

module.exports = router;
