const Rating = require('../models/ratingmodel');

const getRatingsByRepoId = async (req, res) => {
  const { repo_id } = req.params;

  try {
    const ratings = await Rating.find({ repo_id });

    res.json({ data: ratings, error: null, status: true });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'An error occurred', data: null, status: false });
  }
};

module.exports = {
  getRatingsByRepoId,
};
