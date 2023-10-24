const express = require('express');
const cassandra = require('cassandra-driver');
const app = express();
const port = 5000;

const client = new cassandra.Client({
  contactPoints: ['localhost'],
  localDataCenter: 'datacenter1',
});

app.get('/api/getReposAndIssues', async (req, res) => {
  const { languages, difficulty, topics, page = 1, pageSize = 10 } = req.query;

  try {
    let query = `SELECT * FROM reposight.repos`;
    const params = [];

    if (languages && languages !== '') {
      query += ' WHERE tags CONTAINS ?';
      params.push(languages);

      if (topics && topics !== '') {
        query += ' AND tags CONTAINS ?';
        params.push(topics);
      }
    }

    const reposResult = await client.execute(query, params, { prepare: true });
    const repos = reposResult.rows;

    // Sort the repos by avg_ratings in descending order
    repos.sort((a, b) => b.avg_ratings - a.avg_ratings);

    const data = { repos: {} };

    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + parseInt(pageSize);

    for (let i = startIndex; i < endIndex && i < repos.length; i++) {
      const repo = repos[i];

      // Get associated issues for this repo
      const issuesQuery = `SELECT * FROM reposight.issues WHERE repo_id = ?`;
      const issuesParams = [repo.repo_id];
      const issuesResult = await client.execute(issuesQuery, issuesParams, { prepare: true });
      const issues = issuesResult.rows;

      // Sum of issues by difficulty for this repo
      const beginnerIssues = issues.filter(issue => issue.difficulty === 'beginner').length;
      const intermediateIssues = issues.filter(issue => issue.difficulty === 'intermediate').length;
      const advancedIssues = issues.filter(issue => issue.difficulty === 'advanced').length;

      data.repos[repo.repo_id] = {
        ...repo,
        issues: issues,
        beginnerIssues,
        intermediateIssues,
        advancedIssues,
      };
    }

    // Return the JSON response
    res.json({ data, error: null, status: true });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'An error occurred', data: null, status: false });
  }
});
app.get('/api/getRepoIssues', async (req, res) => {
    const { repo_id } = req.query;
    const difficulty = req.query.difficulty;
  
    if (!repo_id) {
      return res.status(400).json({ error: 'repo_id parameter is required', data: null, status: false });
    }
  
    try {
      // Construct the CQL query to fetch issues for a specific repo and difficulty
      let query = `SELECT * FROM reposight.issues WHERE repo_id = ?`;
      const params = [repo_id];
  
      if (difficulty && difficulty !== '') {
        query += ' AND difficulty = ?';
        params.push(difficulty);
      }
  
      const issuesResult = await client.execute(query, params, { prepare: true });
      const issues = issuesResult.rows;
  
      // Return the JSON response
      res.json({ data: issues, error: null, status: true });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'An error occurred', data: null, status: false });
    }
  });
  

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
