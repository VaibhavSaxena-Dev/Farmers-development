const express = require('express');
const router = express.Router();
const {
  getTodos,
  getTodo,
  createTodo,
  updateTodo,
  deleteTodo,
  toggleTodo,
  getTodosByCategory,
  getOverdueTodos,
  getImportantTodos,
  getTodoStats
} = require('../controllers/todo.controller');
const { auth } = require('../middleware/auth');

// All routes require authentication
router.use(auth);

// Basic CRUD operations
router.get('/', getTodos);
router.get('/stats', getTodoStats);
router.get('/overdue', getOverdueTodos);
router.get('/important', getImportantTodos);
router.get('/category/:category', getTodosByCategory);
router.get('/:id', getTodo);
router.post('/', createTodo);
router.put('/:id', updateTodo);
router.patch('/:id/toggle', toggleTodo);
router.delete('/:id', deleteTodo);

module.exports = router;
