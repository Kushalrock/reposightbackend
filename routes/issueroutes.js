const express = require('express');
const router = express.Router();
const issueController = require('../controllers/issuecontroller');

// GET /api/issues/:repo_id
router.get('/:repo_id', issueController.getIssues);

// GET /api/issues/:repo_id/difficulty
router.get('/:repo_id/difficulty', issueController.getIssuesWithDifficulty);

module.exports = router;
