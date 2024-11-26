import React from 'react';
import Sidebar from '../Dashboard/components/sidebar/Sidebar';
import Header from '../Dashboard/components/Header/Header';
import Dashboard from '../Dashboard/components/dashboard/Dashboard';
import './dashboard.css';

const dashboard = () => {
  return (
    <div className="dashboard">
      <Sidebar />
      <div className="dashboard_main">
        <Header title="Dashboard" />
        <Dashboard />
      </div>
    </div>
  );
};

export default dashboard;
