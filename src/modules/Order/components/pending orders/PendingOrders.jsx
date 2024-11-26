import React, { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  Timestamp
} from "firebase/firestore";
import { db } from "../../../../firebase"; // Ensure this path points to your Firebase configuration file
import { useNavigate } from "react-router-dom";
import "./PendingOrders.css";

const PendingOrders = () => {
  const navigate = useNavigate();
  const [pendingOrders, setPendingOrders] = useState([]);
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const fetchPendingOrders = async () => {
      try {
        const pendingCollection = collection(db, "pendingOrders");
        const snapshot = await getDocs(pendingCollection);
        const fetchedOrders = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        }));
        setPendingOrders(fetchedOrders);
      } catch (error) {
        console.error("Error fetching pending orders:", error);
      }
    };

    fetchPendingOrders();
  }, []);

  const handleSelectOrder = (orderId) => {
    setSelectedOrders((prevSelectedOrders) => {
      if (prevSelectedOrders.includes(orderId)) {
        return prevSelectedOrders.filter((id) => id !== orderId);
      } else {
        return [...prevSelectedOrders, orderId];
      }
    });
  };

  return (
    <div className="pending-orders">
      <h1 className="pending-orders__title">Pending Orders</h1>
      {successMessage && (
        <div className="pending-orders__success-message">{successMessage}</div>
      )}
      <div className="pending-orders__table-container">
        <table className="pending-orders__table">
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  onChange={(e) => {
                    const checked = e.target.checked;
                    if (checked) {
                      setSelectedOrders(pendingOrders.map((order) => order.id));
                    } else {
                      setSelectedOrders([]);
                    }
                  }}
                  checked={
                    selectedOrders.length === pendingOrders.length &&
                    pendingOrders.length > 0
                  }
                />
              </th>
              <th>Order ID</th>
              <th>User Email</th>
              <th>Product Name(s)</th>
              <th>Quantity</th>
              <th>Price</th>
              <th>Total Price</th>
              <th>Delivery Option</th>
              <th>Date & Time</th>
            </tr>
          </thead>
          <tbody>
            {pendingOrders.length > 0 ? (
              pendingOrders.map((order) => (
                <tr key={order.id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedOrders.includes(order.id)}
                      onChange={() => handleSelectOrder(order.id)}
                    />
                  </td>
                  <td>{order.id}</td>
                  <td>{order.userEmail}</td>
                  <td>{order.items.map((item) => item.productName).join(", ")}</td>
                  <td>
                    {order.items.reduce((total, item) => total + item.quantity, 0)}
                  </td>
                  <td>{order.items.map((item) => item.price).join(", ")}</td>
                  <td>{order.totalPrice.toFixed(2)}</td>
                  <td>{order.deliveryOption || "N/A"}</td>
                  <td>
                    {order.timestamp ? (
                      <>
                        {new Date(order.timestamp.seconds * 1000).toLocaleDateString()}{" "}
                        {new Date(order.timestamp.seconds * 1000).toLocaleTimeString()}
                      </>
                    ) : (
                      "N/A"
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="9">No pending orders found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PendingOrders;
