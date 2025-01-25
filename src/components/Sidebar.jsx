import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

function Sidebar() {
  const location = useLocation();
  const isSharkTracker = location.pathname.includes('shark-tracker');
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className={`sidebar ${isSharkTracker ? 'dark' : 'light'} ${isHovered ? 'expanded' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {!isHovered && (
        <div className="sidebar-hint">
          Hover to expand
        </div>
      )}
      <div className="sidebar-content">
        <nav>
          <Link to="/">
            <span className="link-text">Home</span>
          </Link>
          <Link to="/shark-tracker">
            <span className="link-text">Shark Tracker</span>
          </Link>
        </nav>
      </div>
    </div>
  );
}

export default Sidebar;