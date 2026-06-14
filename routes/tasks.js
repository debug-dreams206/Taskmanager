const express = require('express');
const { body } = require('express-validator');
const {
  getTasks, getTask, createTask, updateTask, deleteTask, toggleStatus,
} = require('../controllers/taskController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All task routes are protected
router.use(protect);

const taskRules = [
  body('title').trim().isLength({ min: 2, max: 100 }).withMessage('Title must be between 2 and 100 characters'),
  body('description').optional().isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters'),
  body('priority').optional().isIn(['low', 'medium', 'high']).withMessage('Priority must be low, medium, or high'),
  body('status').optional().isIn(['pending', 'completed']).withMessage('Status must be pending or completed'),
  body('dueDate').optional({ nullable: true }).isISO8601().withMessage('Invalid date format'),
];

router.route('/').get(getTasks).post(taskRules, createTask);
router.route('/:id').get(getTask).put(taskRules, updateTask).delete(deleteTask);
router.patch('/:id/toggle', toggleStatus);

module.exports = router;
