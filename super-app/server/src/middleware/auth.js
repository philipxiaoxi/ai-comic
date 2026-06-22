const jwt = require('jsonwebtoken');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: '未提供认证令牌' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: '认证失败' });
  }
};

const adminOnly = async (req, res, next) => {
  if (req.admin.role !== 'admin') {
    return res.status(403).json({ message: '权限不足' });
  }
  next();
};

module.exports = { auth, adminOnly };
