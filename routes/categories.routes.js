const express = require('express');
const Category = require('../models/Category');
const { protect, authorize } = require('../middleware/auth');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true }).sort({ createdAt: -1 });
    res.status(200).json({ message: '카테고리 조회 성공', data: categories });
  } catch (error) {
    res.status(500).json({ message: '카테고리 조회 중 오류' });
  }
});

router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    const { name, description, icon, color } = req.body;
    if (!name) return res.status(400).json({ message: '카테고리명을 입력하세요' });
    const category = new Category({ name, description, icon, color, createdBy: req.user._id });
    await category.save();
    res.status(201).json({ message: '카테고리 생성 성공', data: category });
  } catch (error) {
    res.status(500).json({ message: '카테고리 생성 중 오류' });
  }
});

router.put('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const { name, description, icon, color, isActive } = req.body;
    let category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ message: '카테고리를 찾을 수 없습니다' });
    if (name) category.name = name;
    if (description) category.description = description;
    if (icon) category.icon = icon;
    if (color) category.color = color;
    if (isActive !== undefined) category.isActive = isActive;
    await category.save();
    res.status(200).json({ message: '카테고리 업데이트 성공', data: category });
  } catch (error) {
    res.status(500).json({ message: '카테고리 업데이트 중 오류' });
  }
});

router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    await Category.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: '카테고리 삭제 성공' });
  } catch (error) {
    res.status(500).json({ message: '카테고리 삭제 중 오류' });
  }
});

module.exports = router;
