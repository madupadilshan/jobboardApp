import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Signup.css';

const Signup = ({ setAuthToken, setRole }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRoleSelect] = useState('jobSeeker');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    
    try {
      const response = await axios.post('http://localhost:5000/api/auth/signup', { 
        name: name.trim(),
        email: email.trim(),
        password: password.trim(),
        role 
      });

      const { token, role: userRole } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('role', userRole);
      setAuthToken(token);
      setRole(userRole);

      navigate('/dashboard');
    } catch (error) {
      setError(error.response?.data?.message || 'Signup failed');
      console.error('Signup error:', error);
    }
  };

  return (
    <div className="signup-container">
      <h2>Signup</h2>
      {error && <p className="error-message">{error}</p>}
      <form className="signup-form" onSubmit={handleSignup}>
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <select 
          value={role} 
          onChange={(e) => setRoleSelect(e.target.value)}
        >
          <option value="jobSeeker">Job Seeker</option>
          <option value="company">Company</option>
        </select>
        <button type="submit">Signup</button>
      </form>
    </div>
  );
};

export default Signup;
