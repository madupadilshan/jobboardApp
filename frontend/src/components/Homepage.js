import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const Homepage = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [role, setRole] = useState('');

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const token = localStorage.getItem('token');
        const userRole = localStorage.getItem('role');
        setRole(userRole || '');

        const response = await axios.get('http://localhost:5000/api/jobs', {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        
        setJobs(response.data.jobs);
        setLoading(false);
      } catch (error) {
        setError('Error fetching jobs');
        setLoading(false);
        console.error('Error fetching jobs:', error);
      }
    };

    fetchJobs();
  }, []);

  if (loading) return <div className="loading">Loading jobs...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="homepage">
      <h1>Welcome to the Job Board</h1>
      <p>Find your next job or post a job if you're a company.</p>

      {jobs.length > 0 ? (
        <div className="jobs-section">
          <h2>Available Jobs</h2>
          <ul className="jobs-list">
            {jobs.map((job) => (
              <li key={job._id} className="job-card">
                <h3>{job.title}</h3>
                <p className="company">{job.company}</p>
                <p className="location">{job.location}</p>
                <p className="salary">{job.salary}</p>
                <p className="description">{job.description}</p>
                
                {role === 'jobSeeker' && (
                  <Link 
                    to={`/apply/${job._id}`} 
                    className="apply-button"
                  >
                    Apply Now
                  </Link>
                )}
                
                {!role && (
                  <p className="login-prompt">
                    <Link to="/login">Login</Link> as a job seeker to apply
                  </p>
                )}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p>No jobs available at the moment.</p>
      )}
    </div>
  );
};

export default Homepage;