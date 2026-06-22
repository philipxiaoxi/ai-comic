require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

// 启动时校验必要环境变量
const requiredEnvVars = ['JWT_SECRET'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.error(`[FATAL] 缺少必要的环境变量: ${missingEnvVars.join(', ')}`);
  console.error('请在 .env 文件中配置以下环境变量后重新启动服务:');
  missingEnvVars.forEach(varName => {
    console.error(`  ${varName}=<your-secret-value>`);
  });
  process.exit(1);
}

// 校验JWT_SECRET强度
if (process.env.JWT_SECRET.length < 32) {
  console.error('[FATAL] JWT_SECRET 长度不足32位，请使用更安全的密钥');
  process.exit(1);
}

const appRoutes = require('./routes/appRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Ensure upload directories exist
const dirs = [
  path.join(__dirname, '../uploads'),
  path.join(__dirname, '../uploads/packages'),
  path.join(__dirname, '../uploads/icons')
];

dirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/v1/apps', appRoutes);
app.use('/api/v1/auth', authRoutes);

// Config endpoint
app.get('/api/v1/config/api-base-url', (req, res) => {
  res.json({ baseUrl: process.env.API_BASE_URL || `http://localhost:${PORT}` });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling middleware
const isProduction = process.env.NODE_ENV === 'production';

app.use((err, req, res, next) => {
  console.error(err.stack);
  
  // 生产环境不暴露内部错误细节
  if (isProduction) {
    res.status(500).json({ message: '服务器内部错误' });
  } else {
    res.status(500).json({ message: '服务器内部错误', error: err.message });
  }
});

// Connect to MongoDB and start server
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/superapp')
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

module.exports = app;
