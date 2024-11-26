import React from 'react';
import Promotions from '../Promotions/components/promotion/Promotions';
import './Promotions.css';
import Sidebar from '../Dashboard/components/sidebar/Sidebar';
import Header from '../Dashboard/components/Header/Header';

const Promote = () => {
    return (
        <div className="dashboard">
            <Sidebar />
            <div className="dashboard__main ">
            <Header title="Promotions" />
            <Promotions />
            {/* <SpecialOffers /> */}
            </div>
        </div>
    );
};

export default Promote;

