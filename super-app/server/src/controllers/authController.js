const Admin = require('../models/Admin');
const jwt = require('jsonwebtoken');

const isProduction = process.env.NODE_ENV === 'production';

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    const admin = await Admin.findOne({ username });
    if (!admin) {
      return res.status(401).json({ message: '用户名或密码错误' });
    }

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: '用户名或密码错误' });
    }

    const token = jwt.sign(
      { id: admin._id, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      admin: {
        id: admin._id,
        username: admin.username,
        role: admin.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: '登录失败，请稍后重试' });
  }
};

exports.register = async (req, res) => {
  try {
    const { username, password, role, inviteCode } = req.body;

    // 邀请码校验：必须提供正确的邀请码才能注册
    const validInviteCode = process.env.REGISTER_INVITE_CODE;
    if (!validInviteCode) {
      console.error('REGISTER_INVITE_CODE 环境变量未配置');
      return res.status(500).json({ message: '注册服务暂不可用' });
    }

    if (!inviteCode || inviteCode !== validInviteCode) {
      return res.status(403).json({ message: '邀请码无效，无法注册' });
    }

    const existingAdmin = await Admin.findOne({ username });
    if (existingAdmin) {
      return res.status(400).json({ message: '用户名已存在' });
    }

    // 限制角色：通过邀请码注册的用户默认为editor角色
    const admin = new Admin({ 
      username, 
      password, 
      role: role === 'admin' ? 'editor' : (role || 'editor')
    });
    await admin.save();

    res.status(201).json({ message: '注册成功' });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: '注册失败，请稍后重试' });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin.id).select('-password');
    res.json(admin);
  } catch (error) {
    console.error('GetProfile error:', error);
    res.status(500).json({ message: '获取用户信息失败' });
  }
};
