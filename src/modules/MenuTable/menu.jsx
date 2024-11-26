import React from 'react';
import Sidebar from '../Dashboard/components/sidebar/Sidebar';
import Header from '../Dashboard/components/Header/Header';
import MenuTable from '../MenuTable/components/Menu/MenuTable';
import './menu.css';
// import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

const Menu = () => {
  return (
      <div className="dashboard">
        <Sidebar />
        <div className="profile__main">

            <Header title="Menu"/>
            <MenuTable />

          {/* <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/users" element={<><Header title="Dashboard / Users" /><UserTable /></>} />
            <Route path="/menu" element={<><Header title="Dashboard / Menu" /><MenuTable /></>} />
          </Routes> */}

        </div>
      </div>
  );
};

export default Menu;
