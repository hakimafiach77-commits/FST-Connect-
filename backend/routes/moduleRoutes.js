const express = require('express');
const router = express.Router();
const { getModules, getModuleDetails, createModule, updateModule, deleteModule } = require('../controllers/moduleController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', protect, getModules);
router.get('/:id', protect, getModuleDetails);
router.post('/', protect, authorize('admin'), createModule);
router.patch('/:id', protect, authorize('admin'), updateModule);
router.delete('/:id', protect, authorize('admin'), deleteModule);

module.exports = router;
