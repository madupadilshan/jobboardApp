import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Signup from './components/Signup';
import Dashboard from './components/Dashboard';
import Homepage from './components/Homepage';
import Navbar from './components/Navbar';
import PostJobPage from './components/PostJobPage';
import ApplyJob from './components/ApplyJob';
import JobApplications from './components/JobApplications';
import './App.css';

const App = () => {
  const [authToken, setAuthToken] = useState(localStorage.getItem('token') || '');
  const [role, setRole] = useState(localStorage.getItem('role') || '');
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (authToken) {
        try {
          const response = await fetch('http://localhost:5000/api/auth/me', {
            headers: {
              'Authorization': `Bearer ${authToken}`
            }
          });
          const data = await response.json();
          if (data.success) {
            setUserData(data.user);
            localStorage.setItem('role', data.user.role);
            setRole(data.user.role);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      }
    };

    fetchUserData();
  }, [authToken]);

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    setAuthToken('');
    setRole('');
    setUserData(null);
  };

  return (
    <Router>
      <div className="app">
        <Navbar logout={logout} role={role} userData={userData} />
        <div className="content">
          <Routes>
            <Route path="/" element={<Homepage />} />
            <Route 
              path="/login" 
              element={authToken ? <Navigate to="/" /> :  // Changed from '/dashboard' to '/'
                <Login setAuthToken={setAuthToken} setRole={setRole} />} 
            />
            <Route 
              path="/signup" 
              element={authToken ? <Navigate to="/" /> :  // Changed from '/dashboard' to '/'
                <Signup setAuthToken={setAuthToken} setRole={setRole} />} 
            />
            <Route 
              path="/post-job" 
              element={role === 'company' ? 
                <PostJobPage /> : <Navigate to="/" />} 
            />
            <Route 
              path="/dashboard" 
              element={authToken ? <Dashboard role={role} /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/apply/:jobId" 
              element={authToken && role === 'jobSeeker' ? 
                <ApplyJob /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/job-applications/:jobId" 
              element={authToken && role === 'company' ? 
                <JobApplications /> : <Navigate to="/" />} 
            />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;