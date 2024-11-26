import React from 'react';
import Sidebar from '../Dashboard/components/sidebar/Sidebar';
import Header from '../Dashboard/components/Header/Header';
import OrderTable from '../Order/components/orderT/OrderTable';
import './order.css';
// import App from './App';




const Order = () => {
    return (
        <div className="dashboard">
            <Sidebar />
            <div className="dashboard-main">
                <Header title="Order" />
                <OrderTable />
            </div>
        </div>
    );
};

export default Order;
