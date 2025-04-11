import React, { useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import './ApplyJob.css';

const ApplyJob = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    coverLetter: '',
    resume: null
  });
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState({
    error: '',
    success: ''
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: files ? files[0] : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessages({ error: '', success: '' });

    if (!formData.resume) {
      setMessages({ error: 'Please upload your resume', success: '' });
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const formPayload = new FormData();
      formPayload.append('jobId', jobId);
      formPayload.append('coverLetter', formData.coverLetter);
      formPayload.append('resume', formData.resume);

      const response = await axios.post(
        'http://localhost:5000/api/applications',
        formPayload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (response.data.success) {
        setMessages({ 
          error: '', 
          success: 'Application submitted successfully!' 
        });
        setTimeout(() => navigate('/dashboard'), 2000);
      }
    } catch (error) {
      let errorMessage = 'Error submitting application';
      
      if (error.response) {
        if (error.response.status === 401) {
          errorMessage = 'Session expired. Please login again.';
          navigate('/login');
        } else {
          errorMessage = error.response.data.message || errorMessage;
        }
      } else if (error.request) {
        errorMessage = 'Network error. Please check your connection.';
      }

      setMessages({ error: errorMessage, success: '' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="apply-job-container">
      <div className="header-section">
        <h2>Apply for this position</h2>
        <button onClick={() => navigate(-1)} className="back-button">
          &larr; Back
        </button>
      </div>

      {messages.error && (
        <div className="alert error">
          <p>{messages.error}</p>
        </div>
      )}

      {messages.success && (
        <div className="alert success">
          <p>{messages.success}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="application-form">
        <div className="form-group">
          <label htmlFor="coverLetter">Cover Letter *</label>
          <textarea
            id="coverLetter"
            name="coverLetter"
            value={formData.coverLetter}
            onChange={handleChange}
            required
            placeholder="Explain why you're a good fit for this position..."
          />
        </div>

        <div className="form-group">
          <label htmlFor="resume">Resume * (PDF, DOC, DOCX, max 5MB)</label>
          <div className="file-upload-wrapper">
            <input
              type="file"
              id="resume"
              name="resume"
              accept=".pdf,.doc,.docx"
              onChange={handleChange}
              required
            />
            <label htmlFor="resume" className="file-upload-label">
              {formData.resume ? formData.resume.name : 'Choose file'}
            </label>
            {formData.resume && (
              <button 
                type="button" 
                onClick={() => setFormData(prev => ({ ...prev, resume: null }))}
                className="clear-file"
              >
                ×
              </button>
            )}
          </div>
          {formData.resume && (
            <p className="file-info">
              {Math.round(formData.resume.size / 1024)} KB - {
                formData.resume.type === 'application/pdf' ? 'PDF' : 
                formData.resume.type.includes('word') ? 'Word Document' : 'File'
              }
            </p>
          )}
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="submit-button"
        >
          {loading ? (
            <>
              <span className="spinner"></span> Processing...
            </>
          ) : (
            'Submit Application'
          )}
        </button>
      </form>
    </div>
  );
};

export default ApplyJob;