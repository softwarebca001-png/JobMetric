const express = require('express');
const router = express.Router();
const { downloadFile } = require('../controllers/fileController');
const { verifyToken } = require('../middleware/auth');

// Download file route (requires authentication)
router.get('/:fileId', verifyToken, downloadFile);

module.exports = router;
