const express = require('express');
const router = express.Router();
const { getGroupes, createGroupe, updateGroupe, deleteGroupe } = require('../controllers/groupeController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getGroupes);
router.post('/', protect, createGroupe);
router.patch('/:id', protect, updateGroupe);
router.delete('/:id', protect, deleteGroupe);

module.exports = router;
