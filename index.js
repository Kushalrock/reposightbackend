const express = require('express');
const cassandra = require('cassandra-driver');
const app = express();
const port = 5000;
const cors=require('cors');


const client = new cassandra.Client({
  contactPoints: ['cassandra'],
  localDataCenter: 'datacenter1',
});

app.use(cors());
app.get('/api/getReposAndIssues', async (req, res) => {
  let { languages, difficulty, topics, page = 1, pageSize = 10 } = req.query;
  languages = languages.split(","); // Split languages into an array

  try {
    const data = { repos: {} };

    for (let lang of languages) {
      let query = `SELECT * FROM reposight.repos WHERE tags CONTAINS ? ALLOW FILTERING`;
      const params = [lang];

      // Execute the query
      const reposResult = await client.execute(query, params, { prepare: true });
      const repos = reposResult.rows;

      // Add fetched repos to data
      for (let repo of repos) {
        data.repos[repo.repo_id] = { ...repo, issues: [], beginnerIssues: 0, intermediateIssues: 0, advancedIssues: 0 };
      }

      // Construct query to fetch issues for all repos for a specific language
      const issuesQuery = `SELECT * FROM reposight.issues WHERE repo_id IN ?`;
      const issuesParams = [repos.map(repo => repo.repo_id)];
      const issuesResult = await client.execute(issuesQuery, issuesParams, { prepare: true });
      const issuesRows = issuesResult.rows;

      // Update data with issues and count issues by difficulty
      for (let issue of issuesRows) {
        const repo = data.repos[issue.repo_id];
        repo.issues.push(issue);
        if (issue.difficulty === 'beginner') repo.beginnerIssues++;
        else if (issue.difficulty === 'intermediate') repo.intermediateIssues++;
        else if (issue.difficulty === 'advanced') repo.advancedIssues++;
      }
    }

    // Sorting repos by avg_ratings in descending order
    const sortedRepos = Object.values(data.repos).sort((a, b) => b.avg_ratings - a.avg_ratings);

    // Pagination
    const startIndex = (page - 1) * pageSize;
    const endIndex = Math.min(startIndex + parseInt(pageSize), sortedRepos.length);
    
    // Slice the sorted repos based on pagination
    const paginatedRepos = sortedRepos.slice(startIndex, endIndex);

    // Return the JSON response
    res.json({ data: { repos: paginatedRepos }, error: null, status: true });
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
