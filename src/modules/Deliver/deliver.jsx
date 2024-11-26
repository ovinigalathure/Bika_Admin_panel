import React from 'react';
import Sidebar from '../Dashboard/components/sidebar/Sidebar';
import Header from '../Dashboard/components/Header/Header';
import OrderTable from '../Order/components/orderT/OrderTable';
import './deliver.css';

const Deliver = () => {
    return (
        <div className="dashboard">
            <Sidebar />
            <div className="dashboard-main">
            <Header title="Delivery" />
                <OrderTable />
            </div>
        </div>
    );
};

export default Deliver;
