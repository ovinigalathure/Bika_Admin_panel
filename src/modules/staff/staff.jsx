import React from 'react';
import Header from '../Dashboard/components/Header/Header';
import UserTable from '../Users/components/user/UserTable';
import Sidebar from '../Dashboard/components/sidebar/Sidebar';
import './staff.css';
import StaffTable from './StaffTable';

const Staff = () => {
  return (
    <div className="dashboard">
      <Sidebar />
      <div className="dashboard__main">
        <Header title="Staff" />
        <StaffTable />
      </div>
    </div>
  );
};

export default Staff;
