const express = require('express');
const router = express.Router();
const Candidate = require('../models/Candidate');

// Helper function for basic matching
function matchCandidates(candidates, job) {
    return candidates.map(candidate => {
        const matchedSkills = candidate.skills.filter(skill => 
            job.requiredSkills.map(s => s.toLowerCase()).includes(skill.toLowerCase())
        );
        const score = job.requiredSkills.length > 0 ? (matchedSkills.length / job.requiredSkills.length) * 100 : 0;
        
        let rank = 'Low';
        if (score >= 80) rank = 'High';
        else if (score >= 40) rank = 'Medium';

        return {
            ...candidate.toObject(),
            matchScore: score,
            matchedSkills,
            rank
        };
    }).sort((a, b) => b.matchScore - a.matchScore);
}

// POST /api/match - Shortlist Candidates (Basic Logic)
router.post('/match', async (req, res) => {
    try {
        const { requiredSkills, minExperience } = req.body;
        
        // Find candidates meeting the minimum experience
        const candidates = await Candidate.find({
            experience: { $gte: minExperience || 0 }
        });

        const shortlisted = matchCandidates(candidates, { requiredSkills });
        res.json(shortlisted);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Matching failed' });
    }
});

// POST /api/ai/shortlist - AI-Based Candidate Suggestion
router.post('/ai/shortlist', async (req, res) => {
    try {
        const { requiredSkills, minExperience, candidates } = req.body;

        if (!candidates || candidates.length === 0) {
            return res.status(400).json({ error: 'No candidates provided for AI analysis' });
        }

        const candidateString = candidates.map((c, i) => 
            `${i + 1}. ${c.name} - Skills: ${c.skills.join(', ')} - Experience: ${c.experience} years${c.projects ? ` - Bio: ${c.projects}` : ''}`
        ).join('\n');

        const prompt = `
        Job requires: ${requiredSkills.join(', ')} (${minExperience}+ years experience)
        
        Candidates:
        ${candidateString}
        
        Rank candidates and explain why. Output your response as a valid JSON array of objects. Each object should have the following keys:
        - "id" (the MongoDB _id of the candidate, which is: ${candidates.map(c => c._id).join(', ')} - make sure to map correctly)
        - "name" (name of the candidate)
        - "aiRecommendation" (a text explanation of why they are suitable or not)
        - "aiScore" (a score from 0 to 100 based on fit)
        
        ONLY output the JSON array, no markdown formatting like \`\`\`json.
        `;

        // Node 18+ has built-in fetch
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "openai/gpt-4o-mini", // fallback fast model, usually allowed on OpenRouter
                messages: [
                    { role: "system", content: "You are an expert technical recruiter AI." },
                    { role: "user", content: prompt }
                ]
            })
        });

        if (!response.ok) {
            const errBody = await response.text();
            throw new Error(`OpenRouter API error: ${response.status} ${errBody}`);
        }

        const data = await response.json();
        const content = data.choices[0].message.content.trim();
        
        let parsedResult;
        try {
            parsedResult = JSON.parse(content.replace(/```json/g, '').replace(/```/g, ''));
        } catch (e) {
             // fallback if JSON parsing fails
            return res.json({ rawOutput: content, error: "Failed to parse AI output into JSON" });
        }

        res.json(parsedResult);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'AI Shortlisting failed' });
    }
});

module.exports = router;
