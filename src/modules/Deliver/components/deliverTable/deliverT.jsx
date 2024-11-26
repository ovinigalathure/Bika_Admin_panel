import React from 'react';
import './deliverT.css';

const OrderTable = () => {
    return (
        <div className="order-table-container">
            <table className="order-table">
                <thead>
                    <tr>
                        <th>Order_No</th>
                        <th>Customer_ID</th>
                        <th>Delivery Person</th>
                        <th>Date</th>
                        <th>Address</th>
                    </tr>
                </thead>
                <tbody>
                    {/* Data rows will be mapped here */}
                </tbody>
            </table>
        </div>
    );
};

export default OrderTable;
