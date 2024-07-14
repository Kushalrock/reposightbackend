const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
    repo_id: { type: String, required: true },
    user_id: { type: String, required: true },
    community_rating: { type: Number },
    issue_classification_rating: { type: Number },
    rating: { type: String } // Assuming this can store textual review
});

module.exports = mongoose.model('Rating', ratingSchema);
