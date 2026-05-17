import React, { useState, useEffect } from 'react';
import CandidateForm from './components/CandidateForm';
import JobRequirementForm from './components/JobRequirementForm';
import CandidateList from './components/CandidateList';
import api from './api';
import './index.css';

function App() {
  const [candidates, setCandidates] = useState([]);
  const [shortlisted, setShortlisted] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    try {
      const res = await api.get('/candidates');
      setCandidates(res.data);
      setShortlisted(res.data); // Initially show all
    } catch (err) {
      console.error("Failed to fetch candidates", err);
    }
  };

  const handleCandidateAdded = (newCandidate) => {
    setCandidates([newCandidate, ...candidates]);
    setShortlisted([newCandidate, ...shortlisted]);
  };

  const handleMatch = async (requiredSkills, minExperience) => {
    setLoading(true);
    try {
      // 1. Get Basic Match
      const basicRes = await api.post('/match', { requiredSkills, minExperience });
      const basicShortlisted = basicRes.data;
      
      setShortlisted(basicShortlisted);

      // 2. Get AI Recommendations for top candidates (limit to top 5 to save tokens)
      const topCandidates = basicShortlisted.slice(0, 5);
      if (topCandidates.length > 0) {
        try {
          const aiRes = await api.post('/ai/shortlist', { 
            requiredSkills, 
            minExperience, 
            candidates: topCandidates 
          });
          
          if (Array.isArray(aiRes.data)) {
            const aiDataMap = aiRes.data.reduce((acc, curr) => {
              if(curr.id) acc[curr.id] = curr;
              return acc;
            }, {});

            const enhancedShortlisted = basicShortlisted.map(c => {
              if (aiDataMap[c._id]) {
                return { 
                  ...c, 
                  aiRecommendation: aiDataMap[c._id].aiRecommendation,
                  aiScore: aiDataMap[c._id].aiScore
                };
              }
              return c;
            });
            // Resort based on AI score if available, otherwise keep basic sort
            enhancedShortlisted.sort((a, b) => (b.aiScore || b.matchScore || 0) - (a.aiScore || a.matchScore || 0));
            setShortlisted(enhancedShortlisted);
          }
        } catch (aiErr) {
          console.error("AI matching failed", aiErr);
          // basic matching results are still shown
        }
      }
    } catch (err) {
      console.error("Matching failed", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <header className="header">
        <h1>SmartAI Recruiter</h1>
        <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>AI-Powered Candidate Shortlisting System</p>
      </header>

      <div className="grid-2">
        <div>
          <CandidateForm onCandidateAdded={handleCandidateAdded} />
        </div>
        <div>
          <JobRequirementForm onMatch={handleMatch} loading={loading} />
        </div>
      </div>

      <div style={{ marginTop: '2rem' }}>
        <CandidateList candidates={shortlisted} />
      </div>
    </div>
  );
}

export default App;
