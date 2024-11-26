import React from 'react';
import './Header.css';

const Header = ({ title }) => {
  return (
    <div className="header">
      <h1>{title}</h1>
      <div className="header__profile">
        <img src="/path-to-profile-icon" alt="Profile" />
      </div>
    </div>
  );
};

export default Header;
