const express = require('express');
const router = express.Router();
const ratingController = require('../controllers/ratingcontroller');

// Example: GET /api/ratings/:repo_id
router.get('/:repo_id', ratingController.getRatingsByRepoId);

module.exports = router;
