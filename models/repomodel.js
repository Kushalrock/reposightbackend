const mongoose = require('mongoose');

const repositorySchema = new mongoose.Schema({
    repo_id: { type: String, required: true, unique: true },
    avg_ratings: { type: Number, default: 5.0 },
    repo_desc: { type: String },
    repo_name: { type: String, required: true },
    repo_url: { type: String, required: true },
    sum_of_community_ratings: { type: Number, default: 0 },
    sum_of_issue_classification_ratings: { type: Number, default: 0 },
    total_community_ratings: { type: Number, default: 0 },
    total_issue_classification_ratings: { type: Number, default: 0 },
    tags: { type: [String], default: [] }
});

module.exports = mongoose.model('Repository', repositorySchema);
