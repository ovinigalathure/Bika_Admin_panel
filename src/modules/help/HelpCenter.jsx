// profile/HelpCenter.jsx
import React from 'react';
import './helpCenter.css';
import HelpTable from './components/HelpTable';
import Header from '../Dashboard/components/Header/Header';
import Sidebar from '../Dashboard/components/sidebar/Sidebar';

const HelpCenter = () => {
  return (
   
    <div className="dashboard">
      <Sidebar />
        <div className="profile__main">

            <Header title="Help Center"/>
            <HelpTable className="tb"/>

        </div>
    </div>
  );
};

export default HelpCenter;
