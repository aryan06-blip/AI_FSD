import React, { useState } from 'react';
import { FaSearch } from 'react-icons/fa';

const JobRequirementForm = ({ onMatch, loading }) => {
  const [reqData, setReqData] = useState({
    requiredSkills: '',
    minExperience: ''
  });

  const handleChange = (e) => {
    setReqData({ ...reqData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const skillsArray = reqData.requiredSkills.split(',').map(s => s.trim()).filter(s => s);
    onMatch(skillsArray, Number(reqData.minExperience));
  };

  return (
    <div className="card">
      <h2><FaSearch style={{ marginRight: '10px', color: 'var(--secondary-color)' }} /> Match Requirements</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Required Skills (comma separated)</label>
          <input type="text" className="form-input" name="requiredSkills" value={reqData.requiredSkills} onChange={handleChange} required placeholder="e.g. React, Node.js" />
        </div>
        <div className="form-group">
          <label className="form-label">Minimum Experience (Years)</label>
          <input type="number" className="form-input" name="minExperience" value={reqData.minExperience} onChange={handleChange} required min="0" step="0.5" />
        </div>
        <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
          {loading ? <><span className="loading-spinner"></span> Processing...</> : 'Shortlist Candidates'}
        </button>
      </form>
    </div>
  );
};

export default JobRequirementForm;
