const Task = require('../models/Task');
const { validationResult } = require('express-validator');

// @route  GET /api/tasks
// @access Private
const getTasks = async (req, res, next) => {
  try {
    const { status, priority, search, sort = '-createdAt', page = 1, limit = 10 } = req.query;

    // Build filter object — always scope to the authenticated user
    const filter = { userId: req.user._id };
    if (status && ['pending', 'completed'].includes(status)) filter.status = status;
    if (priority && ['low', 'medium', 'high'].includes(priority)) filter.priority = priority;
    if (search && search.trim()) {
      filter.$or = [
        { title: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    // Pagination
    const pageNum  = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const skip     = (pageNum - 1) * limitNum;

    // Allowed sort fields
    const allowedSort = ['createdAt', '-createdAt', 'dueDate', '-dueDate', 'priority', '-priority', 'title', '-title'];
    const sortField = allowedSort.includes(sort) ? sort : '-createdAt';

    const [tasks, total] = await Promise.all([
      Task.find(filter).sort(sortField).skip(skip).limit(limitNum).lean(),
      Task.countDocuments(filter),
    ]);

    // Summary stats for dashboard
    const [totalCount, completedCount, pendingCount] = await Promise.all([
      Task.countDocuments({ userId: req.user._id }),
      Task.countDocuments({ userId: req.user._id, status: 'completed' }),
      Task.countDocuments({ userId: req.user._id, status: 'pending' }),
    ]);

    res.status(200).json({
      success: true,
      data: tasks,
      pagination: { total, page: pageNum, limit: limitNum, pages: Math.ceil(total / limitNum) },
      stats: { total: totalCount, completed: completedCount, pending: pendingCount },
    });
  } catch (error) {
    next(error);
  }
};

// @route  GET /api/tasks/:id
// @access Private
const getTask = async (req, res, next) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, userId: req.user._id });
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    res.status(200).json({ success: true, data: task });
  } catch (error) {
    next(error);
  }
};

// @route  POST /api/tasks
// @access Private
const createTask = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }

    const { title, description, priority, dueDate } = req.body;
    const task = await Task.create({ title, description, priority, dueDate: dueDate || null, userId: req.user._id });

    res.status(201).json({ success: true, message: 'Task created', data: task });
  } catch (error) {
    next(error);
  }
};

// @route  PUT /api/tasks/:id
// @access Private
const updateTask = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }

    const { title, description, priority, status, dueDate } = req.body;

    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { $set: { title, description, priority, status, dueDate: dueDate || null } },
      { new: true, runValidators: true }
    );

    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    res.status(200).json({ success: true, message: 'Task updated', data: task });
  } catch (error) {
    next(error);
  }
};

// @route  DELETE /api/tasks/:id
// @access Private
const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    res.status(200).json({ success: true, message: 'Task deleted' });
  } catch (error) {
    next(error);
  }
};

// @route  PATCH /api/tasks/:id/toggle
// @access Private
const toggleStatus = async (req, res, next) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, userId: req.user._id });
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

    task.status = task.status === 'pending' ? 'completed' : 'pending';
    await task.save();

    res.status(200).json({ success: true, message: `Task marked as ${task.status}`, data: task });
  } catch (error) {
    next(error);
  }
};

module.exports = { getTasks, getTask, createTask, updateTask, deleteTask, toggleStatus };
