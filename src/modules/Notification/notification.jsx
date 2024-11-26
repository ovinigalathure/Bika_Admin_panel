import React from 'react';
import Sidebar from '../Dashboard/components/sidebar/Sidebar';
import DashboardHeader from '../Dashboard/components/Header/Header';
import NotificationFilters from '../Notification/components/main/NotificationFilters';
import './notifiacation.css';

const Notification = () => {
  return (
    <div className="dashboard">
      <Sidebar />
      <div className="dashboard__main ">
        <DashboardHeader title="Notification" />
        <NotificationFilters />
      </div>
    </div>
  );
};

export default Notification;
