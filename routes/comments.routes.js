const express = require('express');
const Comment = require('../models/Comment');
const Post = require('../models/Post');
const { protect } = require('../middleware/auth');
const router = express.Router();

router.get('/post/:postId', async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ message: '게시물을 찾을 수 없습니다' });
    const comments = await Comment.find({ post: req.params.postId, isDeleted: false, parentComment: null })
      .populate('author', 'username displayName profileImage')
      .populate({ path: 'replies', populate: { path: 'author', select: 'username displayName profileImage' } })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    const total = await Comment.countDocuments({ post: req.params.postId, isDeleted: false, parentComment: null });
    res.status(200).json({ message: '댓글 조회 성공', data: comments, pagination: { total, page: parseInt(page), limit: parseInt(limit) } });
  } catch (error) {
    res.status(500).json({ message: '댓글 조회 중 오류' });
  }
});

router.post('/', protect, async (req, res) => {
  try {
    const { content, post, parentComment } = req.body;
    if (!content || !post) return res.status(400).json({ message: '필수 필드를 입력하세요' });
    const postDoc = await Post.findById(post);
    if (!postDoc) return res.status(404).json({ message: '게시물을 찾을 수 없습니다' });
    const comment = new Comment({ content, post, author: req.user._id, parentComment: parentComment || null });
    await comment.save();
    await comment.populate('author', 'username displayName profileImage');
    if (parentComment) {
      await Comment.findByIdAndUpdate(parentComment, { $push: { replies: comment._id } });
    }
    await Post.findByIdAndUpdate(post, { $inc: { commentCount: 1 } });
    res.status(201).json({ message: '댓글 생성 성공', data: comment });
  } catch (error) {
    res.status(500).json({ message: '댓글 생성 중 오류' });
  }
});

router.put('/:id', protect, async (req, res) => {
  try {
    let comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: '댓글을 찾을 수 없습니다' });
    if (comment.author.toString() !== req.user._id.toString() && req.user.role !== 'admin')
      return res.status(403).json({ message: '수정 권한이 없습니다' });
    const { content } = req.body;
    if (content) comment.content = content;
    await comment.save();
    await comment.populate('author', 'username displayName profileImage');
    res.status(200).json({ message: '댓글 업데이트 성공', data: comment });
  } catch (error) {
    res.status(500).json({ message: '댓글 업데이트 중 오류' });
  }
});

router.delete('/:id', protect, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: '댓글을 찾을 수 없습니다' });
    if (comment.author.toString() !== req.user._id.toString() && req.user.role !== 'admin')
      return res.status(403).json({ message: '삭제 권한이 없습니다' });
    comment.isDeleted = true;
    comment.deletedReason = '사용자에 의해 삭제됨';
    await comment.save();
    await Post.findByIdAndUpdate(comment.post, { $inc: { commentCount: -1 } });
    res.status(200).json({ message: '댓글 삭제 성공' });
  } catch (error) {
    res.status(500).json({ message: '댓글 삭제 중 오류' });
  }
});

module.exports = router;
