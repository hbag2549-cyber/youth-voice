const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) return res.status(401).json({ message: '인증되지 않은 사용자입니다' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(401).json({ message: '사용자를 찾을 수 없습니다' });
    if (user.isBanned) return res.status(403).json({ message: '차단된 사용자입니다', reason: user.banReason });
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: '유효하지 않은 토큰입니다' });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: '접근 권한이 없습니다' });
    }
    next();
  };
};

module.exports = { protect, authorize };
