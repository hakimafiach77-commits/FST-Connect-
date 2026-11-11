const express = require('express');
const router = express.Router();
const { getFullState } = require('../controllers/syncController');
const { protect } = require('../middleware/authMiddleware');

// Big Sync - Returns full state based on role
router.get('/', protect, getFullState);

module.exports = router;
