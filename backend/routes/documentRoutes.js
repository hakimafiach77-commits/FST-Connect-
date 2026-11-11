const express = require('express');
const router = express.Router();
const { createDocument, getModuleDocuments, deleteDocument } = require('../controllers/documentController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', protect, authorize('teacher', 'admin'), createDocument);
router.get('/module/:idModule', protect, getModuleDocuments);
router.delete('/:id', protect, authorize('teacher', 'admin'), deleteDocument);

module.exports = router;
