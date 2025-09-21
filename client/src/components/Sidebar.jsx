import React from 'react';
import { Link, NavLink } from 'react-router-dom';

const sidebarStyles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
  },
  logo: {
    fontWeight: 'bold',
    fontSize: '24px',
    marginBottom: '40px',
    color: 'var(--text-color)',
    textDecoration: 'none',
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  navLink: {
    textDecoration: 'none',
    color: 'var(--text-color)',
    padding: '10px 15px',
    borderRadius: '8px',
    fontWeight: '500',
    transition: 'all 0.2s ease',
  },
  activeLink: {
    backgroundColor: 'var(--primary-accent)',
    color: 'white',
  }
};

const Sidebar = () => {
  return (
    <div style={sidebarStyles.container}>
      <Link to="/" style={sidebarStyles.logo}>ArtisanAI</Link>
      <nav style={sidebarStyles.nav}>
        <NavLink 
          to="/" 
          style={({ isActive }) => ({ ...sidebarStyles.navLink, ...(isActive ? sidebarStyles.activeLink : {}) })}
        >
          Add New Craft
        </NavLink>
        <NavLink 
          to="/showcase/1" // Hardcoded to artisan ID 1
          style={({ isActive }) => ({ ...sidebarStyles.navLink, ...(isActive ? sidebarStyles.activeLink : {}) })}
        >
          My Showcase
        </NavLink>
        <NavLink 
          to="/profile" 
          style={({ isActive }) => ({ ...sidebarStyles.navLink, ...(isActive ? sidebarStyles.activeLink : {}) })}
        >
          My Profile
        </NavLink>
      </nav>
    </div>
  );
};

export default Sidebar;