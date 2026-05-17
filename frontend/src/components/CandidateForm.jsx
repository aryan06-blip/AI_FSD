import React, { useState } from 'react';
import api from '../api';
import { FaUserPlus } from 'react-icons/fa';

const CandidateForm = ({ onCandidateAdded }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    skills: '',
    experience: '',
    projects: ''
  });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const skillsArray = formData.skills.split(',').map(s => s.trim()).filter(s => s);
      const res = await api.post('/candidates', {
        ...formData,
        skills: skillsArray,
        experience: Number(formData.experience)
      });
      setMsg('Candidate added successfully!');
      setFormData({ name: '', email: '', skills: '', experience: '', projects: '' });
      if (onCandidateAdded) onCandidateAdded(res.data);
    } catch (err) {
      setMsg('Error adding candidate.');
    } finally {
      setLoading(false);
      setTimeout(() => setMsg(''), 3000);
    }
  };

  return (
    <div className="card">
      <h2><FaUserPlus style={{ marginRight: '10px', color: 'var(--primary-color)' }} /> Add Candidate</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Name</label>
          <input type="text" className="form-input" name="name" value={formData.name} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label className="form-label">Email</label>
          <input type="email" className="form-input" name="email" value={formData.email} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label className="form-label">Skills (comma separated)</label>
          <input type="text" className="form-input" name="skills" value={formData.skills} onChange={handleChange} required placeholder="e.g. React, Node.js, MongoDB" />
        </div>
        <div className="form-group">
          <label className="form-label">Experience (Years)</label>
          <input type="number" className="form-input" name="experience" value={formData.experience} onChange={handleChange} required min="0" step="0.5" />
        </div>
        <div className="form-group">
          <label className="form-label">Projects / Bio</label>
          <textarea className="form-textarea" name="projects" value={formData.projects} onChange={handleChange} placeholder="Brief bio or list of projects..."></textarea>
        </div>
        <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
          {loading ? <><span className="loading-spinner"></span> Saving...</> : 'Save Candidate'}
        </button>
        {msg && <p style={{ marginTop: '1rem', color: msg.includes('Error') ? 'var(--error-color)' : 'var(--secondary-color)', textAlign: 'center' }}>{msg}</p>}
      </form>
    </div>
  );
};

export default CandidateForm;
