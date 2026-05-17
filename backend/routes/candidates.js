const express = require('express');
const router = express.Router();
const Candidate = require('../models/Candidate');

// POST /api/candidates - Add Candidate
router.post('/', async (req, res) => {
    try {
        const { name, email, skills, experience, projects } = req.body;
        const newCandidate = new Candidate({
            name,
            email,
            skills,
            experience,
            projects
        });
        const savedCandidate = await newCandidate.save();
        res.status(201).json(savedCandidate);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to add candidate' });
    }
});

// GET /api/candidates - Get All Candidates
router.get('/', async (req, res) => {
    try {
        const candidates = await Candidate.find().sort({ createdAt: -1 });
        res.json(candidates);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to retrieve candidates' });
    }
});

module.exports = router;
