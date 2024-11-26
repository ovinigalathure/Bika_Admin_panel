import React from 'react';
import Header from '../Dashboard/components/Header/Header';
import UserTable from '../Users/components/user/UserTable';
import Sidebar from '../Dashboard/components/sidebar/Sidebar';
import './user.css';

const User = () => {
  return (
    <div className="dashboard">
      <Sidebar />
      <div className="dashboard__main">
        <Header title="Users" />
        <UserTable />
      </div>
    </div>
  );
};

export default User;
