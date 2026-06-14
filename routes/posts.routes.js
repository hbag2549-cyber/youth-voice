const express = require('express');
const Post = require('../models/Post');
const Category = require('../models/Category');
const { protect } = require('../middleware/auth');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { category, page = 1, limit = 10 } = req.query;
    const query = { isArchived: false };
    if (category) query.category = category;
    const posts = await Post.find(query)
      .populate('author', 'username displayName profileImage')
      .populate('category', 'name slug')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    const total = await Post.countDocuments(query);
    res.status(200).json({ message: '게시물 조회 성공', data: posts, pagination: { total, page: parseInt(page), limit: parseInt(limit) } });
  } catch (error) {
    res.status(500).json({ message: '게시물 조회 중 오류' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } }, { new: true })
      .populate('author', 'username displayName profileImage')
      .populate('category', 'name slug');
    if (!post) return res.status(404).json({ message: '게시물을 찾을 수 없습니다' });
    res.status(200).json({ message: '게시물 조회 성공', data: post });
  } catch (error) {
    res.status(500).json({ message: '게시물 조회 중 오류' });
  }
});

router.post('/', protect, async (req, res) => {
  try {
    const { title, content, category, tags, image } = req.body;
    if (!title || !content || !category) return res.status(400).json({ message: '필수 필드를 입력하세요' });
    const categoryDoc = await Category.findById(category);
    if (!categoryDoc) return res.status(404).json({ message: '카테고리를 찾을 수 없습니다' });
    const post = new Post({ title, content, category, author: req.user._id, tags: tags || [], image });
    await post.save();
    await post.populate('author', 'username displayName profileImage');
    await post.populate('category', 'name slug');
    await Category.findByIdAndUpdate(category, { $inc: { postCount: 1 } });
    res.status(201).json({ message: '게시물 생성 성공', data: post });
  } catch (error) {
    res.status(500).json({ message: '게시물 생성 중 오류' });
  }
});

router.put('/:id', protect, async (req, res) => {
  try {
    let post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: '게시물을 찾을 수 없습니다' });
    if (post.author.toString() !== req.user._id.toString() && req.user.role !== 'admin')
      return res.status(403).json({ message: '수정 권한이 없습니다' });
    const { title, content, tags } = req.body;
    if (title) post.title = title;
    if (content) post.content = content;
    if (tags) post.tags = tags;
    await post.save();
    await post.populate('author', 'username displayName profileImage');
    res.status(200).json({ message: '게시물 업데이트 성공', data: post });
  } catch (error) {
    res.status(500).json({ message: '게시물 업데이트 중 오류' });
  }
});

router.delete('/:id', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: '게시물을 찾을 수 없습니다' });
    if (post.author.toString() !== req.user._id.toString() && req.user.role !== 'admin')
      return res.status(403).json({ message: '삭제 권한이 없습니다' });
    await Post.findByIdAndDelete(req.params.id);
    await Category.findByIdAndUpdate(post.category, { $inc: { postCount: -1 } });
    res.status(200).json({ message: '게시물 삭제 성공' });
  } catch (error) {
    res.status(500).json({ message: '게시물 삭제 중 오류' });
  }
});

module.exports = router;
