const express = require('express');
const Like = require('../models/Like');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const { protect } = require('../middleware/auth');
const router = express.Router();

router.post('/', protect, async (req, res) => {
  try {
    const { targetType, target } = req.body;
    if (!['Post', 'Comment'].includes(targetType)) return res.status(400).json({ message: '유효한 대상 타입을 선택하세요' });
    const Model = targetType === 'Post' ? Post : Comment;
    const targetDoc = await Model.findById(target);
    if (!targetDoc) return res.status(404).json({ message: '대상을 찾을 수 없습니다' });
    const existingLike = await Like.findOne({ user: req.user._id, target, targetType });
    if (existingLike) return res.status(409).json({ message: '이미 좋아요를 누른 항목입니다' });
    const like = new Like({ user: req.user._id, target, targetType });
    await like.save();
    await Model.findByIdAndUpdate(target, { $push: { likes: req.user._id }, $inc: { likeCount: 1 } });
    res.status(201).json({ message: '좋아요 등록 성공', data: like });
  } catch (error) {
    res.status(500).json({ message: '좋아요 등록 중 오류' });
  }
});

router.delete('/:id', protect, async (req, res) => {
  try {
    const like = await Like.findById(req.params.id);
    if (!like) return res.status(404).json({ message: '좋아요를 찾을 수 없습니다' });
    if (like.user.toString() !== req.user._id.toString()) return res.status(403).json({ message: '삭제 권한이 없습니다' });
    const Model = like.targetType === 'Post' ? Post : Comment;
    await Model.findByIdAndUpdate(like.target, { $pull: { likes: req.user._id }, $inc: { likeCount: -1 } });
    await Like.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: '좋아요 취소 성공' });
  } catch (error) {
    res.status(500).json({ message: '좋아요 취소 중 오류' });
  }
});

module.exports = router;
