import React from 'react';
import { FaUserCircle, FaBriefcase, FaCode } from 'react-icons/fa';

const CandidateList = ({ candidates }) => {
  if (!candidates || candidates.length === 0) {
    return <div className="card"><p style={{ color: 'var(--text-muted)' }}>No candidates match the criteria yet.</p></div>;
  }

  return (
    <div className="card">
      <h2>Shortlisted Candidates</h2>
      <div>
        {candidates.map(candidate => {
          const matchScore = candidate.matchScore !== undefined ? Math.round(candidate.matchScore) : null;
          let badgeClass = 'badge-match-low';
          if (matchScore >= 80) badgeClass = 'badge-match-high';
          else if (matchScore >= 40) badgeClass = 'badge-match-medium';

          return (
            <div key={candidate._id} className="candidate-item">
              <div className="candidate-header">
                <div className="candidate-name">
                  <FaUserCircle style={{ marginRight: '8px', verticalAlign: 'middle', color: 'var(--text-muted)' }} />
                  {candidate.name}
                </div>
                {matchScore !== null && (
                  <div className={`badge ${badgeClass}`}>
                    {matchScore}% Match
                  </div>
                )}
              </div>
              
              <div style={{ margin: '0.5rem 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                <span style={{ marginRight: '1rem' }}><FaBriefcase /> {candidate.experience} years exp.</span>
                <span><FaCode /> {candidate.skills.join(', ')}</span>
              </div>

              {candidate.matchedSkills && candidate.matchedSkills.length > 0 && (
                <div style={{ fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                  <strong>Matched Skills: </strong>
                  {candidate.matchedSkills.map(skill => (
                    <span key={skill} className="badge" style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: '#e2e8f0' }}>{skill}</span>
                  ))}
                </div>
              )}

              {candidate.aiRecommendation && (
                <div className="ai-recommendation">
                  <strong>AI Analysis (Score: {candidate.aiScore}/100):</strong>
                  <p>{candidate.aiRecommendation}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CandidateList;
