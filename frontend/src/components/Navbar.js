import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

const Navbar = ({ logout, role, userData }) => {
  return (
    <nav className="navbar">
      <ul>
        <li>
          <Link to="/" className="navbar-link">Home</Link>
        </li>
        {!role ? (
          <>
            <li>
              <Link to="/login" className="navbar-link">Login</Link>
            </li>
            <li>
              <Link to="/signup" className="navbar-link">Signup</Link>
            </li>
          </>
        ) : (
          <>
            {role === 'company' && (
              <li>
                <Link to="/post-job" className="navbar-link">Post a Job</Link>
              </li>
            )}
            <li>
              <Link to="/dashboard" className="navbar-link">My Account</Link> {/* Changed from "Dashboard" */}
            </li>
            <li>
              <span className="welcome-message">Welcome, {userData?.name || (role === 'company' ? 'Company' : 'User')}</span>
            </li>
            <li>
              <button onClick={logout} className="navbar-logout-btn">Logout</button>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;