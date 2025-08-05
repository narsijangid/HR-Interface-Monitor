import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Activity, FileText } from 'lucide-react';
import './Header.css';

const Header = () => {
  const location = useLocation();

  return (
    <header className="header">
      <div className="header-container">
        <div className="logo">
          <Activity className="logo-icon" />
          <h1>HR Interface Monitor</h1>
        </div>
        <nav className="nav">
          <Link 
            to="/" 
            className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
          >
            <Activity size={18} />
            Dashboard
          </Link>
          <Link 
            to="/logs" 
            className={`nav-link ${location.pathname === '/logs' ? 'active' : ''}`}
          >
            <FileText size={18} />
            Logs
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;