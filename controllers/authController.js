const User = require('../models/User');
const jwt  = require('jsonwebtoken');
const { validationResult } = require('express-validator');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });

// ── POST /api/auth/register ───────────────────────────────────────────────
const register = async (req, res, next) => {
  try {
    // 1. Validate inputs
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }

    const { name, email, password } = req.body;

    // 2. Guard: all fields present (belt-and-suspenders beyond express-validator)
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required' });
    }

    // 3. Duplicate email check
    const exists = await User.findOne({ email: email.toLowerCase().trim() });
    if (exists) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists' });
    }

    // 4. Create user (password is hashed in the model pre-save hook)
    const user  = await User.create({ name: name.trim(), email: email.toLowerCase().trim(), password });
    const token = signToken(user._id);

    return res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token,
      user: { id: user._id, name: user.name, email: user.email, createdAt: user.createdAt },
    });
  } catch (err) {
    // Log the real error server-side so you can see it in the terminal
    console.error('[register] error:', err.message, err.stack);
    next(err);
  }
};

// ── POST /api/auth/login ─────────────────────────────────────────────────
const login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    // Must explicitly select password because schema has select: false
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = signToken(user._id);

    return res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      token,
      user: { id: user._id, name: user.name, email: user.email, createdAt: user.createdAt },
    });
  } catch (err) {
    console.error('[login] error:', err.message, err.stack);
    next(err);
  }
};

// ── GET /api/auth/me ─────────────────────────────────────────────────────
const getMe = async (req, res, next) => {
  try {
    return res.status(200).json({
      success: true,
      user: { id: req.user._id, name: req.user.name, email: req.user.email, createdAt: req.user.createdAt },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, getMe };
