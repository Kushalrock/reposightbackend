const express = require('express');
const router = express.Router();
const repoController = require('../controllers/repocontroller');

// GET /api/repos
router.get('/', repoController.getRepos);

// GET /api/repos/:repo_id/issues
router.get('/:repo_id/issues', repoController.getRepoIssues);

module.exports = router;
