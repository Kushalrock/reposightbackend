const express = require('express');
const router = express.Router();
const issueController = require('../controllers/issuecontroller');

// GET /api/issues
router.get('/', issueController.getIssues);

module.exports = router;
