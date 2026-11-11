const express = require('express');
const router = express.Router();
const { requestStage, getMyStages } = require('../controllers/stageController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Request convention - Student Only
router.post('/request', protect, authorize('student'), requestStage);

// Get my internships - Student Only
router.get('/me', protect, authorize('student'), getMyStages);

module.exports = router;
