import React from 'react';
import './OrderDetails.css';

const OrderDetails = () => {
  return (
    <div className="order-details-container">
      <h1>Order Details</h1>
      <table className="order-details-table">
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Product Name(s)</th>
            <th>Quantity</th>
            <th>Price</th>
            <th>Discount</th>
            <th>Total Price</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default OrderDetails;
