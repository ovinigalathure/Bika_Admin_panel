import React, { useEffect, useState } from 'react';
import './OrderTable.css';
import { db } from '../../../../firebase'; 
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { useNavigate } from 'react-router-dom';

const OrderStatus = () => {
    const [newOrdersCount, setNewOrdersCount] = useState(0);
    const [pendingOrders, setPendingOrders] = useState([]);
    const [confirmedOrders, setConfirmedOrders] = useState([]);
    const navigate = useNavigate();

    const fetchOrders = (status, setState) => {
        const q = query(collection(db, "orders"), where("status", "==", status));
        return onSnapshot(q, (snapshot) => {
            const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setState(orders);
        }, (error) => {
            console.error("Error fetching orders: ", error);
        });
    };

    useEffect(() => {
        const unsubscribeNewOrders = fetchOrders("new", (orders) => {
            setNewOrdersCount(orders.length);
        });
        const unsubscribePendingOrders = fetchOrders("pending", setPendingOrders);
        const unsubscribeConfirmedOrders = fetchOrders("confirmed", setConfirmedOrders);

        return () => {
            unsubscribeNewOrders();
            unsubscribePendingOrders();
            unsubscribeConfirmedOrders();
        };
    }, []);

    return (
        <div className="order-status-container">
            <div className="order-status-card order-status-new">
                <h3>New Orders</h3>
                <button className="order-status-btn" onClick={() => navigate('/orders')}>View New Orders</button>
            </div>
            <div className="order-status-card order-status-pending">
                <h3>Pending Orders</h3>
                <button className="order-status-btn" onClick={() => navigate('/pending')}>View Pending Orders</button>
            </div>
            <div className="order-status-card order-status-confirmed">
                <h3>Confirmed Orders</h3>
                <button className="order-status-btn" onClick={() => navigate('/confirm-orders')}>View Confirmed Orders</button>
            </div>
            <div className="order-status-card order-status-ready">
                <h3>Ready Orders</h3>
                <button className="order-status-btn" onClick={() => navigate('/ready-orders')}>View Ready Orders</button>
            </div>
        </div>
    );
};

export default OrderStatus;
