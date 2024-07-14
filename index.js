const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const repoRoutes = require('./routes/reporoutes');
const issueRoutes = require('./routes/issueroutes');
const ratingRoutes = require('./routes/ratingroutes');

const app = express();
const port = 7000;

app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/reposight', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// Routes
app.use('/api/repos', repoRoutes);
app.use('/api/issues', issueRoutes);
app.use('/api/ratings', ratingRoutes);

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
