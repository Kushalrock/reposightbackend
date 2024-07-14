const mongoose = require('mongoose');

const issueSchema = new mongoose.Schema({
    repo_id: { type: String, required: true },
    issue_id: { type: String, required: true },
    issue_title: { type: String, required: true },
    difficulty: { type: String },
    issue_url: { type: String, required: true },
    status: { type: String, required: true }
});

module.exports = mongoose.model('Issue', issueSchema);
