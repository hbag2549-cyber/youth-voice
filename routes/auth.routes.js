const express = require('express');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { protect } = require('../middleware/auth');
const AuditLog = require('../models/AuditLog');

const router = express.Router();

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

router.post('/register', async (req, res) => {
  try {
    const { username, email, password, displayName } = req.body;
    let user = await User.findOne({ $or: [{ email }, { username }] });
    if (user) return res.status(409).json({ message: '이미 가입된 이메일 또는 사용자명입니다' });
    user = new User({ username, email, password, displayName: displayName || username });
    await user.save();
    const token = generateToken(user._id);
    res.status(201).json({ message: '회원가입 성공', token, user });
  } catch (error) {
    res.status(500).json({ message: '회원가입 중 오류' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: '이메일과 비밀번호를 입력하세요' });
    const user = await User.findOne({ email }).select('+password');
    if (!user) return res.status(401).json({ message: '이메일 또는 비밀번호가 잘못되었습니다' });
    if (user.isBanned) return res.status(403).json({ message: '차단된 사용자입니다' });
    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(401).json({ message: '이메일 또는 비밀번호가 잘못되었습니다' });
    user.loginAttempts = 0;
    user.lockUntil = null;
    await user.save();
    const token = generateToken(user._id);
    res.status(200).json({ message: '로그인 성공', token, user });
  } catch (error) {
    res.status(500).json({ message: '로그인 중 오류' });
  }
});

router.get('/verify', protect, (req, res) => {
  res.status(200).json({ message: '유효한 토큰', user: req.user });
});

module.exports = router;
