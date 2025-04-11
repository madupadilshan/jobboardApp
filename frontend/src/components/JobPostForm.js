import React, { useState } from 'react';
import axios from 'axios';
import './JobPostForm.css';

const JobPostForm = () => {
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    salary: '',
    location: '',
    description: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handlePostJob = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    if (!token) {
      setError('Please login to post jobs');
      return;
    }

    try {
      const response = await axios.post(
        'http://localhost:5000/api/jobs',
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        setSuccess(true);
        setFormData({
          title: '',
          company: '',
          salary: '',
          location: '',
          description: ''
        });
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Error posting job');
      setTimeout(() => setError(''), 5000);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="job-post-form">
      <h2>Post a Job</h2>
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">Job posted successfully!</div>}
      
      <form onSubmit={handlePostJob}>
        <input
          type="text"
          name="title"
          placeholder="Job Title"
          value={formData.title}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="company"
          placeholder="Company Name"
          value={formData.company}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="salary"
          placeholder="Salary Range"
          value={formData.salary}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="location"
          placeholder="Location"
          value={formData.location}
          onChange={handleChange}
          required
        />
        <textarea
          name="description"
          placeholder="Job Description"
          value={formData.description}
          onChange={handleChange}
          required
        />
        <button type="submit">Post Job</button>
      </form>
    </div>
  );
};

export default JobPostForm;