import React from 'react';
import './PaymentTable.css';

const PaymentTable = () => {
  return (
    <div className="payment-table">
      <table>
        <thead>
          <tr>
            <th>Order No</th>
            <th>Price</th>
            <th>Payment ID</th>
            <th>Date</th>
            <th>Address</th>
          </tr>
        </thead>
        <tbody>
          {/* Add rows here */}
        </tbody>
      </table>
    </div>
  );
};

export default PaymentTable;
