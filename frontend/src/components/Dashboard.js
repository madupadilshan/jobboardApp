import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = ({ role }) => {
  const [userData, setUserData] = useState(null);
  const [applications, setApplications] = useState([]);
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        // Fetch user data
        const userResponse = await axios.get('http://localhost:5000/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUserData(userResponse.data.user);

        if (role === 'jobSeeker') {
          // Fetch job seeker's applications
          const appsResponse = await axios.get('http://localhost:5000/api/applications/my', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setApplications(appsResponse.data?.applications || []);
        } else if (role === 'company') {
          // Fetch job applicants for company's jobs
          const seekersResponse = await axios.get('http://localhost:5000/api/applications/company', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setApplicants(seekersResponse.data?.applications || []);
        }
      } catch (error) {
        console.error('Dashboard error:', error);
        setError('Failed to load dashboard data. Please try again.');
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('role');
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [role, navigate]);

  const formatStatus = (status) => {
    if (!status) return 'Pending';
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const handleStatusUpdate = async (applicationId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:5000/api/applications/${applicationId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Update local state
      if (role === 'company') {
        setApplicants(applicants.map(app => 
          app._id === applicationId ? { ...app, status: newStatus } : app
        ));
      } else {
        setApplications(applications.map(app => 
          app._id === applicationId ? { ...app, status: newStatus } : app
        ));
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  if (loading) return (
    <div className="loading-container">
      <div className="spinner"></div>
      <p>Loading dashboard...</p>
    </div>
  );
  
  if (error) return (
    <div className="error-container">
      <p>{error}</p>
      <button onClick={() => window.location.reload()} className="retry-btn">
        Retry
      </button>
    </div>
  );

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2>Welcome, {userData?.name || (role === 'company' ? 'Company' : 'Job Seeker')}</h2>
        <button 
          onClick={() => navigate('/')} 
          className="home-btn"
        >
          Back to Home
        </button>
      </div>
      
      {role === 'jobSeeker' ? (
        <div className="job-seeker-dashboard">
          <div className="section-header">
            <h3>Your Job Applications</h3>
            <button 
              onClick={() => navigate('/')}
              className="browse-jobs-btn"
            >
              Browse Jobs
            </button>
          </div>
          
          {applications.length > 0 ? (
            <div className="applications-list">
              {applications.map(app => (
                <div key={app._id} className="application-card">
                  <div className="application-header">
                    <h4>{app.job?.title || 'Job Title Not Available'}</h4>
                    <span className={`status-badge status-${app.status || 'pending'}`}>
                      {formatStatus(app.status)}
                    </span>
                  </div>
                  <div className="application-details">
                    <p><strong>Company:</strong> {app.job?.company || 'N/A'}</p>
                    <p><strong>Location:</strong> {app.job?.location || 'N/A'}</p>
                    <p><strong>Salary:</strong> {app.job?.salary || 'Not specified'}</p>
                    <p><strong>Applied on:</strong> {app.createdAt ? new Date(app.createdAt).toLocaleDateString() : 'N/A'}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-applications">
              <p>You haven't applied to any jobs yet.</p>
              <button 
                onClick={() => navigate('/')}
                className="browse-jobs-btn"
              >
                Browse Available Jobs
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="company-dashboard">
          <div className="applicants-section">
            <div className="section-header">
              <h3>Job Applicants</h3>
              <button 
                onClick={() => navigate('/post-job')}
                className="post-job-btn"
              >
                Post New Job
              </button>
            </div>
            
            {applicants.length > 0 ? (
              <div className="applicants-list">
                {applicants.map(applicant => (
                  <div key={applicant._id} className="applicant-card">
                    <div className="applicant-main-info">
                      <div className="applicant-profile">
                        <h4>{applicant.user?.name || 'Applicant'}</h4>
                        <p className="applicant-email">{applicant.user?.email || 'No email provided'}</p>
                        <p className="applicant-job">
                          Applied for: <strong>{applicant.job?.title || 'Unknown Position'}</strong>
                        </p>
                      </div>
                      
                      <div className="applicant-status">
                        <label>Application Status:</label>
                        <select
                          value={applicant.status || 'pending'}
                          onChange={(e) => handleStatusUpdate(applicant._id, e.target.value)}
                          className="status-select"
                        >
                          <option value="pending">Pending</option>
                          <option value="reviewed">Reviewed</option>
                          <option value="rejected">Rejected</option>
                          <option value="accepted">Accepted</option>
                        </select>
                        <p className="application-date">
                          Applied on: {applicant.createdAt ? new Date(applicant.createdAt).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                    </div>

                    <div className="applicant-documents">
                      <div className="document-section">
                        <h5>Resume/CV:</h5>
                        {applicant.resume ? (
                          <a 
                            href={`http://localhost:5000${applicant.resume}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="document-link"
                          >
                            <i className="fas fa-file-pdf"></i> View Resume
                          </a>
                        ) : (
                          <p className="no-document">No resume uploaded</p>
                        )}
                      </div>

                      <div className="document-section">
                        <h5>Cover Letter:</h5>
                        <div className="cover-letter-content">
                          {applicant.coverLetter ? (
                            <>
                              <p className="cover-letter-preview">
                                {applicant.coverLetter.length > 150 
                                  ? `${applicant.coverLetter.substring(0, 150)}...` 
                                  : applicant.coverLetter}
                              </p>
                              <button 
                                className="view-full-btn"
                                onClick={() => alert(applicant.coverLetter)}
                              >
                                View Full
                              </button>
                            </>
                          ) : (
                            <p className="no-document">No cover letter provided</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-applicants">
                <p>No applicants yet for your jobs.</p>
                <button 
                  onClick={() => navigate('/post-job')}
                  className="post-job-btn"
                >
                  Post a Job to Get Applicants
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;