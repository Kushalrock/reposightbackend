const Repository = require('../models/repomodel');
const Issue = require('../models/issuemodel');

const getRepos = async (req, res) => {
  const { languages, difficulty, topics, page = 1, pageSize = 10 } = req.query;

  try {
    let tagsArray = [];

    // Combine the tags from languages, difficulty, and topics into a single array
    if (languages) {
      tagsArray = tagsArray.concat(languages.split(',').map(tag => tag.trim()));
    }

    if (difficulty) {
      tagsArray = tagsArray.concat(difficulty.split(',').map(tag => tag.trim()));
    }

    if (topics) {
      tagsArray = tagsArray.concat(topics.split(',').map(tag => tag.trim()));
    }

    let query = {};
    if (tagsArray.length > 0) {
      if (tagsArray.length === 1) {
        query = { tags: tagsArray[0] };
      }else{
      query = { tags: { $in: tagsArray } };
      }
    }

    const totalCount = await Repository.countDocuments(query);

    const startIndex = (page - 1) * pageSize;
    const endIndex = Math.min(startIndex + parseInt(pageSize), totalCount);

    const repos = await Repository.find(query)
      .sort({ avg_ratings: -1 }) // Sort by avg_ratings in descending order
      .skip(startIndex)
      .limit(pageSize)
      .exec();

    res.json({ data: repos, totalCount, startIndex, endIndex });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'An error occurred', data: null, status: false });
  }
};



const getRepoIssues = async (req, res) => {
  const { repo_id } = req.params;

  try {
    const issues = await Issue.find({ repo_id });

    res.json({ data: issues, error: null, status: true });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'An error occurred', data: null, status: false });
  }
};

const getReposAndIssues = async (req, res) => {
  const { tags, page = 1, pageSize = 10 } = req.query;

  try {
    let query = {};

    if (tags) {
      const tagsArray = tags.split(',').map(tag => tag.trim());

      if (tagsArray.length === 1) {
        query = { tags: tagsArray[0] };
      } else {
        query = { tags: { $in: tagsArray } };
      }
    }

    const totalCount = await Repository.countDocuments(query);

    const startIndex = (page - 1) * pageSize;
    const endIndex = Math.min(startIndex + parseInt(pageSize), totalCount);

    // Fetch repositories with pagination
    const repos = await Repository.find(query)
      .sort({ avg_ratings: -1 }) // Sort by avg_ratings in descending order
      .skip(startIndex)
      .limit(pageSize)
      .exec();

    // Fetch issues for each repository
    const repoIds = repos.map(repo => repo.repo_id);
    const issues = await Issue.find({ repo_id: { $in: repoIds } }).exec();

    // Combine the repositories and their corresponding issues
    const reposWithIssues = repos.map(repo => {
      return {
        ...repo.toObject(),
        issues: issues.filter(issue => issue.repo_id === repo.repo_id),
      };
    });

    res.json({ data: reposWithIssues, totalCount, startIndex, endIndex });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'An error occurred', data: null, status: false });
  }
};

module.exports = {
  getRepos,
  getRepoIssues,
  getReposAndIssues
};
