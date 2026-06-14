const express = require('express');
const Report = require('../models/Report');
const User = require('../models/User');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const { protect, authorize } = require('../middleware/auth');
const router = express.Router();

router.post('/', protect, async (req, res) => {
  try {
    const { targetType, target, reason, description } = req.body;
    if (!['Post', 'Comment', 'User'].includes(targetType)) return res.status(400).json({ message: '유효한 대상 타입을 선택하세요' });
    const Model = targetType === 'Post' ? Post : targetType === 'Comment' ? Comment : User;
    const targetDoc = await Model.findById(target);
    if (!targetDoc) return res.status(404).json({ message: '신고 대상을 찾을 수 없습니다' });
    const existingReport = await Report.findOne({ targetType, target, reportedBy: req.user._id });
    if (existingReport) return res.status(409).json({ message: '이미 신고한 항목입니다' });
    const report = new Report({ targetType, target, reportedBy: req.user._id, reason, description });
    await report.save();
    await Model.findByIdAndUpdate(target, { $inc: { reportCount: 1 } });
    res.status(201).json({ message: '신고 접수 성공', data: report });
  } catch (error) {
    res.status(500).json({ message: '신고 접수 중 오류' });
  }
});

router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const { status = 'pending', page = 1, limit = 20 } = req.query;
    const query = {};
    if (status) query.status = status;
    const reports = await Report.find(query)
      .populate('reportedBy', 'username email')
      .populate('resolution.reviewedBy', 'username')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    const total = await Report.countDocuments(query);
    res.status(200).json({ message: '신고 조회 성공', data: reports, pagination: { total, page: parseInt(page) } });
  } catch (error) {
    res.status(500).json({ message: '신고 조회 중 오류' });
  }
});

router.get('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const report = await Report.findById(req.params.id)
      .populate('reportedBy', 'username email')
      .populate('resolution.reviewedBy', 'username');
    if (!report) return res.status(404).json({ message: '신고를 찾을 수 없습니다' });
    res.status(200).json({ message: '신고 조회 성공', data: report });
  } catch (error) {
    res.status(500).json({ message: '신고 조회 중 오류' });
  }
});

router.put('/:id/review', protect, authorize('admin'), async (req, res) => {
  try {
    const { action, notes } = req.body;
    if (!['warning', 'suspension', 'ban', 'delete', 'no_action'].includes(action)) return res.status(400).json({ message: '유효한 조치를 선택하세요' });
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ message: '신고를 찾을 수 없습니다' });
    report.status = 'reviewed';
    report.resolution = { action, notes, reviewedBy: req.user._id, reviewedAt: new Date() };
    await report.save();
    if (action === 'delete') {
      if (report.targetType === 'Post') await Post.findByIdAndDelete(report.target);
      else if (report.targetType === 'Comment') await Comment.findByIdAndUpdate(report.target, { isDeleted: true });
    } else if (action === 'ban') {
      let userId = report.targetType === 'User' ? report.target : null;
      if (!userId && report.targetType === 'Post') {
        const post = await Post.findById(report.target);
        userId = post?.author;
      } else if (!userId && report.targetType === 'Comment') {
        const comment = await Comment.findById(report.target);
        userId = comment?.author;
      }
      if (userId) await User.findByIdAndUpdate(userId, { isBanned: true, banReason: report.reason });
    }
    res.status(200).json({ message: '신고 검토 완료', data: report });
  } catch (error) {
    res.status(500).json({ message: '신고 검토 중 오류' });
  }
});

module.exports = router;
