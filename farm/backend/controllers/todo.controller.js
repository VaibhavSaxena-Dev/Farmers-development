const Todo = require('../models/todo.model');
const notificationService = require('../services/notificationService');
const voiceService = require('../services/voiceService');

// Get all todos for user
const getTodos = async (req, res) => {
  try {
    const { done, category, priority, isImportant, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    
    const query = { userId: req.user._id };
    
    // Apply filters
    if (done !== undefined) query.done = done === 'true';
    if (category) query.category = category;
    if (priority) query.priority = priority;
    if (isImportant !== undefined) query.isImportant = isImportant === 'true';

    // Sort options
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const todos = await Todo.find(query)
      .sort(sortOptions)
      .lean();

    res.json(todos);

  } catch (error) {
    console.error('Get todos error:', error);
    res.status(500).json({ error: 'Failed to fetch todos' });
  }
};

// Get single todo
const getTodo = async (req, res) => {
  try {
    const todo = await Todo.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!todo) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    res.json(todo);

  } catch (error) {
    console.error('Get todo error:', error);
    res.status(500).json({ error: 'Failed to fetch todo' });
  }
};

// Create new todo
const createTodo = async (req, res) => {
  try {
    const { title, description, due, priority = 'medium', category = 'general', tags = [], isImportant = false } = req.body;

    const todo = new Todo({
      userId: req.user._id,
      title,
      description,
      due: due ? new Date(due) : undefined,
      priority,
      category,
      tags,
      isImportant
    });

    await todo.save();

    // Send notification for all newly created todos
    await notificationService.sendTodoCreatedNotification(todo, req.user);

    res.status(201).json(todo);

  } catch (error) {
    console.error('Create todo error:', error);
    res.status(500).json({ error: 'Failed to create todo' });
  }
};

// Update todo
const updateTodo = async (req, res) => {
  try {
    const { title, description, done, due, priority, category, tags, isImportant } = req.body;

    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (done !== undefined) updateData.done = done;
    if (due !== undefined) updateData.due = due ? new Date(due) : null;
    if (priority !== undefined) updateData.priority = priority;
    if (category !== undefined) updateData.category = category;
    if (tags !== undefined) updateData.tags = tags;
    if (isImportant !== undefined) updateData.isImportant = isImportant;

    // Reset notification flags if due date or importance changed
    if (due !== undefined || isImportant !== undefined) {
      updateData.notificationSent = false;
      updateData.voiceAnnounced = false;
    }

    const todo = await Todo.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      updateData,
      { new: true }
    );

    if (!todo) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    // Send notification if todo became important
    if (isImportant && !req.body.wasImportant) {
      await notificationService.sendImportantTodoNotification(todo, req.user);
    }

    res.json(todo);

  } catch (error) {
    console.error('Update todo error:', error);
    res.status(500).json({ error: 'Failed to update todo' });
  }
};

// Delete todo
const deleteTodo = async (req, res) => {
  try {
    const todo = await Todo.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!todo) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    res.json({ message: 'Todo deleted successfully' });

  } catch (error) {
    console.error('Delete todo error:', error);
    res.status(500).json({ error: 'Failed to delete todo' });
  }
};

// Toggle todo completion
const toggleTodo = async (req, res) => {
  try {
    const todo = await Todo.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!todo) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    todo.done = !todo.done;
    await todo.save();

    res.json(todo);

  } catch (error) {
    console.error('Toggle todo error:', error);
    res.status(500).json({ error: 'Failed to toggle todo' });
  }
};

// Get todos by category
const getTodosByCategory = async (req, res) => {
  try {
    const todos = await Todo.find({
      userId: req.user._id,
      category: req.params.category
    }).sort({ createdAt: -1 });

    res.json(todos);

  } catch (error) {
    console.error('Get todos by category error:', error);
    res.status(500).json({ error: 'Failed to fetch todos by category' });
  }
};

// Get overdue todos
const getOverdueTodos = async (req, res) => {
  try {
    const now = new Date();
    const todos = await Todo.find({
      userId: req.user._id,
      due: { $lt: now },
      done: false
    }).sort({ due: 1 });

    res.json(todos);

  } catch (error) {
    console.error('Get overdue todos error:', error);
    res.status(500).json({ error: 'Failed to fetch overdue todos' });
  }
};

// Get important todos
const getImportantTodos = async (req, res) => {
  try {
    const todos = await Todo.find({
      userId: req.user._id,
      isImportant: true,
      done: false
    }).sort({ createdAt: -1 });

    res.json(todos);

  } catch (error) {
    console.error('Get important todos error:', error);
    res.status(500).json({ error: 'Failed to fetch important todos' });
  }
};

// Get todo statistics
const getTodoStats = async (req, res) => {
  try {
    const userId = req.user._id;
    const now = new Date();

    const stats = await Todo.aggregate([
      { $match: { userId: userId } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          completed: { $sum: { $cond: ['$done', 1, 0] } },
          pending: { $sum: { $cond: ['$done', 0, 1] } },
          important: { $sum: { $cond: ['$isImportant', 1, 0] } },
          overdue: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $lt: ['$due', now] },
                    { $eq: ['$done', false] }
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      }
    ]);

    const result = stats[0] || {
      total: 0,
      completed: 0,
      pending: 0,
      important: 0,
      overdue: 0
    };

    res.json(result);

  } catch (error) {
    console.error('Get todo stats error:', error);
    res.status(500).json({ error: 'Failed to fetch todo statistics' });
  }
};

module.exports = {
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
};
