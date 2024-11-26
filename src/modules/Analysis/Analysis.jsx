import React from 'react';
import Sidebar from '../Dashboard/components/sidebar/Sidebar';
import DashboardHeader from '../Dashboard/components/Header/Header';
import AnalyticsAndReporting from './components/reporrt/AnalyticsAndReporting';
import './Analysis.css';

const Report = () => {
  return (
    <div className="dashboard">
      <Sidebar />
      <div className="dashboard__main">
        <DashboardHeader title="Analytics & Reporting" />
        <AnalyticsAndReporting />
      </div>
    </div>
  );
};

export default Report;
