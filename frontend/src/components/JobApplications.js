import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import './JobApplications.css';

const JobApplications = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const [jobResponse, appsResponse] = await Promise.all([
          axios.get(`http://localhost:5000/api/jobs/${jobId}`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`http://localhost:5000/api/applications/job/${jobId}`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        setJob(jobResponse.data.job);
        setApplications(appsResponse.data.applications);
      } catch (error) {
        setError(error.response?.data?.message || 'Failed to load applications');
        if (error.response?.status === 401) {
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [jobId, navigate]);

  const updateStatus = async (applicationId, status) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:5000/api/applications/${applicationId}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setApplications(applications.map(app => 
        app._id === applicationId ? { ...app, status } : app
      ));
    } catch (error) {
      console.error('Error updating status:', error);
      setError('Failed to update application status');
    }
  };

  if (loading) return <div className="loading">Loading applications...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="job-applications-container">
      <button onClick={() => navigate(-1)} className="back-button">
        &larr; Back to Dashboard
      </button>
      
      <h2>Applications for {job?.title}</h2>
      <p className="job-info">
        {job?.company} • {job?.location} • {job?.salary}
      </p>

      {applications.length > 0 ? (
        <div className="applications-list">
          {applications.map(application => (
            <div key={application._id} className="application-card">
              <div className="applicant-info">
                <h4>{application.user.name}</h4>
                <p>{application.user.email}</p>
                <p>Applied on: {new Date(application.createdAt).toLocaleDateString()}</p>
                
                {application.resume && (
                  <div className="resume-actions">
                    <a
                      href={`http://localhost:5000/api/applications/resume/${application.resume}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="resume-link"
                    >
                      <i className="fas fa-eye"></i> View Resume
                    </a>
                    <a
                      href={`http://localhost:5000/api/applications/resume/${application.resume}`}
                      download={application.resume}
                      className="download-link"
                    >
                      <i className="fas fa-download"></i> Download
                    </a>
                  </div>
                )}
              </div>
              
              <div className="application-details">
                <h5>Cover Letter:</h5>
                <p>{application.coverLetter}</p>
              </div>
              
              <div className="status-controls">
                <label>Status:</label>
                <select
                  value={application.status}
                  onChange={(e) => updateStatus(application._id, e.target.value)}
                >
                  <option value="pending">Pending</option>
                  <option value="reviewed">Reviewed</option>
                  <option value="rejected">Rejected</option>
                  <option value="accepted">Accepted</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p>No applications received yet.</p>
      )}
    </div>
  );
};

export default JobApplications;