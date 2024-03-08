const express = require('express');
const cassandra = require('cassandra-driver');
const app = express();
const port = 5000;
const cors=require('cors');


const client = new cassandra.Client({
  contactPoints: ['localhost'],
  localDataCenter: 'datacenter1',
});

app.use(cors());

app.get('/api/getReposAndIssues', async (req, res) => {
  let { languages, difficulty, topics, page = 1, pageSize = 10 } = req.query;

  try {
    let query = `SELECT * FROM reposight.repos`;
    const params = [];

    // Constructing query conditions for languages
    if (languages && languages !== '') {
      languages = Array.isArray(languages) ? languages : [languages]; // Ensure languages is an array
      query += ' WHERE ';
      const languageConditions = languages.map((language, index) => {
        params.push(language.trim());
        return `tags CONTAINS ?`;
      });
      query += languageConditions.join(' AND ');

      // Constructing query conditions for topics
      if (topics && topics !== '') {
        topics = Array.isArray(topics) ? topics : [topics]; // Ensure topics is an array
        const topicConditions = topics.map(topic => {
          params.push(topic.trim());
          return ` AND tags CONTAINS ?`;
        });
        query += topicConditions.join('');
      }

      query += ' ALLOW FILTERING';
      console.log(query, params);
    }

    // Execute the query
    const reposResult = await client.execute(query, params, { prepare: true });
    const repos = reposResult.rows;

    // Sorting repos by avg_ratings in descending order
    repos.sort((a, b) => b.avg_ratings - a.avg_ratings);

    // Pagination
    const startIndex = (page - 1) * pageSize;
    const endIndex = Math.min(startIndex + parseInt(pageSize), repos.length);

    const data = { repos: {} };

    // Fetch associated issues for each repo
    for (let i = startIndex; i < endIndex; i++) {
      const repo = repos[i];

      // Construct query to fetch issues for a specific repo and difficulty
      const issuesQuery = `SELECT * FROM reposight.issues WHERE repo_id = ?`;
      const issuesParams = [repo.repo_id];
      const issuesResult = await client.execute(issuesQuery, issuesParams, { prepare: true });
      const issues = issuesResult.rows;

      // Count issues by difficulty
      const beginnerIssues = issues.filter(issue => issue.difficulty === 'beginner').length;
      const intermediateIssues = issues.filter(issue => issue.difficulty === 'intermediate').length;
      const advancedIssues = issues.filter(issue => issue.difficulty === 'advanced').length;

      // Constructing response data
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
  let difficulty = req.query.difficulty;

  if (!repo_id) {
    return res.status(400).json({ error: 'repo_id parameter is required', data: null, status: false });
  }

  try {
    // Construct the CQL query to fetch issues for a specific repo and difficulty
    let query = `SELECT * FROM reposight.issues WHERE repo_id = ?`;
    const params = [repo_id];

    if (difficulty && difficulty !== '') {
      const difficultyLevels = difficulty.split(',').map(level => level.trim());
      const placeholders = difficultyLevels.map(() => '?').join(', ');
      query += ` AND difficulty IN (${placeholders})`;
      params.push(...difficultyLevels);
    }
    query += ' ALLOW FILTERING';
    console.log(query);
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
