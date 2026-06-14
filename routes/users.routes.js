const express = require('express');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');
const router = express.Router();

router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: '사용자를 찾을 수 없습니다' });
    res.status(200).json({ message: '사용자 프로필 조회 성공', data: user });
  } catch (error) {
    res.status(500).json({ message: '사용자 조회 중 오류' });
  }
});

router.put('/profile/update', protect, async (req, res) => {
  try {
    const { displayName, bio, profileImage } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: '사용자를 찾을 수 없습니다' });
    if (displayName) user.displayName = displayName;
    if (bio) user.bio = bio;
    if (profileImage) user.profileImage = profileImage;
    await user.save();
    res.status(200).json({ message: '프로필 업데이트 성공', data: user });
  } catch (error) {
    res.status(500).json({ message: '프로필 업데이트 중 오류' });
  }
});

router.post('/:id/ban', protect, authorize('admin'), async (req, res) => {
  try {
    const { reason } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: '사용자를 찾을 수 없습니다' });
    user.isBanned = true;
    user.banReason = reason || '커뮤니티 가이드 위반';
    await user.save();
    res.status(200).json({ message: '사용자 차단 성공', data: user });
  } catch (error) {
    res.status(500).json({ message: '사용자 차단 중 오류' });
  }
});

router.post('/:id/unban', protect, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: '사용자를 찾을 수 없습니다' });
    user.isBanned = false;
    user.banReason = null;
    await user.save();
    res.status(200).json({ message: '사용자 차단 해제 성공', data: user });
  } catch (error) {
    res.status(500).json({ message: '사용자 차단 해제 중 오류' });
  }
});

router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const users = await User.find()
      .select('-password')
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    const total = await User.countDocuments();
    res.status(200).json({ message: '사용자 조회 성공', data: users, pagination: { total, page: parseInt(page) } });
  } catch (error) {
    res.status(500).json({ message: '사용자 조회 중 오류' });
  }
});

module.exports = router;
