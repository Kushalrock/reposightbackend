const Issue = require('../models/issuemodel');

const getIssues = async (req, res) => {
  const { repo_id } = req.params; // Access path parameter

  try {
    let query = {};
    if (repo_id) {
      query.repo_id = repo_id;
    }

    const issues = await Issue.find(query);

    res.json({ data: issues, error: null, status: true });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'An error occurred', data: null, status: false });
  }
};

const getIssuesWithDifficulty = async (req, res) => {
  const { repo_id } = req.params; // Access path parameter
  const { difficulty } = req.query; // Access query parameter

  try {
    let query = {};
    if (repo_id) {
      query.repo_id = repo_id;
    }
    if (difficulty) {
      query.difficulty = difficulty;
    }

    const issues = await Issue.find(query);

    res.json({ data: issues, error: null, status: true });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'An error occurred', data: null, status: false });
  }
};

module.exports = {
  getIssues,
  getIssuesWithDifficulty
};
