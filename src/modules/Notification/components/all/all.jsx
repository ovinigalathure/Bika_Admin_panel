import React from 'react';
import Sidebar from '../../../Dashboard/components/sidebar/Sidebar';
import DashboardHeader from '../../../Dashboard/components/Header/Header';
// import NotificationFilters from '../main/NotificationFilters';
import '../../notifiacation.css';
import AllFilter from './allFilter';

const All = () => {
  return (
    <div className="dashboard">
      <Sidebar />
      <div className="dashboard__main ">
        <DashboardHeader title="Notification" />
        <AllFilter />
      </div>
    </div>
  );
};

export default All;
