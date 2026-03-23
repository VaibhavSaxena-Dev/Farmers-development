const express = require('express');
const jwt = require('jsonwebtoken');
const Todo = require('../models/Todo');
const router = express.Router();

// auth middleware
const authMiddleware = (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ message: 'No token' });
  const token = auth.split(' ')[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// GET /api/todos
router.get('/', authMiddleware, async (req, res) => {
  try {
    const todos = await Todo.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(todos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/todos
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { title, description, isImportant } = req.body;
    const todo = await Todo.create({
      title,
      description: description || '',
      isImportant: !!isImportant,
      user: req.user.id
    });
    res.status(201).json(todo);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUT /api/todos/:id
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const todo = await Todo.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      req.body,
      { new: true }
    );
    if (!todo) return res.status(404).json({ message: 'Not found' });
    res.json(todo);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE /api/todos/:id
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const todo = await Todo.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!todo) return res.status(404).json({ message: 'Not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;