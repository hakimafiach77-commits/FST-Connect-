const express = require('express');
const router = express.Router();
const { getFormations, getFormationDetails } = require('../controllers/formationController');
const { protect } = require('../middleware/authMiddleware');

// Get all open training programs
router.get('/', protect, getFormations);

// Get specific training details
router.get('/:id', protect, getFormationDetails);

module.exports = router;
