const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { auth, permit } = require('../middleware/auth');

// Admin: get all users
router.get('/', auth, permit('admin'), async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// Admin: update user role
router.put('/:id/role', auth, permit('admin'), async (req, res) => {
  try {
    const { role } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.role = role;
    await user.save();
    res.json({ message: 'Role updated', user: { id: user._id, role: user.role } });
  } catch (err) {
    res.status(500).send('Server error');
  }
});

module.exports = router;
