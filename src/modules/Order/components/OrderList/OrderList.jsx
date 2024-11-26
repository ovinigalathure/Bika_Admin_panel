import React, { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  doc,
  deleteDoc,
  addDoc,
  Timestamp,
} from "firebase/firestore";
import { db } from "../../../../firebase";
import { useNavigate } from "react-router-dom";
import "./OrderList.css";
import OrderDetailsModal from "../OrderDetailsModal/OrderDetailsModal";

const OrderList = () => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedUserDetails, setSelectedUserDetails] = useState(null);
  const [selectedOrders, setSelectedOrders] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const orderCollection = collection(db, "OrderNow");
        const orderSnapshot = await getDocs(orderCollection);
        const orderList = orderSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        const sortedOrders = orderList.sort((a, b) => {
          const timestampA = a.createdAt?.seconds || 0;
          const timestampB = b.createdAt?.seconds || 0;
          return timestampB - timestampA;
        });

        setOrders(sortedOrders);
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    };

    fetchOrders();
  }, []);

  const handleShowDetails = async (order) => {
    try {
      const userCollection = collection(db, "users");
      const userSnapshot = await getDocs(userCollection);
      const userDetails = userSnapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .find((user) => user.email === order.userEmail);

      if (userDetails) {
        setSelectedUserDetails(userDetails);
      } else {
        console.error("User details not found for email:", order.userEmail);
      }

      setSelectedOrder(order);
    } catch (error) {
      console.error("Error fetching user details:", error);
    }
  };

  const handleCloseModal = () => {
    setSelectedOrder(null);
    setSelectedUserDetails(null);
  };

  const handleAddSelectedToPending = async () => {
    const ordersToAdd = orders.filter((order) => selectedOrders.includes(order.id));
    try {
      for (const order of ordersToAdd) {
        await addDoc(collection(db, "pendingOrders"), {
          ...order,
          status: "Pending",
          message: "Your order will be ready within 20 mins",
          timestamp: Timestamp.fromDate(new Date()),
        });

        const orderRef = doc(db, "OrderNow", order.id);
        await deleteDoc(orderRef);
      }

      setOrders((prevOrders) =>
        prevOrders.filter((order) => !selectedOrders.includes(order.id))
      );
      setSelectedOrders([]);

      navigate("/pending", {
        state: {
          pendingOrders: ordersToAdd,
          message: "Selected orders added to pending successfully!",
        },
      });
    } catch (error) {
      console.error("Error moving orders to pending:", error);
    }
  };

  const handleSelectOrder = (orderId) => {
    setSelectedOrders((prevSelectedOrders) =>
      prevSelectedOrders.includes(orderId)
        ? prevSelectedOrders.filter((id) => id !== orderId)
        : [...prevSelectedOrders, orderId]
    );
  };

  return (
    <div className="order-list">
      <h1 className="order-list__title">Order Details</h1>
      <button
        className="order-list__add-button"
        onClick={handleAddSelectedToPending}
        disabled={selectedOrders.length === 0}
      >
        Add Selected to Pending
      </button>
      <div className="order-list__table-container">
        <table className="order-list__table">
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setSelectedOrders(
                      checked ? orders.map((order) => order.id) : []
                    );
                  }}
                  checked={selectedOrders.length === orders.length}
                />
              </th>
              <th>Order ID</th>
              <th>User Email</th>
              <th>Product Name(s)</th>
              <th>Total Price</th>
              <th>Timestamp</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
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
                <td>
                  {order.items.map((item) => item.productName).join(", ")}
                </td>
                <td>Rs. {order.totalPrice.toFixed(2)}</td>
                <td>
                  {order.createdAt &&
                    new Date(order.createdAt.seconds * 1000).toLocaleString()}
                </td>
                <td>
                  <button
                    className="order-list__details-button"
                    onClick={() => handleShowDetails(order)}
                  >
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedOrder && selectedUserDetails && (
        <OrderDetailsModal
          order={selectedOrder}
          userDetails={selectedUserDetails}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default OrderList;
