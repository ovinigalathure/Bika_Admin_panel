import React from 'react';
import './DashboardHeader.css';

const DashboardHeader = ({ title }) => {
  return (
    <div className="dashboard-header">
      <h1>{title}</h1>
    </div>
  );
};

export default DashboardHeader;
