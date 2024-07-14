const Issue = require('../models/issuemodel');

const getIssues = async (req, res) => {
  try {
    const issues = await Issue.find();

    res.json({ data: issues, error: null, status: true });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'An error occurred', data: null, status: false });
  }
};

module.exports = {
  getIssues,
};
