import React from 'react';
import Sidebar from '../Dashboard/components/sidebar/Sidebar';
import DashboardHeader from '../Payment/components/DashboardHeader/DashboardHeader';
import PaymentTable from '../Payment/components/PaymentTable/PaymentTable';
import './payment.css';
import Header from '../Dashboard/components/Header/Header';

const Payment = () => {
  return (
    <div className="dashboard">
      <Sidebar />
      <div className="dashboard__main ">
        <Header title="Payment" />
        <PaymentTable />
      </div>
    </div>
  );
};

export default Payment;
